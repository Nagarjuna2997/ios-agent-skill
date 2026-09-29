import { configSchema,type AIConfig } from './config.js';
import { selectModel,type Capability } from './registry.js';
import { ProviderFailure,type Adapter,type Response } from './providers.js';
export async function route(input:AIConfig,adapters:Adapter[],prompt:string,required:Capability[]=['text'],signal?:AbortSignal):Promise<Response & {attempts:string[]}> {
 const config=configSchema.parse(input);if(prompt.length>200000)throw new ProviderFailure('user-action-required','input-too-large');
 const first=config.provider==='auto'?config.fallbackOrder[0]:config.provider;
 const order=[...new Set([first,...(config.allowFallback?config.fallbackOrder:[])])];const attempts:string[]=[];
 for(const provider of order){
  if(!provider)continue;
  if(provider!=='apple'&&(config.privacy==='local-only'||!config.allowedCloudProviders.includes(provider))){attempts.push(`${provider}:privacy-blocked`);continue;}
  const adapter=adapters.find(a=>a.provider===provider);if(!adapter){attempts.push(`${provider}:not-configured`);continue;}
  for(let retry=0;retry<=config.maxRetries;retry++){
   if(signal?.aborted)throw new ProviderFailure('fatal','cancelled');
   try{const available=await adapter.list(signal);const model=selectModel(provider,provider===first?config.model:'auto',available,required);const response=await adapter.generate(model.modelId,prompt,signal);attempts.push(`${provider}:completed`);return {...response,attempts};}
   catch(error){const failure=error instanceof ProviderFailure?error:new ProviderFailure('user-action-required','model-selection');attempts.push(`${provider}:${failure.code}`);if(failure.kind==='fatal'||failure.kind==='user-action-required')throw failure;
    if(failure.kind==='retryable'&&retry<config.maxRetries){await new Promise<void>((resolve)=>setTimeout(resolve,250*2**retry));continue;}break;
   }
  }
 }
 throw new ProviderFailure('user-action-required','No eligible provider completed: '+attempts.join(', '));
}
