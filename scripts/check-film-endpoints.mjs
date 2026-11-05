#!/usr/bin/env node
// Checks both local MP4s and, optionally, the deployment's public media URLs.
// Usage: npm run check:films -- https://YOUR-YARDEN-DEPLOYMENT.vercel.app
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = ['yarden-desktop.mp4','yarden-mobile.mp4'];
let bad = false;

for (const name of files) {
  const local = path.join(root, 'public', 'videos', name);
  try {
    const size = (await stat(local)).size;
    const head = (await readFile(local)).subarray(0, 256);
    const ok = head.toString('latin1', 4, 8) === 'ftyp' && size > 1_000_000;
    const lfs = head.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1');
    console.log(`${ok?'PASS':'FAIL'} local ${name} (${(size/1024/1024).toFixed(1)} MiB)${lfs?' — Git LFS pointer, not video':''}`);
    if (!ok) bad = true;
  } catch (error) {
    console.error(`FAIL local ${name}: ${error.message}`); bad = true;
  }
}

const base = process.argv[2]?.trim()?.replace(/\/$/, '');
if (base) {
  for (const name of files) {
    const url = `${base}/videos/${name}`;
    try {
      const response = await fetch(url, { headers: { Range:'bytes=0-127', 'Cache-Control':'no-cache' }, redirect:'follow', signal:AbortSignal.timeout(15000) });
      const data = Buffer.from(await response.arrayBuffer());
      const isMp4 = data.subarray(4,8).toString('ascii') === 'ftyp';
      const isLfs = data.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1');
      const ok = response.ok && isMp4;
      console.log(`${ok?'PASS':'FAIL'} deployed ${name}: HTTP ${response.status}, ${response.headers.get('content-type')||'unknown type'}${isLfs?' — Git LFS pointer served instead of film':''}`);
      if (!ok) bad = true;
    } catch (error) {
      console.error(`FAIL deployed ${name}: ${error.message}`); bad = true;
    }
  }
}

if (bad) {
  console.error('\nVideo check failed. Ensure Vercel Settings → Git → Git LFS is enabled and redeploy.');
  console.error('Alternatively upload the real MP4s to public Vercel Blob and use their URLs in Admin → Settings.');
  process.exitCode = 1;
} else {
  console.log('\nMedia files appear to be real MP4s; browser autoplay may still require a visitor to press PLAY.');
}
