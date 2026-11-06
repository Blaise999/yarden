import {test} from 'node:test';
import assert from 'node:assert/strict';
test('production Upstash REST contract and atomic rate limiter (mock transport)',async()=>{
 Object.assign(process.env,{NODE_ENV:'production'});process.env.UPSTASH_REDIS_REST_URL='https://redis.example.invalid';process.env.UPSTASH_REDIS_REST_TOKEN='test-token';
 const values=new Map<string,any>();const sets=new Map<string,Set<string>>();let evalUsed=false;
 const actual=globalThis.fetch;
 globalThis.fetch=async (_url,options)=>{
 const command=JSON.parse(String(options?.body));
 function run(c:any[]):any{
 const [cmd,key,value,...rest]=c;
 switch(String(cmd).toUpperCase()){
 case 'PING':return 'PONG';
 case 'SET':if(rest.includes('nx')&&values.has(key))return null;values.set(key,value);return 'OK';
 case 'GET':return values.get(key)??null;
 case 'SADD':{const s=sets.get(key)||new Set();s.add(value);sets.set(key,s);return 1;}
 case 'SREM':return sets.get(key)?.delete(value)?1:0;
 case 'SMEMBERS':return [...(sets.get(key)||[])];
 case 'EVAL':evalUsed=true;return 1;
 default:throw Error('Unexpected Redis command '+cmd);
 }}
 const encode=(r:any):any=>Array.isArray(r)?r.map(encode):typeof r==='string'&&r!=='OK'?Buffer.from(r).toString('base64'):r;
 const result=Array.isArray(command[0])?command.map((c:any[])=>({result:encode(run(c))})):{result:encode(run(command))};
 return new Response(JSON.stringify(result),{status:200});
 };
 try{
 const p=await import('../libs/persistence');
 assert.equal((await p.storageHealth()).connected,true);
 await p.saveRecord('cms',{title:'ANGEL'});assert.deepEqual(await p.readRecord('cms'),{title:'ANGEL'});
 assert.equal(await p.createRecord('new',{id:1}),true);assert.equal(await p.createRecord('new',{id:2}),false);
 await p.addToSet('index','a');assert.deepEqual(await p.readSet('index'),['a']);await p.removeFromSet('index','a');assert.deepEqual(await p.readSet('index'),[]);
 assert.equal(await p.rateLimited('ip',10),false);assert.equal(evalUsed,true);
 globalThis.fetch=async()=>new Response('{}',{status:401});assert.equal((await p.storageHealth()).connected,false);
 }finally{globalThis.fetch=actual;}
});
