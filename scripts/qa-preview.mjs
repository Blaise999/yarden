// Disposable local API checks run in the same environment as the preview server.
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const args=process.argv.slice(2).filter(x=>x!=='--strictPort').map(x=>x==='--host'?'--hostname':x);
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev',...args],{stdio:['ignore','pipe','pipe']});
let started=false;
child.stdout.on('data',async data=>{
 process.stdout.write(data);
 if(!started&&String(data).includes('Ready')){
  started=true;
  const test=spawn(process.execPath,['scripts/test-api.mjs'],{stdio:['ignore','pipe','pipe']});let log='';
  test.stdout.on('data',d=>{log+=d;process.stdout.write(d)});test.stderr.on('data',d=>{log+=d;process.stderr.write(d)});
  test.on('exit',async code=>{await writeFile('qa-api-result.log',log+`\nExit: ${code}\n`)});
 }
});child.stderr.pipe(process.stderr);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
