import {NextResponse} from 'next/server';
import {getAngel} from '../../../libs/angelStore';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(await getAngel(),{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Content unavailable'},{status:503})}}
