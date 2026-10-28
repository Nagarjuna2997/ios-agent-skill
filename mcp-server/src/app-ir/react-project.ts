// Bounded local module linking. Imported application JavaScript never executes.
import ts from 'typescript';
import {dirname,basename,resolve,relative,isAbsolute,sep} from 'node:path';
import {realpath,lstat} from 'node:fs/promises';
import {readBoundedFile} from './html.js';
import {reactToIR} from './react.js';
import {AppIRSchema,sha256,type AppIR} from './schema.js';
interface Module {path:string;source:string;lowered:string;functions:Set<string>;exports:Set<string>;defaultName?:string;imports:Array<{name:string;target:string;isDefault:boolean}>}
export async function importReactProject(entryPath:string,name='ImportedApp'):Promise<AppIR>{
  const entry=resolve(entryPath);
  if((await lstat(entry)).isSymbolicLink())throw Error('React entry symlinks are unsupported');
  const root=await realpath(dirname(entry));
  const modules=new Map<string,Module>(),visiting=new Set<string>();let total=0;
  const inside=(path:string)=>{const r=relative(root,path);if(r==='..'||r.startsWith('..'+sep)||isAbsolute(r))throw Error('React imports must stay inside the entry directory');};
  async function load(path:string):Promise<Module>{
    const parent=await realpath(dirname(path));inside(parent);path=resolve(parent,basename(path));
    if(visiting.has(path))throw Error('Cyclic React module imports are unsupported');
    const saved=modules.get(path);if(saved)return saved;
    if(modules.size>=32)throw Error('React project exceeds 32 source files');
    const source=new TextDecoder('utf-8',{fatal:true}).decode(await readBoundedFile(path));
    total+=Buffer.byteLength(source);if(total>262144)throw Error('React project exceeds 256 KiB');
    const file=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    if((file as ts.SourceFile&{parseDiagnostics:readonly ts.Diagnostic[]}).parseDiagnostics.length)throw Error('Invalid TSX syntax');
    const row:Module={path,source,lowered:source,functions:new Set(),exports:new Set(),imports:[]};
    modules.set(path,row);visiting.add(path);
    const edits:Array<{start:number;end:number}>=[];
    for(const statement of file.statements){
      if(ts.isFunctionDeclaration(statement)&&statement.name){
        const id=statement.name.text;row.functions.add(id);
        if(statement.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))row.exports.add(id);
        const modifier=statement.modifiers?.find(m=>m.kind===ts.SyntaxKind.DefaultKeyword);
        if(modifier){if(row.defaultName)throw Error('Multiple default React exports');row.defaultName=id;if(path!==resolve(root,basename(entry)))edits.push({start:modifier.getStart(file),end:modifier.end});}
      }
      if(!ts.isImportDeclaration(statement))continue;
      if(!ts.isStringLiteral(statement.moduleSpecifier))throw Error('React module path must be literal');
      const target=statement.moduleSpecifier.text;
      if(!target.startsWith('.')){if(path!==resolve(root,basename(entry)))throw Error('Dependency modules support only local component imports');continue;}
      if(!/^\.\/[A-Za-z0-9_/-]+(?:\.tsx)?$/.test(target)||target.split('/').some(p=>p==='..')||target.includes('//'))throw Error('Unsupported React import path');
      const clause=statement.importClause;
      if(!clause||clause.isTypeOnly||statement.attributes||clause.namedBindings&&!ts.isNamedImports(clause.namedBindings))throw Error('Only direct default/named component imports are supported');
      const targetPath=resolve(dirname(path),target.endsWith('.tsx')?target:target+'.tsx');inside(targetPath);
      if(clause.name)row.imports.push({name:clause.name.text,target:targetPath,isDefault:true});
      if(clause.namedBindings&&ts.isNamedImports(clause.namedBindings))for(const spec of clause.namedBindings.elements){
        if(spec.propertyName||spec.isTypeOnly)throw Error('Aliased/type component imports are unsupported');
        row.imports.push({name:spec.name.text,target:targetPath,isDefault:false});
      }
      if(!clause.name&&(!clause.namedBindings||!clause.namedBindings.elements.length))throw Error('Empty component imports are unsupported');
      edits.push({start:statement.getStart(file),end:statement.end});
    }
    const visible=new Set(row.functions);
    for(const imported of row.imports){
      if(visible.has(imported.name))throw Error('Duplicate or shadowed component import');visible.add(imported.name);
      const dependency=await load(imported.target);
      if(imported.isDefault?dependency.defaultName!==imported.name:!dependency.exports.has(imported.name)||dependency.defaultName===imported.name)throw Error('Component import must match its declared exported function name');
    }
    // Linking must not make an unimported component from another file visible.
    const walk=(node:ts.Node)=>{
      if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
        const tag=node.tagName.getText(file);
        if(/^[A-Z]/.test(tag)&&!visible.has(tag)&&!(path===resolve(root,basename(entry))&&['MemoryRouter','Routes','Route','Link'].includes(tag)))throw Error('Component is not imported in its source module: '+tag);
      }
      ts.forEachChild(node,walk);
    };walk(file);
    for(const edit of edits.sort((a,b)=>b.start-a.start))row.lowered=row.lowered.slice(0,edit.start)+source.slice(edit.start,edit.end).replace(/[^\r\n]/gu,c=>' '.repeat(Buffer.byteLength(c)))+row.lowered.slice(edit.end);
    visiting.delete(path);return row;
  }
  const main=await load(entry);
  if(modules.size===1)return reactToIR(main.source,basename(entry),name);
  const rows=[main,...[...modules.values()].filter(m=>m!==main).sort((a,b)=>a.path.localeCompare(b.path))];
  const declared=new Set<string>();for(const module of rows)for(const id of module.functions){if(declared.has(id))throw Error('Component names must be unique across linked modules: '+id);declared.add(id);}
  let combined='';const regions=rows.map((module,index)=>{const start=Buffer.byteLength(combined);combined+=module.lowered+'\n';return {module,id:'source-'+(index+1),start,end:Buffer.byteLength(combined)-1};});
  const ir=reactToIR(combined,basename(entry),name);
  for(const row of [...ir.nodes,...ir.requirements,...ir.limitations,...(ir.states??[])])for(const e of row.evidence){
    const region=regions.find(r=>e.start>=r.start&&e.end<=r.end);if(!region)throw Error('Linked source evidence crosses module boundaries');e.source=region.id;e.start-=region.start;e.end-=region.start;
  }
  ir.sources=regions.map(r=>({id:r.id,path:relative(root,r.module.path).split(sep).join('/'),sha256:sha256(r.module.source),bytes:Buffer.byteLength(r.module.source),adapter:'react-local-modules@1'}));
  return AppIRSchema.parse(ir);
}
