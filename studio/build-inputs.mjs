import { promises as fs } from 'node:fs';
import path from 'node:path';
// Conservative import boundary: arbitrary build scripts and external dependency graphs
// cannot be covered by a hash of the copied workspace. Refuse rather than claim coverage.
export async function validateImportedInputs(root) {
  const files=[];
  async function inventory(folder,relative="") {
    for(const entry of await fs.readdir(folder,{withFileTypes:true})) {
      if([".git",".build",".ios-agent","DerivedData","xcuserdata"].includes(entry.name))continue;
      const file=path.join(folder,entry.name),name=relative+entry.name;
      if(entry.isSymbolicLink())throw Error("Symbolic build inputs are unsupported");
      if(entry.isDirectory())await inventory(file,name+"/");
      else if(/\.(pbxproj|xcconfig|xcscheme)$/.test(name)) {
        if((await fs.stat(file)).size>500000)throw Error("Build configuration exceeds validation limit");
        if(files.length>=1000)throw Error("Too many build configurations");
        files.push({path:name});
      }
    }
  }
  await inventory(root);
  for (const file of files.filter(f => /\.(pbxproj|xcconfig|xcscheme)$/.test(f.path))) {
    const text = await fs.readFile(path.join(root, file.path), 'utf8');
    if (/PBXShellScriptBuildPhase|ExecutionAction|ShellScriptAction|scriptText|XCRemoteSwiftPackageReference|XCLocalSwiftPackageReference|PBXReferenceProxy/.test(text))
      throw Error('Imported verification requires a self-contained project without custom build scripts or external package/project references');
    if (/(?:\.\.\s*[\\/]|<absolute>|sourceTree\s*=\s*"?\/?(?:Users|Volumes|private|tmp)\b)/.test(text))
      throw Error('External or parent-relative build inputs are unsupported');
    for (const match of text.matchAll(/(?:path|projectDirPath|projectRoot|INFOPLIST_FILE|CODE_SIGN_ENTITLEMENTS)\s*=\s*("[^"]*"|[^;\n]+);/g)) {
      const value = match[1].replace(/^"|"$/g, '').trim();
      if (value.startsWith('/') || value.startsWith('~') || /\$[({](?!SRCROOT[)}]|PROJECT_DIR[)}])/.test(value))
        throw Error('Unresolved or absolute build input is unsupported');
    }
    for (const match of text.matchAll(/sourceTree\s*=\s*([^;]+);/g)) {
      if (!["<group>","SOURCE_ROOT","SDKROOT","BUILT_PRODUCTS_DIR","DEVELOPER_DIR"].includes(match[1].trim().replace(/^"|"$/g, "")))
        throw Error('Custom Xcode source roots are unsupported');
    }
    for (const match of text.matchAll(/#include\??\s*["<]([^">]+)[">]/g)) {
      const target = await fs.realpath(path.resolve(root, path.dirname(file.path), match[1]));
      if (!target.startsWith((await fs.realpath(root)) + path.sep)) throw Error('Configuration include escapes project');
    }
  }
}
