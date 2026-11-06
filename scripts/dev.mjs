import { spawn } from 'node:child_process';
const raw = process.argv.slice(2);
const args = raw.filter(x => x !== '--strictPort').map(x => x === '--host' ? '--hostname' : x);
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', ...args], {stdio:'inherit'});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 1));
