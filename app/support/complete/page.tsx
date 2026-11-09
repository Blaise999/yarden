import type {Metadata} from 'next';
import Link from 'next/link';
import {getSupportOrder,verifyFlutterwave} from '../../../libs/angelSupport';
import SilverSiteShell from '../../../components/landing/SilverSiteShell';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const metadata:Metadata={title:'ANGEL digital support receipt',robots:{index:false,follow:false}};
export default async function SupportComplete({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const args=await searchParams;const ref=typeof args.tx_ref==='string'?args.tx_ref:'';
 const id=typeof args.transaction_id==='string' && /^\d{1,18}$/.test(args.transaction_id)?Number(args.transaction_id):undefined;
 let result:Awaited<ReturnType<typeof verifyFlutterwave>>=null;
 try{if(ref && id)result=await verifyFlutterwave(ref,id);}catch{}
 const paid=Boolean(result?.paid),order=result?.order;
 return <SilverSiteShell><section className="v24-payment-receipt"><span className="v23-overline">YARDEN / ANGEL DIGITAL</span><h1>{paid?'You own the feeling.':'Payment not confirmed.'}</h1><p>{paid?`Thank you for supporting ANGEL directly. Your $${order?.amount} payment was verified.`:'We could not verify this purchase. If you were charged, contact the artist team with your payment reference.'}</p>
 {paid&&order?.downloadToken?<a className="v24-support-submit" href={`/api/support/download?token=${order.downloadToken}`}>Download ANGEL · ZIP ↓</a>:null}
 {paid?<p>A receipt and download link will also be emailed if transactional email is configured. Keep this page for your records.</p>:null}
 <small>Reference: {ref || 'unavailable'}</small><Link href="/">← Back to Yarden</Link></section></SilverSiteShell>
}
