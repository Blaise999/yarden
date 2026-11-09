import {NextResponse} from 'next/server';
import {isAdmin} from '../../../../libs/adminAuth';
import {listSupportOrders,checkoutReady} from '../../../../libs/angelSupport';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const orders=await listSupportOrders();return NextResponse.json({ready:await checkoutReady(),orders:orders.map(({downloadToken,...rest})=>rest)},{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'Storage unavailable'},{status:503})}}
