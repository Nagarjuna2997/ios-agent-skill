import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { importReact, reactToIR } from '../dist/app-ir/react.js';
import { parseIR } from '../dist/app-ir/schema.js';
import { renderSwiftUI } from '../dist/app-ir/swiftui.js';
const file = new URL('../../benchmarks/universal/reading-list/App.tsx',import.meta.url);
const source = await readFile(file,'utf8');
function edit(find,replacement) {
  assert.ok(source.includes(find), find);
  return source.replace(find,replacement);
}

test('keyed record links, parameter lookup and field edits retain traceable source ranges',async()=>{
  const ir=await importReact(fileURLToPath(file),'ReadingShelf');
  assert.equal(ir.schemaVersion,'1.7.0');
  assert.deepEqual(ir.collections[0].rows.map(r=>[r.id,r.values.title]),[['cedar-a','Cedar'],['cedar-b','Cedar']]);
  const list=ir.nodes.find(n=>n.kind==='record-list');
  assert.deepEqual(list.recordList,{collection:'collection-1',field:'title',screen:'screen-2'});
  assert.equal(ir.navigation.routes[1].path,'/books/:id');
  assert.equal(ir.navigation.routes[1].collection,list.recordList.collection);
  const field=ir.nodes.find(n=>n.kind==='textfield');
  assert.deepEqual(field.recordField,{collection:'collection-1',field:'title'});
  for(const [node,token] of [[ir.collections[0],'useState'],[list,'books.map'],[field,'event.target.value']]){
    assert.ok(node.evidence.some(e=>Buffer.from(source).subarray(e.start,e.end).toString().includes(token)));
  }
  const swift=renderSwiftUI(ir).source;
  assert.match(swift,/ForEach\(records_node_collection_1\)/);
  assert.match(swift,/NavigationLink\(value: "\/books\/" \+ record.id\)/);
  assert.match(swift,/fieldBinding\(\$records_node_collection_1, id: recordID, field: \\\.field_title\)/);
  assert.match(swift,/firstIndex\(where: \{ \$0.id == id \}\)/);
});

test('record shapes reject duplicate keys, unsafe ids, mixed fields, and executable data or handlers',()=>{
  for(const [find,replacement] of [
    ["id: 'cedar-b'","id: 'cedar-a'"],["id: 'cedar-b'","id: 'bad/path'"],
    ["title: 'Cedar'","title: 'A', title: 'B'"],["author: 'Jon Lake'","writer: 'Jon Lake'"],
    ["author: 'Jon Lake'","author: loadAuthor()"],["author: 'Jon Lake'","...remoteBook"],
    ['key={book.id}','key={book.title}'],['to={`/books/${book.id}`}','to={`/books/${book.title}`}'],
    ['{book.title}</Link>','{book.total}</Link>'],['book.id === id','book.id !== id'],
    ['...book, title: event.target.value','...book, author: event.target.value'],
    ['...book, title: event.target.value','...book, title: sanitize(event.target.value)'],
    [' : book))',' : fetch("/books")))'],['key={book.id}','onClick={send} key={book.id}'],
    ['books.find(book => book.id === id)','books.find(id => id.id === id)'],
    ['type="text" aria-label','type="password" aria-label'],
    ['path="/books/:id"','path="/books/:id/edit"']
  ]) assert.throws(()=>reactToIR(edit(find,replacement)),undefined,find);
});

test('the same mappings support renamed fields, parameters and a different route prefix',()=>{
  const changed=source.replaceAll('/books','/library').replaceAll(':id',':bookID').replaceAll('=== id','=== bookID')
    .replace('const { id }','const { bookID }').replaceAll('title:', 'caption:').replaceAll('.title','.caption');
  const ir=reactToIR(changed);
  assert.equal(ir.navigation.routes[1].path,'/library/:bookID');
  assert.equal(ir.nodes.find(n=>n.kind==='record-list').recordList.field,'caption');
  assert.match(renderSwiftUI(ir).source,/field: \\\.field_caption/);
});

test('IR enforces route ownership, stable ids, field schema and compatibility',()=>{
  for(const change of [
    ir=>ir.schemaVersion='1.6.0',
    ir=>ir.collections[0].rows[1].id=ir.collections[0].rows[0].id,
    ir=>delete ir.collections[0].rows[0].values.author,
    ir=>ir.nodes.find(n=>n.kind==='textfield').recordField.field='id',
    ir=>ir.nodes.find(n=>n.kind==='record-list').recordList.screen='screen-1',
    ir=>delete ir.navigation.routes[1].collection,
    ir=>ir.navigation.initialScreen='screen-2',
    ir=>ir.navigation.routes[0].path='/books/fixed',
    ir=>ir.nodes.find(n=>n.id==='screen-1-node-3').recordField={collection:'collection-1',field:'title'}
  ]) {
    const ir=reactToIR(source);change(ir);assert.throws(()=>parseIR(ir));
  }
});
