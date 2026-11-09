import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {readRecord} from '../../../../libs/persistence';
import {getSupportOrder,verifiedPrivateAlbumUrl,albumPrivateBlobToken} from '../../../../libs/angelSupport';
import * as Blob from '@vercel/blob';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const token=req.nextUrl.searchParams.get('token')||'';
 if(!/^[a-f0-9]{72}$/.test(token))return NextResponse.json({error:'Invalid download link.'},{status:400});
 if(!albumPrivateBlobToken()||!(process.env.ANGEL_ALBUM_PRIVATE_BLOB_PATH||verifiedPrivateAlbumUrl()))return NextResponse.json({error:'Download not configured. Contact the artist team.'},{status:503});
 try{
  const key=`yarden:angel:support:download:${createHash('sha256').update(token).digest('hex')}`;
  const ref=await readRecord<string>(key);const order=ref?await getSupportOrder(ref):null;
  if(!order||order.status!=='paid'||order.downloadToken!==token)return NextResponse.json({error:'Download not authorized.'},{status:403});
  const headers={'Content-Type':'application/zip','Content-Disposition':'attachment; filename="Yarden-ANGEL-Digital-Album.zip"','Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'};
  const privateUrl=verifiedPrivateAlbumUrl();
  if(privateUrl){
    // Restricted to Vercel's private Blob domain to avoid leaking credentials to another host.
    const response=await fetch(privateUrl,{headers:{Authorization:`Bearer ${albumPrivateBlobToken()}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});
    if(!response.ok||!response.body)return NextResponse.json({error:'Album file unavailable. Contact the artist team.'},{status:503});
    return new NextResponse(response.body,{headers});
  }
  const getPrivate=(Blob as unknown as {get?:(path:string,options:{access:'private';token?:string})=>Promise<{statusCode?:number;stream?:ReadableStream<Uint8Array>|null}|null>}).get;
  if(!getPrivate)return NextResponse.json({error:'Private album downloads require @vercel/blob v2.3 or a private Blob URL.'},{status:503});
  const file=await getPrivate(process.env.ANGEL_ALBUM_PRIVATE_BLOB_PATH!,{access:'private',token:albumPrivateBlobToken()});
  if(file?.statusCode!==200||!file.stream)return NextResponse.json({error:'Album file unavailable. Contact the artist team.'},{status:503});
  return new NextResponse(file.stream,{headers});
 }catch{return NextResponse.json({error:'Album download temporarily unavailable. Please try again.'},{status:503});}
}
