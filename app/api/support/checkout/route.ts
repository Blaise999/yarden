import {NextRequest,NextResponse} from 'next/server';
import {sameOriginRequest} from '../../../../libs/adminAuth';
import {checkoutReady,validateSupportInput,newOrder,createFlutterwaveLink} from '../../../../libs/angelSupport';
import {rateLimited} from '../../../../libs/persistence';
import {createHash} from 'node:crypto';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!sameOriginRequest(req))return NextResponse.json({error:'Invalid origin.'},{status:403});
 if(!await checkoutReady())return NextResponse.json({error:'Digital checkout is being prepared. No payment has been taken.'},{status:503});
 try{
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const key=`angel:support:checkout:${createHash('sha256').update(ip).digest('hex').slice(0,32)}`;
  if(await rateLimited(key,5,3600))return NextResponse.json({error:'Too many attempts. Please try again later.'},{status:429});
  const raw=await req.text();if(raw.length>3000)return NextResponse.json({error:'Request too large.'},{status:413});
  const fields=validateSupportInput(JSON.parse(raw));
  const order=await newOrder(fields);
  const link=await createFlutterwaveLink(order);
  return NextResponse.json({url:link},{headers:{'Cache-Control':'no-store'}});
 }catch(e){const message=e instanceof Error?e.message:'Unable to start checkout.';
  if(message.includes('Flutterwave'))return NextResponse.json({error:'Payment provider temporarily unavailable. No charge has been made.'},{status:502});
  if(message.includes('Redis')||message.includes('storage'))return NextResponse.json({error:'Secure checkout storage is unavailable.'},{status:503});
  return NextResponse.json({error:message},{status:400});}
}
