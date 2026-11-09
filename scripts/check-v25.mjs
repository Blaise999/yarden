#!/usr/bin/env node
import {readFile, readdir, stat} from 'node:fs/promises';
import {join, dirname, extname, resolve} from 'node:path';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url),root=process.cwd();
function dependency(name) {
 try{return req(name)}catch{
  const globalDir=resolve(process.execPath,'../../lib/node_modules');
  return req(join(globalDir,name));
 }
}
const ts=dependency('typescript'),postcss=dependency('postcss');
const path=(v)=>join(root,v), read=async(v)=>readFile(path(v),'utf8');
let failed=0,passed=0;
function assert(description,result){if(result){passed++;console.log(`PASS ${description}`)}else{failed++;console.error(`FAIL ${description}`)}}
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});const out=[];for(const entry of entries){if(['node_modules','.next','.git'].includes(entry.name))continue;const sub=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(sub));else out.push(sub)}return out}
const files=await walk(root), scripts=files.filter(p=>/\.(tsx?|jsx?)$/.test(p));
let syntaxErrors=0,brokenImports=[];
for(const file of scripts){
 const code=await readFile(file,'utf8');
 const source=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 syntaxErrors+=source.parseDiagnostics.length;
 if(source.parseDiagnostics.length)console.error('SYNTAX',file,source.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')));
 const imports=/(?:import|export)\s+(?:[^;]*?\s+from\s+)?['"](\.[^'"]+)['"]|\bimport\(\s*['"](\.[^'"]+)['"]\s*\)/g;
 for(const match of code.matchAll(imports)){
  const local=match[1]||match[2];
  if(!local)continue;
  const target=resolve(dirname(file),local);
  const candidates=[target,...['.ts','.tsx','.js','.jsx','.json'].map(x=>target+x),...['index.ts','index.tsx','index.js','index.jsx'].map(x=>join(target,x))];
  if(!candidates.some(c=>files.includes(c)))brokenImports.push({file,import:local});
 }
}
assert(`${scripts.length} JS/TS files have valid source syntax`,syntaxErrors===0);
if(brokenImports.length)console.error('Missing local imports',brokenImports);
assert('All relative imports resolve',brokenImports.length===0);
const cssFiles=files.filter(p=>p.endsWith('.css'));
let cssErrors=[];for(const p of cssFiles){try{postcss.parse(await readFile(p,'utf8'),{from:p})}catch(e){cssErrors.push([p,String(e)])}}
if(cssErrors.length)console.error('CSS errors',cssErrors);
assert(`${cssFiles.length} CSS files parse`,cssErrors.length===0);
const layout=await read('app/layout.tsx'),home=await read('app/page.client.tsx'),merch=await read('components/landing/AngelMerchSection.tsx'),vinyl=await read('components/landing/AngelExtras.tsx'),support=await read('libs/angelSupport.ts'),download=await read('app/api/support/download/route.ts');
assert('V25 CSS loads after V23',layout.indexOf('v25.css')>layout.indexOf('v23.css'));
assert('New homepage music and merch both remain present',home.includes('<HomeMusicSection')&&home.includes('<AngelMerchSection'));
assert('Original photo hero is retained without video',home.includes('yarden-hero-desktop.webp')&&!home.includes('<video'));
assert('Merch uses all 13 original images in the archive',(merch.includes('archive.map')||merch.includes('marquee.map'))&&[...Array(13).keys()].every(i=>merch.includes(`number: ${i},`)));
assert('Merch pricing is TBA, no invented prices',merch.includes('PRICE TBA')&&merch.includes('COMING SOON'));
assert('V25.2 removed standalone merch campaign typography panel',!merch.includes('className="v25-campaign-typography"'));
assert('V25.2 merch photo remains fully visible and keeps scrolling strip',(await read('app/v25.css')).includes('v25-campaign-photo>img{position:relative;z-index:1;width:100%;height:100%;object-fit:contain')&&merch.includes('v25-merch-ticker'));
assert('V25.2 ANGEL hero uses editorial serif typography',(await read('app/v23.css')).includes('font-family:"Bodoni MT","Didot"'));

assert('New vinyl still uses admin availability and existing order API',vinyl.includes('getPublicAngel()')&&vinyl.includes("'/api/vinyl-orders'")&&vinyl.includes('config?.vinylEnabled'));
assert('Vinyl form has consent and validates quantity',vinyl.includes('name="consent"')&&vinyl.includes('max="10"'));
assert('Private album URL restricts destination to Vercel private Blob host',support.includes('.private.blob.vercel-storage.com')&&download.includes("redirect:'error'"));
assert('Private album still needs verified paid order',download.includes("order.status!=='paid'")&&download.includes('order.downloadToken!==token'));
assert('Checkout remains disabled without explicit production configuration',support.includes("ANGEL_SUPPORT_CHECKOUT_ENABLED!=='true'"));
assert('Private album and public CMS Blob tokens can be separate',support.includes('ANGEL_PRIVATE_BLOB_TOKEN')&&download.includes('albumPrivateBlobToken()')); 
assert('Decorative audio wave respects reduced motion',(await read('app/v25.css')).includes('prefers-reduced-motion:reduce')&&(await read('components/landing/HomeMusicSection.tsx')).includes('v25-soundband'));
let imgBytes=0;for(let i=0;i<13;i++){
 const filename=path(`public/merch/angel-drop/gallery/${String(i).padStart(2,'0')}.webp`);
 const a=await readFile(filename);imgBytes+=a.length;
 assert(`Original campaign image ${String(i+1).padStart(2,'0')} is optimized and included`,a.toString('ascii',8,12)==='WEBP'&&a.length<450000);
}
console.log(`Total merch gallery payload: ${(imgBytes/1024/1024).toFixed(2)} MiB`);
console.log(`V25 checks: ${passed} passed / ${failed} failed.`);
if(failed)process.exitCode=1;
