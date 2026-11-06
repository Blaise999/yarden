#!/usr/bin/env node
// Yarden media checker. Detects Git LFS text pointers masquerading as .mp4.
// Run: npm run check:films -- https://YOUR-YARDEN-DOMAIN
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const files = [
  { name: "yarden-desktop-uhd.mp4", required: true },
  { name: "yarden-mobile-uhd.mp4", required: true },
  { name:'yarden-desktop.mp4', required:true },
  { name:'yarden-mobile.mp4', required:true },
  { name:'yarden-desktop-4k.mp4', required:false },
  { name:'yarden-mobile-4k.mp4', required:false },
];
const base = process.argv[2]?.trim()?.replace(/\/$/, '');
let failed = false;
let have4k = 0;

function isMp4(head) { return head.length > 12 && head.subarray(4,8).toString('ascii') === 'ftyp'; }
function isLfs(head) { return head.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1'); }
async function peekRemote(url) {
  const response = await fetch(url, { headers:{ Range:'bytes=0-1023', 'Cache-Control':'no-cache' }, redirect:'follow', signal:AbortSignal.timeout(17000) });
  const reader = response.body?.getReader();
  let head = Buffer.alloc(0);
  try {
    if (reader) {
      const chunk = await reader.read();
      if (chunk.value) head = Buffer.from(chunk.value).subarray(0,1024);
    }
  } finally { await reader?.cancel().catch(()=>{}); }
  return { ok:response.ok && isMp4(head), lfs:isLfs(head), status:response.status, type:response.headers.get('content-type')||'unknown' };
}

for (const item of files) {
  const local = path.join(process.cwd(), 'public', 'videos', item.name);
  let exists = false;
  try {
    const size = (await stat(local)).size;
    exists = true;
    const handle = await readFile(local);
    const head = handle.subarray(0,256);
    const ok = isMp4(head) && size > 1_000_000;
    console.log(`${ok?'PASS':'FAIL'} local ${item.name} (${(size/1024/1024).toFixed(1)} MiB)${isLfs(head)?' — Git LFS pointer, NOT video':''}`);
    if (!ok) failed = true;
    if (ok && !item.required) have4k += 1;
  } catch (err) {
    if (item.required) { console.error(`FAIL local ${item.name}: ${err.message}`); failed = true; }
    else console.log(`INFO ${item.name} not bundled (optional — use a public Blob URL or the 4K media pack)`);
  }
  if (base && exists) {
    const url = `${base}/videos/${item.name}`;
    try {
      const result = await peekRemote(url);
      console.log(`${result.ok?'PASS':'FAIL'} deployed ${item.name}: HTTP ${result.status}, ${result.type}${result.lfs?' — LFS pointer served instead of MP4':''}`);
      if (!result.ok) failed = true;
    } catch (err) { console.error(`FAIL deployed ${item.name}: ${err.message}`); failed = true; }
  }
}
console.log(`\n4K source files in this folder: ${have4k}/2`);
if (failed) {
  console.error('One or more film checks failed. Verify Vercel Git LFS or host both videos in PUBLIC Vercel Blob.');
  process.exitCode = 1;
} else console.log('Video signature checks passed. Verify browser playback, autoplay, audio, and source resolution after deployment.');
