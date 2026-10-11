/** Optional PostToolUse entry point. Reads metadata, never executes payload commands. */
import {reviewAvailability,availabilityExit} from './review.js';
let payload='';
for await(const chunk of process.stdin){payload+=chunk;if(payload.length>1_000_000){console.error('Availability hook input exceeds limit.');process.exit(2);}}
try{
 const input=JSON.parse(payload),path=input?.tool_input?.file_path??input?.tool_input?.path;
 if(typeof path==='string'&&path.endsWith('.swift')){
  const report=await reviewAvailability(process.env.CLAUDE_PROJECT_DIR??process.cwd(),{mode:'static'});
  const findings=report.targets.flatMap(t=>t.findings);
  console.log(JSON.stringify(report));
  if(availabilityExit(report)===2){console.error('Availability coverage is incomplete; this is not a passing compiler check.');process.exitCode=2;}
  if(findings.length){console.error('Availability review has static candidates. Read the report and confirm with the compiler; do not apply automatic repairs.');process.exitCode=2;}
 }
}catch{console.error('Availability hook could not inspect this project; this is not a passing check.');process.exitCode=2;}
