"""Offline, allowlisted metrics. Never executes a provider or retains transcript text."""
import collections
import difflib
import json
import math
import shlex

VERSION = 'event-metrics-1'
FORMATS = {'codex-jsonl-1', 'claude-stream-json-1'}
TOKEN_FIELDS = ('input_tokens', 'output_tokens', 'cached_input_tokens',
                'cache_read_input_tokens', 'cache_creation_input_tokens', 'reasoning_tokens')


def number(value):
    return value if type(value) in (int, float) and math.isfinite(value) and value >= 0 else None


def command_kind(command):
    """Direct commands only. Shells/scripts and compound commands stay unknown."""
    if not isinstance(command, str):
        return None
    try:
        words = shlex.split(command)
    except (ValueError, TypeError):
        return None
    if not words or any(x in command for x in (';', '|', '&&', '\n', '$(', '`')):
        return None
    executable = words[0].rsplit('/', 1)[-1]
    if executable == 'swift' and len(words) > 1 and words[1] in ('build', 'test'):
        return words[1]
    if executable == 'swiftc':
        return 'build'
    if executable == 'xcodebuild':
        if any(x in words for x in ('test', 'test-without-building')):
            return 'test'
        if any(x in words for x in ('build', 'build-for-testing')):
            return 'build'
    return None


def parse_events(text, event_format):
    if event_format not in FORMATS:
        raise ValueError('Unsupported event schema')
    events, malformed = [], 0
    for line in text.splitlines():
        if not line.strip():
            continue
        try:
            event = json.loads(line)
            if not isinstance(event, dict):
                raise ValueError()
            events.append(event)
        except ValueError:
            malformed += 1
    calls, turns, usages = {}, set(), {}
    complete, failure, observed = False, False, False
    retry_ids = set()
    retry_observer = False
    missing_ids = False
    for position, event in enumerate(events):
        kind = event.get('type')
        if 'id' in event and (not isinstance(event['id'], str) or not event['id']):
            malformed += 1
            continue
        if any(key in event and not isinstance(event[key], dict) for key in ('item', 'message')):
            malformed += 1
            continue
        message = event.get('message', {})
        if 'content' in message and (not isinstance(message['content'], list) or any(not isinstance(item, dict) for item in message['content'])):
            malformed += 1
            continue
        if any('input' in item and not isinstance(item['input'], dict) for item in message.get('content', [])):
            malformed += 1
            continue
        if kind == 'benchmark.retry-observer.v1':
            retry_observer = True
        if kind == 'benchmark.retry.v1' and isinstance(event.get('id'), str):
            retry_ids.add(event['id'])
        if event_format == 'codex-jsonl-1':
            if kind in ('thread.started', 'turn.started', 'turn.completed', 'turn.failed', 'item.started', 'item.completed'):
                observed = True
            if kind == 'turn.started':
                complete = False
            if kind == 'turn.completed':
                turn_id = event.get('id', 'event-'+str(position))
                turns.add(turn_id)
                usages[turn_id] = event.get('usage')
                complete = True
            if kind in ('turn.failed', 'error'):
                failure = True
            item = event.get('item') or {}
            if kind in ('item.started', 'item.completed') and item.get('type') in ('command_execution', 'mcp_tool_call', 'web_search', 'file_change'):
                ident = item.get('id')
                if not isinstance(ident, str) or not ident:
                    missing_ids = True
                    continue
                calls[ident] = {'command': item.get('command') if item.get('type') == 'command_execution' else None,
                                'shell': item.get('type') == 'command_execution',
                                'failed': number(item.get('exit_code')) not in (None, 0)}
        else:
            if kind in ('system', 'assistant', 'result', 'user'):
                observed = True
            if kind == 'assistant':
                complete = False
                message = event.get('message') or {}
                ident = message.get('id')
                if isinstance(ident, str) and ident:
                    turns.add(ident)
                else:
                    missing_ids = True
                for item in message.get('content', []):
                    if item.get('type') == 'tool_use':
                        ident = item.get('id')
                        if not isinstance(ident, str) or not ident:
                            missing_ids = True
                            continue
                        calls[ident] = {'command': (item.get('input') or {}).get('command') if item.get('name') == 'Bash' else None,
                                        'shell': item.get('name') == 'Bash', 'failed': None}
            if kind == 'user':
                for item in (event.get('message') or {}).get('content', []):
                    if item.get('type') == 'tool_result' and isinstance(item.get('tool_use_id'), str) and item.get('tool_use_id') in calls:
                        calls[item['tool_use_id']]['failed'] = item.get('is_error') is True
            if kind == 'result':
                complete = True
                failure = event.get('is_error') is True or event.get('subtype', 'success') != 'success'
                usages = {'result': event.get('usage')}  # terminal cumulative counters; not per-message sum
    attempts = collections.Counter()
    unknown_commands = 0
    for call in calls.values():
        if call['shell']:
            classified = command_kind(call['command'])
            if classified:
                attempts[classified] += 1
            else:
                unknown_commands += 1
    known = observed and not malformed and not missing_ids
    tokens = {}
    for key in TOKEN_FIELDS:
        values = [number(u.get(key)) if isinstance(u, dict) else None for u in usages.values()]
        tokens[key] = sum(values) if values and all(v is not None for v in values) else None
    return {'parser_version': VERSION, 'event_format': event_format,
            'stream_complete': complete and not malformed,
            'provider_failure': failure, 'malformed_events': malformed,
            'agent_turns': len(turns) if known else None,
            'turn_scope': 'top-level completed turns' if event_format.startswith('codex') else 'assistant messages',
            'tool_calls': len(calls) if known else None,
            'observed_build_attempts': attempts['build'] if known else None,
            'observed_test_attempts': attempts['test'] if known else None,
            'repeated_build_invocations': max(0, attempts['build']-1) if known else None,
            'repeated_test_invocations': max(0, attempts['test']-1) if known else None,
            'retries': len(retry_ids) if retry_observer and known else None,
            'indirect_commands': unknown_commands if known else None,
            'tokens': tokens,
            'scope': 'Observed direct invocations only; nested commands and retry intent are unknown.'}


def diff_size(before, after):
    """Path->bytes maps from the synthetic fixture only; paths/content never returned."""
    added = deleted = changed = binary = 0
    for name in set(before) | set(after):
        a, b = before.get(name, b''), after.get(name, b'')
        if a == b and name in before and name in after:
            continue
        changed += 1
        try:
            if b'\0' in a or b'\0' in b:
                raise UnicodeError()
            left, right = a.decode('utf-8').splitlines(), b.decode('utf-8').splitlines()
        except UnicodeError:
            binary += 1
            continue
        for op, i, j, k, l in difflib.SequenceMatcher(None, left, right, autojunk=False).get_opcodes():
            if op in ('replace', 'delete'):
                deleted += j-i
            if op in ('replace', 'insert'):
                added += l-k
    return dict(changed_files=changed, added_lines=added, deleted_lines=deleted, binary_files=binary)


def measurement(events, event_format, *, provider_seconds, scorer_seconds, worker_count,
                cache_condition, before, after, initial_diagnostics, final_diagnostics):
    if type(worker_count) is not int or worker_count < 1:
        raise ValueError('Worker count must be pinned')
    if cache_condition not in ('cold', 'warm', 'mixed', 'unknown'):
        raise ValueError('Explicit cache condition required')
    result = parse_events(events, event_format)
    result.update(provider_seconds=number(provider_seconds), scorer_seconds=number(scorer_seconds),
                  worker_count=worker_count, cache_condition=cache_condition,
                  diff=diff_size(before, after))
    # Accept counts, never raw diagnostic strings or messages.
    result['diagnostics'] = {}
    for key in ('warnings', 'errors'):
        a, b = number(initial_diagnostics.get(key)), number(final_diagnostics.get(key))
        result['diagnostics'][key] = dict(initial=a, final=b, delta=b-a if a is not None and b is not None else None)
    return result


def compare(cells):
    """No pooled clients/protocols; no imputation; only complete matched pairs."""
    groups = collections.defaultdict(dict)
    contexts = {(c['client'], c['protocol_hash']) for c in cells}
    if len(contexts) > 1:
        raise ValueError('Select one client and frozen protocol')
    for cell in cells:
        key = (cell['task'], cell['trial'])
        arm = cell['arm']
        if arm not in ('baseline', 'skill') or arm in groups[key]:
            raise ValueError('Invalid or duplicate arm')
        groups[key][arm] = cell
    output = []
    for (task, trial), pair in sorted(groups.items()):
        row = dict(task=task, trial=trial)
        statuses = {c['status'] for c in pair.values()}
        if len(pair) != 2:
            row['status'] = 'incomplete'
        elif statuses != {'completed'}:
            row['status'] = 'not_compared'
            row['arm_statuses'] = {a: c['status'] for a, c in pair.items()}
        else:
            a, b = pair['baseline']['metrics'], pair['skill']['metrics']
            if not all(m['stream_complete'] and not m['provider_failure'] for m in (a,b)):
                row['status'] = 'incomplete_events'
            elif a['worker_count'] != b['worker_count'] or a['cache_condition'] != b['cache_condition'] or a['cache_condition'] == 'unknown' or any(a[k] != b[k] for k in ('parser_version', 'event_format', 'turn_scope')):
                row['status'] = 'incompatible_conditions'
            else:
                row['status'] = 'paired'
                row['skill_minus_baseline'] = {k: b[k]-a[k] if number(a[k]) is not None and number(b[k]) is not None else None
                                              for k in ('agent_turns','tool_calls','observed_build_attempts','observed_test_attempts','provider_seconds','scorer_seconds')}
                row['token_deltas'] = {k: b['tokens'][k]-a['tokens'][k] if number(a['tokens'][k]) is not None and number(b['tokens'][k]) is not None else None for k in TOKEN_FIELDS}
        output.append(row)
    return {'pairs': output, 'note': 'Descriptive matched differences only; no cost or savings claim.'}
