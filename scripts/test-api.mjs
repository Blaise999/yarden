import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Run only against a disposable LOCAL development database; creates QA records.
const base=process.argv[2]||'http://127.0.0.1:4173';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Local disposable test servers only');
let count=0;
async function call(route,{method='GET',body,cookie,origin=base,raw}={}){
 const response=await fetch(base+route,{method,headers:{...(method!=='GET'?{Origin:origin,'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:raw??(body===undefined?undefined:JSON.stringify(body))});
 const json=await response.json();return {response,json};
}
function status(r,code,label){assert.equal(r.response.status,code,label+': '+JSON.stringify(r.json));console.log('PASS '+label);count++;}
const unique=Date.now();
status(await call('/api/health'),200,'configured development health');
status(await call('/api/admin/cms'),401,'CMS unauthorized read');
status(await call('/api/admin/passes'),401,'passes private');
status(await call('/api/admin/subscribers'),401,'subscribers private');
status(await call('/api/passes',{method:'POST',origin:'null',body:{}}),403,'malformed origin rejected');
status(await call('/api/passes',{method:'POST',origin:'https://foreign.invalid',body:{}}),403,'cross origin rejected');
status(await call('/api/passes',{method:'POST',raw:'null'}),400,'null registration rejected');
status(await call('/api/newsletter',{method:'POST',raw:'{'}),400,'malformed newsletter rejected');
status(await call('/api/newsletter',{method:'POST',body:{email:'qa@example.invalid',consent:false}}),400,'consent required');
let r=await call('/api/passes',{method:'POST',body:{name:'Yarden QA',email:`qa-${unique}@example.invalid`,gender:'female'}});status(r,201,'pass created');
const member=r.response.headers.get('set-cookie').split(';')[0],id=r.json.pass.id;
assert.ok(r.response.headers.get('set-cookie').includes('HttpOnly'));assert.equal(r.json.pass.anonId,undefined);
r=await call('/api/passes',{cookie:member});status(r,200,'cookie bound retrieval');assert.equal(r.json.pass.id,id);
r=await call('/api/passes',{method:'POST',cookie:member,body:{name:'Overwrite'}});status(r,200,'pass cannot be overwritten');assert.equal(r.json.pass.id,id);
r=await call('/api/passes');assert.equal(r.json.pass,null);count++;console.log('PASS other visitors cannot read pass');
for(let i=0;i<2;i++)status(await call('/api/newsletter',{method:'POST',body:{email:`qa-${unique}@example.invalid`,consent:true}}),200,'newsletter '+(i?'duplicate':'signup'));
const env=await readFile('.env.local','utf8');const setupToken=env.match(/^YARD_SETUP_TOKEN=(.+)$/m)?.[1];
const password='Local-QA-only-2026!';
const session=await call('/api/admin/session');
if(session.json.setupRequired){r=await call('/api/admin/setup',{method:'POST',body:{setupToken,password}});status(r,200,'admin bootstrap');}
r=await call('/api/admin/login',{method:'POST',body:{password}});status(r,200,'admin login');const admin=r.response.headers.get('set-cookie').split(';')[0];
r=await call('/api/admin/cms',{cookie:admin});status(r,200,'authenticated CMS read');const original=r.json.cms;
const edited={...original,site:{...original.site,title:'QA ANGEL'},newsletter:{...original.newsletter,pressItems:[]}};
status(await call('/api/admin/cms',{method:'PUT',cookie:admin,body:{cms:edited}}),200,'CMS save');
r=await call('/api/admin/cms',{cookie:admin});assert.equal(r.json.cms.site.title,'QA ANGEL');assert.equal(r.json.cms.newsletter.pressItems.length,0);count++;console.log('PASS edits and deletions persisted');
status(await call('/api/admin/cms',{method:'PUT',cookie:admin,body:{cms:{releases:[null]}}}),400,'invalid CMS structure rejected');
status(await call('/api/admin/cms',{method:'PUT',cookie:admin,body:{cms:original}}),200,'CMS restored');
status(await call('/api/admin/passes',{cookie:admin}),200,'admin sees passes');
status(await call('/api/admin/subscribers',{cookie:admin}),200,'admin sees subscribers');
status(await call('/api/admin/login',{method:'DELETE',cookie:admin}),200,'logout');
console.log(`API assertions completed: ${count} checks plus identity assertions.`);
