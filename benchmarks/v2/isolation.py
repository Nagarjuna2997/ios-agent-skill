"""Offline command sandbox specification for a FUTURE external agent driver.
No model client runs here. No fallback to host execution is allowed.
"""
import pathlib,re,os

def tool_command(workspace,image,argv,lane='portable'):
 if lane!='portable':raise ValueError('Apple agent execution requires a separate disposable macOS VM; host fallback is forbidden')
 work=pathlib.Path(workspace).resolve()
 if not re.fullmatch(r'[a-zA-Z0-9./_-]+@sha256:[a-f0-9]{64}',image):raise ValueError('Pin a preloaded toolchain image by digest')
 if not work.is_dir() or not argv:raise ValueError('Export and command required')
 if any(p.is_symlink() for p in work.rglob('*')):raise ValueError('No symlink mounts')
 forbidden={'oracle','reference','.git','protocol.json','harness.py','Check.swift','Seed.swift'}
 if any(p.name in forbidden for p in work.rglob('*')):raise ValueError('Evaluator content cannot enter the agent sandbox')
 uid,gid=os.getuid(),os.getgid()
 if uid==0:raise ValueError('Run the future agent tool driver as a non-root workspace owner')
 if work.stat().st_uid!=uid:raise ValueError('Workspace must belong to the unprivileged driver user')
 # Only the exported starter (and independently audited treatment files) is mounted.
 # No host HOME, checkout, evaluator path, Docker socket, credentials or network.
 return ['docker','run','--rm','--pull=never','--network=none','--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=256','--memory=4g',f'--user={uid}:{gid}','--tmpfs','/tmp:rw,nosuid,size=1g','--tmpfs','/home/sandbox:rw,nosuid,size=64m','--env','HOME=/home/sandbox','--mount',f'type=bind,src={work},dst=/workspace','--workdir','/workspace',image,*argv]
