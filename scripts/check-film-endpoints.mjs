#!/usr/bin/env node
// Run after deploying: npm run check:films -- https://thisisyarden.com
// The local H.264 films MUST be directly accessible, regardless of 4K URLs.
import { open, stat } from 'node:fs/promises';
import path from 'node:path';

const files = [
  'yarden-desktop-web.mp4',
  'yarden-mobile-web.mp4',
  'yarden-desktop.mp4',
  'yarden-mobile.mp4',
];
const base = process.argv[2]?.trim().replace(/\/$/, '') || '';
let failed = false;

function mp4(bytes) { return bytes.length > 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp'; }
function lfs(bytes) { return bytes.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1'); }

async function remoteStatus(url) {
  const response = await fetch(url, {
    headers: { Range: 'bytes=0-1023', 'Cache-Control': 'no-cache' },
    redirect: 'follow',
    signal: AbortSignal.timeout(18000),
  });
  let head = Buffer.alloc(0);
  if (response.body) {
    const reader = response.body.getReader();
    try {
      const chunk = await reader.read();
      if (chunk.value) head = Buffer.from(chunk.value).subarray(0, 1024);
    } finally { await reader.cancel().catch(() => {}); }
  }
  const type = response.headers.get('content-type') || 'unknown';
  const ok = response.ok && mp4(head) && /video\/mp4|application\/octet-stream/i.test(type);
  return { ok, status: response.status, type, isLfs: lfs(head), range: response.headers.get('accept-ranges') || 'unknown' };
}

for (const name of files) {
  const local = path.join(process.cwd(), 'public', 'videos', name);
  try {
    const file = await open(local, 'r');
    try {
      const { size } = await stat(local);
      const head = Buffer.alloc(256);
      await file.read(head, 0, 256, 0);
      const ok = mp4(head) && size > 1_000_000;
      console.log(`${ok ? 'PASS' : 'FAIL'} bundled ${name} (${(size / 1024 / 1024).toFixed(2)} MiB)${lfs(head) ? ' — Git LFS text pointer, not video!' : ''}`);
      if (!ok) failed = true;
    } finally { await file.close(); }
  } catch (error) {
    console.error(`FAIL bundled ${name}: ${error.message}`);
    failed = true;
  }
  if (!base) continue;
  try {
    const result = await remoteStatus(`${base}/videos/${name}`);
    console.log(`${result.ok ? 'PASS' : 'FAIL'} deployed ${name}: HTTP ${result.status}, ${result.type}, range=${result.range}${result.isLfs ? ' — Git LFS pointer!' : ''}`);
    if (!result.ok) failed = true;
  } catch (error) {
    console.error(`FAIL deployed ${name}: ${error.message}`);
    failed = true;
  }
}
if (failed) {
  console.error('Film check failed. Ensure all public/videos/*.mp4 files were committed as actual Git files and deployed, not LFS pointers or missing files.');
  process.exitCode = 1;
} else {
  console.log('MP4 signatures and deployment checks passed. Video playback still needs checking in a real browser.');
}
