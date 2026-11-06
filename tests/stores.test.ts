import type { YardPass } from "../libs/passTypes";
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('durable local stores, CMS edits, registration and unsubscribe', async () => {
 const old = process.cwd(); const dir = await mkdtemp(path.join(os.tmpdir(),'yard-test-'));
 process.chdir(dir); Object.assign(process.env,{NODE_ENV:'development'});
 delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
 delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
 try {
  const store=await import('../libs/persistence');
  const cms=await import('../libs/cmsStore');
  const audience=await import('../libs/audienceStore');
  const passes=await import('../libs/passStorage');
  assert.equal(await store.createRecord('unique',{a:1}),true);
  assert.equal(await store.createRecord('unique',{a:2}),false);
  assert.deepEqual(await store.readRecord('unique'),{a:1});
  const concurrent=await Promise.all(Array.from({length:20},()=>store.createRecord('race','winner')));
  assert.equal(concurrent.filter(Boolean).length,1);
  assert.equal(await store.rateLimited('rate',2),false);assert.equal(await store.rateLimited('rate',2),false);assert.equal(await store.rateLimited('rate',2),true);
  const original=await cms.getCms();
  const edited=await cms.putCms({...original,newsletter:{...original.newsletter,pressItems:[]},releases:original.releases.slice(1)});
  assert.equal(edited.newsletter.pressItems.length,0);
  assert.equal((await cms.getCms()).newsletter.pressItems.length,0);
  assert.equal((await cms.getCms()).releases[0].title,'Muse');
  assert.equal(cms.validateCms({releases:[null]}),'Invalid content entries');
  assert.ok(cms.validateCms({site:null}));
  assert.ok(cms.validateCms({releases:[{id:'a',title:'a',links:{apple:'javascript:alert(1)'}}]}));
  assert.equal(cms.validateCms(original),null);
  assert.equal(await audience.subscribe('qa@example.invalid'),true);
  assert.equal(await audience.subscribe('qa@example.invalid'),false);
  assert.equal((await audience.subscribers()).length,1);
  const token=await audience.newUnsubscribeToken('qa@example.invalid');
  assert.equal(await audience.unsubscribeByToken(token),true);
  assert.equal((await audience.subscribers()).length,0);
  assert.equal(await audience.unsubscribeByToken('bad'),false);
  const pass: YardPass={id:passes.generatePassId(),anonId:'a'.repeat(48),name:'QA',email:'qa@example.invalid',phone:'',gender:'female' as const,title:"YARDEN'S ANGEL",status:'Angel Certified',yearJoined:2026,createdAt:new Date().toISOString()};
  assert.equal((await passes.savePass(pass)).created,true);
  assert.equal((await passes.savePass({...pass,name:'Changed'})).pass.name,'QA');
  assert.equal((await passes.getAllPasses()).length,1);
  assert.equal((await passes.getPassByAnonId(pass.anonId))?.id,pass.id);
 } finally {process.chdir(old);await rm(dir,{recursive:true,force:true});}
});
