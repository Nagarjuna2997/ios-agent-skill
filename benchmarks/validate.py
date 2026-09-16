#!/usr/bin/env python3
import json,pathlib,subprocess,tempfile
ROOT=pathlib.Path(__file__).resolve().parent
cases=json.loads((ROOT/'cases.json').read_text())
assert len(cases)==20 and len({c['id'] for c in cases})==20
with tempfile.TemporaryDirectory() as d:
    p=pathlib.Path(d);main='import Foundation\n@main struct Checks { static func main() throws {\n'
    main+='\n'.join('do { '+c['assertions']+'; print("'+c['id']+' passed") }' for c in cases)+'\n} }'
    (p/'Checks.swift').write_text(main)
    subprocess.run(['swiftc','-swift-version','6',str(ROOT/'Reference.swift'),str(p/'Checks.swift'),'-o',str(p/'check')],check=True)
    subprocess.run([str(p/'check')],check=True)
