import {test} from 'node:test';
import assert from 'node:assert/strict';
import {withDevelopmentFeedback, DEVELOPMENT_FAILURE_GUIDANCE} from '../dist/development-feedback.js';
test('failure guidance preserves original evidence and metadata without mutation',()=>{
 const diagnostic={type:'text',text:'Build failed: missing module Example'};
 const input={isError:true,content:[diagnostic],structuredContent:{exitCode:65},_meta:{request:'local'}};
 const output=withDevelopmentFeedback(input);
 assert.equal(output.isError,true);
 assert.equal(output.content[0],diagnostic);
 assert.equal(output.structuredContent,input.structuredContent);
 assert.equal(output._meta,input._meta);
 assert.equal(input.content.length,1);
 assert.equal(output.content[1].text,DEVELOPMENT_FAILURE_GUIDANCE);
});
test('successful review findings and non-content responses stay untouched',()=>{
 for(const input of [{content:[{type:'text',text:'2 findings'}]},{isError:false,content:[]},{isError:true}])assert.equal(withDevelopmentFeedback(input),input);
});
test('repeated local failures each receive guidance without throttling',()=>{
 for(let i=0;i<3;i++)assert.equal(withDevelopmentFeedback({isError:true,content:[]}).content.length,1);
});
