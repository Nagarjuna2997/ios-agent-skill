#!/usr/bin/env python3
"""Build self-contained plugin ZIPs and npm tarballs for GitHub Releases."""
import hashlib
import json
import pathlib
import subprocess
import tempfile
import zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'dist-release'

def main():
    OUT.mkdir(exist_ok=True)
    paths=[]
    for name in ('ios-agent-skill','ios-agent-chatgpt'):
        archive=OUT/(name+'.zip')
        plugin=ROOT/'plugins'/name
        with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
            for p in sorted(plugin.rglob('*')):
                if p.is_file() and '__pycache__' not in p.parts:
                    z.write(p,p.relative_to(plugin).as_posix())
            for folder in ('docs','patterns','templates','checklists','samples'):
                for p in sorted((ROOT/folder).rglob('*')):
                    if p.is_file() and p.name!='.DS_Store' and not any(part in {'.build','node_modules','__pycache__'} for part in p.parts):
                        z.write(p,'skills/ios-builder/'+p.relative_to(ROOT).as_posix())
            for script in ('scripts/query-library.mjs','scripts/lib/local-library.mjs'):
                z.write(ROOT/script,'skills/ios-builder/'+script)
            # Maintenance scripts aren't needed at runtime; implementation templates and all references are bundled.
            z.write(ROOT/'LICENSE','LICENSE')
        with zipfile.ZipFile(archive) as z:
            names=z.namelist()
            assert len(names)==len(set(names)), 'Duplicate ZIP paths'
            assert '.codex-plugin/plugin.json' in names
            assert 'skills/ios-builder/docs/apple/technologies.json' in names
            assert 'skills/ios-builder/docs/design/icon-composer.md' in names
            json.loads(z.read('.codex-plugin/plugin.json'))
        paths.append(archive)
    for folder in ('mcp-server','cli'):
        result=subprocess.run(['npm','pack','--ignore-scripts','--json','--pack-destination',str(OUT)],cwd=ROOT/folder,capture_output=True,text=True,check=True)
        path=OUT/json.loads(result.stdout)[0]['filename'];paths.append(path)
    (OUT/'SHA256SUMS').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in paths))
    print('\n'.join(f'{p.name}: {p.stat().st_size} bytes' for p in paths))

if __name__=='__main__':main()
