import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {getSupportOrder,verifyFlutterwave} from '../../../../libs/angelSupport';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 const secret=process.env.FLW_SECRET_HASH;
 const provided=req.headers.get('verif-hash')||'';
 if(!secret||!provided||Buffer.byteLength(secret)!==Buffer.byteLength(provided)||!timingSafeEqual(Buffer.from(secret),Buffer.from(provided)))return new NextResponse(null,{status:401});
 try{
  const body=await req.text();if(body.length>40000)return new NextResponse(null,{status:413});
  const event=JSON.parse(body) as {data?:{tx_ref?:string;id?:number}};
  if(!event.data?.tx_ref)return new NextResponse(null,{status:200});
  const order=await getSupportOrder(event.data.tx_ref);
  if(!order)return new NextResponse(null,{status:200});
  // A verified Flutterwave API response is required, even for authenticated webhooks.
  await verifyFlutterwave(order.ref,event.data.id);
  return new NextResponse(null,{status:200});
 }catch{return new NextResponse(null,{status:500});}
}
