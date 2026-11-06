import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendEmail,sendSubscriberWelcome,emailConfigured,siteOrigin} from '../libs/email';
test('Resend payload, unsubscribe headers, errors and configuration', async()=>{
 process.env.RESEND_API_KEY='re_test';process.env.EMAIL_FROM='Yarden <hello@example.invalid>';process.env.NEXT_PUBLIC_SITE_URL='https://example.invalid';
 assert.equal(emailConfigured(),true);assert.equal(siteOrigin(),'https://example.invalid');
 const real=globalThis.fetch;let sent:any;
 try {
 globalThis.fetch=async (_url,options)=>{sent=JSON.parse(String(options?.body));return new Response(JSON.stringify({id:'mock-email'}),{status:200});};
 assert.equal((await sendSubscriberWelcome('qa@example.invalid',{page:'https://example.invalid/unsubscribe?token=abc',oneClick:'https://example.invalid/api/unsubscribe?token=abc'})).sent,true);
 assert.deepEqual(sent.to,['qa@example.invalid']);assert.equal(sent.headers['List-Unsubscribe-Post'],'List-Unsubscribe=One-Click');assert.ok(sent.html.includes('Unsubscribe'));
 globalThis.fetch=async()=>new Response('{}',{status:429});
 assert.equal((await sendEmail({to:'qa@example.invalid',subject:'QA',text:'QA',html:'QA'})).sent,false);
 delete process.env.RESEND_API_KEY;assert.equal(emailConfigured(),false);
 }finally{globalThis.fetch=real;}
});
