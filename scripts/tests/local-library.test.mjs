import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildLibrary,searchLibrary,readLibrary} from '../lib/local-library.mjs';

test('builder keeps canonical paths but stores identical content once and excludes external/build files',()=>{
  const root=mkdtempSync(join(tmpdir(),'ios-library-'));
  try {
    for(const name of ['docs','patterns','checklists','templates','samples']) mkdirSync(join(root,name));
    writeFileSync(join(root,'samples','one.swift'),'import Foundation\nlet title = "Books"\n');
    writeFileSync(join(root,'templates','two.swift'),'import Foundation\nlet title = "Books"\n');
    mkdirSync(join(root,'samples','.build'));
    writeFileSync(join(root,'samples','.build','hidden.swift'),'secret');
    mkdirSync(join(root,'samples','.ios-agent'));
    writeFileSync(join(root,'samples','.ios-agent','state.json'),'{"private":true}');
    writeFileSync(join(root,'outside.swift'),'outside');
    symlinkSync(join(root,'outside.swift'),join(root,'samples','linked.swift'));
    const library=buildLibrary(root);
    assert.equal(library.files.length,2);
    assert.equal(Object.keys(library.blobs).length,1);
    assert.equal(searchLibrary(library,'Foundation',8,'source').length,2);
    assert.equal(searchLibrary(library,'Foundation',8,'guide').length,0);
    assert.match(readLibrary(library,'outside.swift').error,/Unknown/);
    assert.equal(readLibrary(library,'samples/one.swift',0,7).nextOffset,7);
  } finally {rmSync(root,{recursive:true,force:true});}
});
