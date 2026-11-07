#!/usr/bin/env node
/** V23 zero-dependency static asset and route regressions. */
import {readFile,stat,access} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd();let fail=0;
const read=async f=>readFile(join(root,f),'utf8');
function check(name,test){console.log(`${test?'PASS':'FAIL'} ${name}`);if(!test)fail++}
const page=await read('app/page.client.tsx');
const nav=await read('components/landing/SilverSiteShell.tsx');
const cmsRoute=await read('app/api/admin/cms/route.ts');
const party=await read('components/landing/ListeningPartySection.tsx');
const global=await read('app/layout.tsx');
check('Hero is a responsive photo, not a video',page.includes('<picture')&&page.includes('yarden-hero-desktop.webp')&&page.includes('yarden-hero-mobile.webp')&&!page.includes('<video')&&!page.includes('YardenVideoHero'));
check('New original Yarden wordmark is used',nav.includes('/Pictures/yard2.png'));
check('Homepage is focused on album, listening parties and newsletter', page.includes('v23-album')&&page.includes('ListeningPartySection')&&page.includes('v23-letters')&&!page.includes('AngelExtras'));
check('Listening parties remain admin editable',party.includes('getPublicAngel')&&party.includes('current?.image')&&cmsRoute.includes('revalidateTag'));
const sharedAngel = await read('components/landing/angelPublicClient.ts');
check('Shared ANGEL client exists for public listening parties and vinyl', sharedAngel.includes('export function getPublicAngel') && party.includes("from './angelPublicClient'"));
check('Photo-first CSS is loaded',global.includes('./v23.css'));
check('No legacy film masters bundled',!page.includes('desktopVideo')&&!page.includes('mobileVideo'));
for(const [name,max] of [['yarden-hero-desktop.webp',300000],['yarden-hero-mobile.webp',200000]]){
 const path=join(root,'public/editorial',name);const blob=await readFile(path);const statInfo=await stat(path);
 check(`${name} under ${Math.round(max/1000)} KB`,statInfo.size<max && blob.toString('ascii',8,12)==='WEBP');
}
for(const route of ['music','films','vinyl','mugshot','journal','yard','about']){
 try{await access(join(root,'app',route,'page.tsx'));check(`/${route} has an accessible route`,nav.includes(`/${route}`)||route==='about')}
 catch{check(`/${route} has an accessible route`,false)}
}
if(fail){console.error(`${fail} checks failed.`);process.exitCode=1}else console.log('V23 static performance/regression checks passed. Run production build and real-device tests after deployment.');
