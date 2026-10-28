import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
// Ordered, shared by runtime selection and generated documentation. No tool calls
// another advertised tool: backend/runtime dependencies are not model tools.
export const GROUPS = [
 {id:'screenshots',name:'Screenshot Studio',guide:'../screenshots/README.md',test:(n:string)=>/screenshot/.test(n)},
 {id:'build',name:'Build and app creation',guide:'../tooling/ios-build-agent.md',test:(n:string)=>/^ios_|^create_app$/.test(n)},
 {id:'design',name:'Color and backend',guide:'../backend/overview.md',test:(n:string)=>/color_system|backend_integration/.test(n)},
 {id:'integrations',name:'Apple integrations',guide:'../integrations/README.md',test:(n:string)=>/system_integration|apple_permissions|apple_capabilities/.test(n)},
 {id:'review',name:'Source reviews',guide:'#choosing-a-tool',test:(n:string)=>/^(review_|analyze_|check_availability|audit_|lint_skill)/.test(n)},
 {id:'apple-docs',name:'Apple documentation and local references',guide:'knowledge-server.md',test:(n:string)=>/^(search_apple|get_apple|plan_ios_app|plan_app_icon|search_local|read_local|get_reference|apple_docs_|xcode_mcp_)/.test(n)},
 {id:'simulator',name:'Simulator and Xcode',guide:'../tooling/ios-simulator-mcp.md',test:(n:string)=>/^(simulator_|install_app|launch_app|terminate_app|open_deep_link|build_project|run_tests)/.test(n)},
 {id:'feedback',name:'Failure reports',guide:'../tooling/issue-reporting.md',test:(n:string)=>/issue_report|private_feedback/.test(n)},
 {id:'other',name:'Other tools',guide:'tools.md',test:(_:string)=>true},
] as const;
export const PROFILES: Record<string, readonly string[]> = {
 all: GROUPS.map(g=>g.id), build:['build','simulator','apple-docs'], review:['review','apple-docs'], docs:['apple-docs'], design:['design','screenshots','integrations'],
};
export interface Entry { tool: Tool; groups: string[]; dependencies: string[]; runtime: string; handler: (args:Record<string,unknown>,signal?:AbortSignal)=>Promise<CallToolResult> }
export function groupFor(name:string) { return GROUPS.find(g=>g.test(name))!; }
export function select(entries:Entry[], groups:readonly string[]):Entry[] {
 for(const g of groups)if(!GROUPS.some(x=>x.id===g))throw Error(`Unknown tool group ${g}. Use tool-groups to list choices; --tool-profile all restores all tools.`);
 const byName=new Map(entries.map(e=>[e.tool.name,e]));if(byName.size!==entries.length)throw Error('Duplicate tool identifier');
 const names=new Set<string>();
 function include(name:string,stack:string[]=[]){if(stack.includes(name))throw Error('Cyclic tool dependency');if(names.has(name))return;const e=byName.get(name);if(!e)throw Error('Missing tool dependency: '+name);for(const d of [...e.dependencies].sort())include(d,[...stack,name]);names.add(name);}
 for(const e of entries)if(e.groups.some(g=>groups.includes(g)))include(e.tool.name);
 return entries.filter(e=>names.has(e.tool.name));
}
export function configuration(args:string[],env:NodeJS.ProcessEnv=process.env){
 const rest:string[]=[];const flags=new Map<string,string>();
 for(let i=0;i<args.length;i++){const a=args[i]!;if(['--tool-profile','--tool-groups','--output-chars'].includes(a)){if(!args[i+1]||args[i+1]!.startsWith('--'))throw Error('Missing value for '+a);if(flags.has(a))throw Error('Duplicate option '+a);flags.set(a,args[++i]!);}else rest.push(a);}
 if(flags.has('--tool-profile')&&flags.has('--tool-groups'))throw Error('Choose --tool-profile OR --tool-groups');
 const profile=flags.get('--tool-profile') ?? (!flags.has('--tool-groups')&&!env.IOS_AGENT_TOOL_GROUPS ? env.IOS_AGENT_TOOL_PROFILE : undefined);
 const groupText=flags.get('--tool-groups') ?? (!flags.has('--tool-profile')?env.IOS_AGENT_TOOL_GROUPS:undefined);
 if(profile&&!PROFILES[profile])throw Error(`Unknown tool profile ${profile}. Use tool-groups; --tool-profile all restores defaults.`);
 if(groupText!==undefined&&!groupText.trim())throw Error('Tool groups cannot be empty');
 const groups=groupText?groupText.split(',').map(s=>s.trim()):[...(PROFILES[profile??'all']!)];
 if(groups.some(g=>!g)||!groups.length)throw Error('Tool groups cannot be empty');
 for(const g of groups)if(!GROUPS.some(x=>x.id===g))throw Error(`Unknown tool group ${g}; use --tool-profile all to restore all tools.`);
 const outputChars=Number(flags.get('--output-chars')??env.IOS_AGENT_OUTPUT_CHARS??0);
 if(!Number.isInteger(outputChars)||(outputChars!==0&&(outputChars<1024||outputChars>1000000)))throw Error('output-chars must be 0 (disabled) or 1024–1000000');
 return {rest,groups:[...new Set(groups)].sort(),profile:groupText?null:profile??'all',outputChars};
}
