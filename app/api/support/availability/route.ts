import {NextResponse} from 'next/server';
import {checkoutReady,paymentEnvironment} from '../../../../libs/angelSupport';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({ready:await checkoutReady(),testMode:paymentEnvironment()==='test'}, {headers:{'Cache-Control':'no-store'}})}
