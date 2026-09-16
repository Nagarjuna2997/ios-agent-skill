import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareIssueReport } from '../dist/issue-report.js';
const input={feature:'asset-generation',symptom:'invalid-output',client:'claude',platform:'macos',reproducibility:'repeated'};
test('report is deterministic, local, and targets only the owned issue tracker',()=>{
 const a=prepareIssueReport(input),b=prepareIssueReport(input);assert.deepEqual(a,b);
 assert.equal(a.submitted,false);assert.equal(a.status,'local-preview');
 const u=new URL(a.submissionUrl);assert.equal(u.origin,'https://github.com');
 assert.equal(u.pathname,'/Nagarjuna2997/ios-agent-skill/issues/new');
 assert.equal(u.searchParams.get('body'),a.body);assert.equal(u.searchParams.get('title'),a.title);
 assert.match(new URL(a.searchUrl).searchParams.get('q'),new RegExp(a.fingerprint));
 assert.notEqual(prepareIssueReport({...input,symptom:'timeout'}).fingerprint,a.fingerprint);
});
test('arbitrary diagnostic text and unknown properties are rejected',()=>{
 for(const field of ['logs','source','token','path','title','body','url']) assert.throws(()=>prepareIssueReport({...input,[field]:'PRIVATE_SENTINEL'}));
 for(const field of Object.keys(input)) assert.throws(()=>prepareIssueReport({...input,[field]:'PRIVATE_SENTINEL'}));
 assert.throws(()=>prepareIssueReport(null));
 assert.throws(()=>prepareIssueReport({}));
});
test('omitted metadata stays unknown rather than being collected',()=>{
 const r=prepareIssueReport({feature:'installation',symptom:'timeout'});
 assert.match(r.body,/Client: unknown/);assert.match(r.body,/Platform: unknown/);
 assert.match(r.notice,/Nothing sent/);
});
