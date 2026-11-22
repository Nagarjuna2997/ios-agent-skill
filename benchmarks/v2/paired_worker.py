"""Disposable Docker tools for a single-file portable benchmark. No host execution fallback."""
import http.client
import json
import os
from pathlib import Path
import re
import subprocess
import uuid

from isolation import tool_command

# Multi-architecture official Swift 6.2.3 image index. Provision it before a run.
IMAGE = 'swift@sha256:6dd90eb2359663a2cde8f03e9951f488b23134b3b8fce20e9dcb6cada75dd803'
LIMIT = 65536


class InfrastructureError(RuntimeError):
    pass


class ProviderError(RuntimeError):
    pass


class Docker:
    def __init__(self, config_dir):
        # Empty config avoids inherited auth, proxies, CLI plugins and remote contexts.
        self.env = {'PATH': os.environ.get('PATH', '/usr/bin:/bin'),
                    'DOCKER_CONFIG': str(config_dir), 'HOME': str(config_dir)}
        self.image = IMAGE

    def run(self, workspace, args, *, stdin=None, evaluator=False, timeout=90):
        workspace = Path(workspace)
        # Both roles see exactly one read-only disposable export; the trusted
        # evaluator gets a separate copy. It never mounts the original oracle.
        # tool_command rejects evaluator material; use a neutral filename for
        # the trusted checker only inside the explicitly separate judge workspace.
        allowed = {'Solution.swift', 'Acceptance.swift'} if evaluator else {'Solution.swift', 'TASK.md'}
        if {p.name for p in workspace.iterdir()} != allowed:
            raise InfrastructureError('Unexpected workspace contents')
        if any(not p.is_file() or p.is_symlink() for p in workspace.iterdir()):
            raise InfrastructureError('Expected ordinary files in the workspace')
        cmd = tool_command(workspace, self.image, args)
        i = cmd.index('--mount') + 1
        if ',' in str(workspace.resolve()):
            raise InfrastructureError('Docker bind path cannot contain a comma')
        cmd[i] += ',readonly'
        name = 'ios-bench-' + uuid.uuid4().hex
        cmd[2:2] = ['--name', name, '--interactive', '--cpus=2', '--ipc=none',
                    '--ulimit', 'fsize=67108864:67108864', '--log-driver=none']
        try:
            proc = subprocess.run(cmd, env=self.env, input=stdin, stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE, timeout=timeout)
        except FileNotFoundError as exc:
            raise InfrastructureError('Docker CLI unavailable; no local fallback') from exc
        except (subprocess.TimeoutExpired, KeyboardInterrupt) as exc:
            subprocess.run(['docker', 'rm', '-f', name], env=self.env, capture_output=True, timeout=15)
            if isinstance(exc, KeyboardInterrupt):
                raise
            raise InfrastructureError('Container deadline expired') from exc
        if proc.returncode in (125, 126, 127) or proc.returncode < 0:
            raise InfrastructureError('Docker or tool unavailable (exit %s): %s' %
                                      (proc.returncode, proc.stderr.decode(errors='replace')[-400:]))
        return proc

    def probe(self, workspace):
        body = """set -eu
test "$(id -u)" != 0
test ! -e /var/run/docker.sock
test ! -e /workspace/Acceptance.swift
test ! -e /workspace/oracle
test ! -e /workspace/reference
test -z "$(ls -A "$HOME")"
test -z "$(ls /sys/class/net | grep -vx lo || true)"
! touch /workspace/probe 2>/dev/null || exit 2
! touch /root-fs-probe 2>/dev/null || exit 2
swift --version"""
        result = self.run(workspace, ['sh', '-c', body])
        if result.returncode or 'Swift version' not in result.stdout.decode():
            raise InfrastructureError('The isolation/toolchain probe failed')
        return result.stdout.decode().strip()

    def read_export(self, workspace):
        values = []
        for file in ('TASK.md', 'Solution.swift'):
            result = self.run(workspace, ['cat', '/workspace/' + file])
            if result.returncode or len(result.stdout) > LIMIT:
                raise InfrastructureError('Starter export could not be read')
            values.append(result.stdout.decode())
        return values

    def training_check(self, workspace):
        proc = self.run(workspace, ['sh', '-c',
            'swiftc -swift-version 6 -strict-concurrency=complete -warnings-as-errors -typecheck Solution.swift > /dev/null 2>&1'])
        return proc.returncode == 0

    def judge(self, workspace):
        # Ignore candidate output. Only the isolated process' exit status is used.
        # Toolchain availability is checked independently before each experiment.
        body = """swiftc -swift-version 6 -strict-concurrency=complete -warnings-as-errors -parse-as-library Solution.swift Acceptance.swift -o /tmp/verify >/dev/null 2>&1 || exit 20
timeout 30 /tmp/verify </dev/null >/dev/null 2>&1
code=$?
case "$code" in 0) exit 0;; 124|137) exit 23;; *) exit 21;; esac"""
        proc = self.run(workspace, ['sh', '-c', body], evaluator=True, timeout=150)
        if proc.returncode in (0, 20, 21):
            return {'compiled': proc.returncode != 20, 'behavior': proc.returncode == 0 if proc.returncode != 20 else None}
        raise InfrastructureError('Evaluator interrupted or timed out (exit %d)' % proc.returncode)


class LocalOllama:
    """One-shot, local, structured source replacement. The model has no host tools."""
    def __init__(self, model, digest):
        if not isinstance(model, str) or not re.fullmatch(r'[\w./:-]{1,120}', model) or 'cloud' in model.lower():
            raise ValueError('Choose a preloaded local model')
        if not re.fullmatch(r'[a-f0-9]{64}', digest or ''):
            raise ValueError('Pass the 64-character digest of the installed model')
        self.model, self.digest = model, digest

    def request(self, path, body=None, timeout=10):
        connection = http.client.HTTPConnection('127.0.0.1', 11434, timeout=timeout)
        try:
            connection.request('POST' if body is not None else 'GET', '/api/' + path,
                               None if body is None else json.dumps(body),
                               {'Content-Type': 'application/json'})
            response = connection.getresponse()
            content = response.read(2_000_001)
            if response.status != 200 or len(content) > 2_000_000:
                raise ProviderError('Local provider returned an error or oversized response')
            payload = json.loads(content)
            if not isinstance(payload, dict):
                raise ProviderError('Malformed local provider response')
            return payload
        except (OSError, http.client.HTTPException, ValueError) as exc:
            raise ProviderError('Local Ollama unavailable or invalid response') from exc
        finally:
            connection.close()

    def identify(self):
        models = self.request('tags').get('models', [])
        if not any(m.get('name') == self.model and m.get('digest') == self.digest
                   and m.get('details', {}).get('format') == 'gguf' for m in models):
            raise ProviderError('Pinned GGUF model is missing or changed')
        details = self.request('show', {'model': self.model})
        if details.get('remote_model') or details.get('remote_host'):
            raise ProviderError('Cloud-backed models are outside this offline benchmark')
        version = self.request('version').get('version')
        if not version:
            raise ProviderError('Missing observed Ollama version')
        return {'client': 'local-ollama-single-turn', 'client_version': version,
                'requested_model': self.model, 'observed_model': self.model + '@sha256:' + self.digest}

    def generate(self, prompt, settings):
        response = self.request('generate', {
            'model': self.model, 'prompt': prompt, 'stream': False, 'keep_alive': 0,
            'format': {'type': 'object', 'properties': {'source': {'type': 'string'}}, 'required': ['source']},
            'options': {'temperature': settings['temperature'], 'seed': settings['seed'],
                        'num_predict': settings['max_output_tokens']}}, timeout=180)
        if response.get('model') != self.model or response.get('done') is not True:
            raise ProviderError('Provider did not complete with the pinned model')
        self.identify()
        try:
            source = json.loads(response['response'])['source']
        except (KeyError, TypeError, ValueError) as exc:
            raise ProviderError('Provider returned invalid structured source') from exc
        if not isinstance(source, str) or not 0 < len(source.encode()) <= LIMIT:
            raise ProviderError('Provider returned missing or oversized source')
        fields = {'input_tokens': 'prompt_eval_count', 'output_tokens': 'eval_count',
                  'cached_tokens': 'prompt_eval_cached_count'}
        return source, {out: response.get(key) if type(response.get(key)) is int and response[key] >= 0 else None
                        for out, key in fields.items()}
