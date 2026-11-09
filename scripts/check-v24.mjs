#!/usr/bin/env node
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd();let fail=0;
const read=async name=>readFile(join(root,name),'utf8');
function check(label,ok){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)fail++}
const home=await read('app/page.client.tsx'), merch=await read('components/landing/AngelMerchSection.tsx');
const support=await read('components/landing/DigitalSupportSection.tsx'), server=await read('libs/angelSupport.ts');
const checkout=await read('app/api/support/checkout/route.ts'), webhook=await read('app/api/support/webhook/route.ts');
const download=await read('app/api/support/download/route.ts'), nav=await read('components/landing/SilverSiteShell.tsx');
check('Both homepage sections are present',home.includes('<AngelMerchSection />')&&home.includes('<DigitalSupportSection />'));
check('Original Yarden navbar logo unchanged',nav.includes('/Pictures/yard2.png'));
check('Hero still uses one responsive photo, not video',home.includes('yarden-hero-desktop.webp')&&!home.includes('<video'));
check('Merch prices are explicitly unannounced',merch.includes('PRICE TBA')&&merch.includes('COMING SOON'));
check('Merch product images load lazily',merch.includes('loading="lazy"'));
check('Payment credentials never appear in client component',!support.includes('FLW_SECRET_KEY')&&!support.includes('FLW_SECRET_HASH'));
check('Server locks checkout until artist account and album are configured',server.includes("ANGEL_SUPPORT_CHECKOUT_ENABLED!=='true'")&&server.includes('hasDeliveryFile()')&&server.includes('emailConfigured()'));
check('Server validates USD support amount and exact $40 tier',server.includes("x.kind==='album'?40")&&server.includes('amount<100||amount>1000'));
check('Flutterwave payment verification checks reference, amount, currency and email',server.includes('tx_ref===order.ref')&&server.includes('tx.currency===order.currency')&&server.includes('Number(tx.amount)>=order.amount')&&server.includes('tx.customer?.email'));
check('Webhook checks secret hash and verifies via Flutterwave',webhook.includes('timingSafeEqual')&&webhook.includes('verifyFlutterwave'));
check('Checkout handles CSRF and abuse limits',checkout.includes('sameOriginRequest(req)')&&checkout.includes('rateLimited'));
check('Album download requires paid order and private blob',download.includes("order.status!=='paid'")&&download.includes("access:'private'"));
for(const asset of ['campaign','noir-product','ivory-product','noir-editorial','ivory-editorial','details']){
  const filename=`public/merch/angel-drop/${asset}.webp`;
  const data=await readFile(join(root,filename)); const info=await stat(join(root,filename));
  check(`${asset} is optimized WEBP under 350KB`,data.toString('ascii',8,12)==='WEBP'&&info.size<350000);
}
if(fail){console.error(`${fail} V24 checks failed.`);process.exitCode=1}else console.log('V24 static checks passed. Full Next.js build and merchant end-to-end test still required.');
