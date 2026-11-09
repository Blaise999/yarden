/** Server-only ANGEL digital support payment and delivery ledger. */
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {readRecord,saveRecord,createRecord,addToSet,readSet} from './persistence';
import {sendAdminNotification,sendEmail,siteOrigin,emailConfigured} from './email';

export type SupportKind='album'|'patron';
export type SupportStatus='pending'|'paid'|'failed';
export type SupportOrder={ref:string;createdAt:string;updatedAt:string;kind:SupportKind;name:string;email:string;amount:number;currency:'USD';status:SupportStatus;transactionId?:number;downloadToken?:string;emailSent?:boolean};
const orderKey=(ref:string)=>`yarden:angel:support:order:${ref}`;
const downloadKey=(token:string)=>`yarden:angel:support:download:${createHash('sha256').update(token).digest('hex')}`;
const secureRef=(ref:string)=>/^angel_[0-9a-f-]{36}$/.test(ref);
// Accept either a private Blob URL (SDK-independent token-authenticated delivery)
// or a private Blob pathname when running @vercel/blob >= 2.3.
export function verifiedPrivateAlbumUrl(){
 const value=process.env.ANGEL_ALBUM_PRIVATE_BLOB_URL?.trim();
 if(!value)return null;
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.private.blob.vercel-storage.com')||
     !/^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/i.test(url.hostname)||
     url.username||url.password||url.port||url.search||url.hash||url.pathname==='/')return null;
  return url.toString();
 }catch{return null}
}
// Use a separate token when the public CMS uploads and album are stored in distinct Blob stores.
// Older deployments can still use BLOB_READ_WRITE_TOKEN for both when appropriate.
export const albumPrivateBlobToken=()=>process.env.ANGEL_PRIVATE_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
export const hasDeliveryFile=()=>Boolean(albumPrivateBlobToken() && (verifiedPrivateAlbumUrl() || process.env.ANGEL_ALBUM_PRIVATE_BLOB_PATH));
export async function checkoutReady(){
 if(process.env.ANGEL_SUPPORT_CHECKOUT_ENABLED!=='true'||!process.env.FLW_SECRET_KEY||!process.env.FLW_SECRET_HASH||!siteOrigin()||!hasDeliveryFile()||!emailConfigured())return false;
 // An authenticated private Blob URL uses the documented token-based access method.
 // A pathname requires SDK >= 2.3, so never enable checkout using older SDK versions.
 if(verifiedPrivateAlbumUrl())return true;
 const sdk=await import('@vercel/blob');
 return typeof (sdk as unknown as {get?:unknown}).get==='function';
}
export const paymentEnvironment=()=>process.env.FLW_SECRET_KEY?.includes('TEST')?'test':'live';
export function validateSupportInput(v:unknown){
 if(!v||typeof v!=='object')throw new Error('Enter your details to continue.');
 const x=v as Record<string,unknown>;
 const name=typeof x.name==='string'?x.name.trim():''; const email=typeof x.email==='string'?x.email.trim().toLowerCase():'';
 if(name.length<2||name.length>90||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw new Error('Enter a name and valid email address.');
 if(x.consent!==true)throw new Error('Please confirm your digital purchase.');
 if(x.kind!=='album'&&x.kind!=='patron')throw new Error('Choose your support option.');
 const amount=x.kind==='album'?40:Number(x.amount);
 if(!Number.isInteger(amount)||(x.kind==='patron'&&(amount<100||amount>1000)))throw new Error('Choose $40 or enter a whole-dollar amount from $100 to $1,000.');
 return {name,email,kind:x.kind as SupportKind,amount};
}
export async function newOrder(v:ReturnType<typeof validateSupportInput>){
 const ref=`angel_${randomUUID()}`;
 const order:SupportOrder={ref,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...v,currency:'USD',status:'pending'};
 await saveRecord(orderKey(ref),order);await addToSet('yarden:angel:support:index',ref);
 return order;
}
export async function getSupportOrder(ref:string){if(!secureRef(ref))return null;return readRecord<SupportOrder>(orderKey(ref));}
export async function listSupportOrders(){const refs=await readSet('yarden:angel:support:index');const rows=await Promise.all(refs.slice(-500).map(getSupportOrder));return rows.filter((v):v is SupportOrder=>!!v).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
export async function createFlutterwaveLink(order:SupportOrder){
 const origin=siteOrigin();if(!origin||!process.env.FLW_SECRET_KEY)throw Error('Payment checkout is not configured.');
 const response=await fetch('https://api.flutterwave.com/v3/payments',{
  method:'POST',cache:'no-store',signal:AbortSignal.timeout(12000),headers:{'Authorization':`Bearer ${process.env.FLW_SECRET_KEY}`,'Content-Type':'application/json'},
  body:JSON.stringify({tx_ref:order.ref,amount:order.amount,currency:'USD',redirect_url:`${origin}/support/complete`,
   customer:{email:order.email,name:order.name},
   customizations:{title:'Yarden — ANGEL Digital Album',description:'Direct digital album purchase and artist support'},
   meta:{product:'angel-digital-album',tier:order.kind}})
 });
 const body=await response.json().catch(()=>null) as {status?:string;data?:{link?:string}}|null;
 if(!response.ok||body?.status!=='success'||!body.data?.link)throw new Error('Flutterwave could not open checkout.');
 const url=new URL(body.data.link);
 if(url.protocol!=='https:' || !(url.hostname==='flutterwave.com'||url.hostname.endsWith('.flutterwave.com')))throw new Error('Flutterwave returned an invalid checkout link.');
 return url.toString();
}
export async function verifyFlutterwave(ref:string,id?:number){
 const key=process.env.FLW_SECRET_KEY;const order=await getSupportOrder(ref);
 if(!key||!order) return null;
 const endpoint=id?`https://api.flutterwave.com/v3/transactions/${id}/verify`:`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(ref)}`;
 const response=await fetch(endpoint,{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(12000),cache:'no-store'});
 if(!response.ok)return {order,paid:false};
 const result=await response.json() as {status?:string;data?:{id?:number;tx_ref?:string;status?:string;amount?:number;currency?:string;customer?:{email?:string}}};
 const tx=result.data;
 const paid=Boolean(result.status==='success'&&tx?.status==='successful'&&tx.tx_ref===order.ref&&tx.currency===order.currency&&Number(tx.amount)>=order.amount&&tx.customer?.email?.toLowerCase()===order.email);
 if(!paid||!tx?.id)return {order,paid:false};
 if(order.status==='paid')return {order,paid:true};
 // A stable 48-byte token is independently random and never derived from the transaction id.
 const mintedToken=randomBytes(36).toString('hex');
 const entitlementKey=`yarden:angel:support:entitlement:${ref}`;
 const minted=await createRecord(entitlementKey,mintedToken);
 const token=minted?mintedToken:(await readRecord<string>(entitlementKey))!;
 if(!token)throw Error('Could not restore album entitlement.');
 const saved:SupportOrder={...order,status:'paid',updatedAt:new Date().toISOString(),transactionId:tx.id,downloadToken:token};
 await saveRecord(downloadKey(token),ref);
 await saveRecord(orderKey(ref),saved);
 // A failed email does not change the verified payment or entitlement.
 const url=`${siteOrigin()}/api/support/download?token=${token}`;
 const email=await sendEmail({to:saved.email,subject:'Your Yarden ANGEL digital album',
  text:`Thank you for supporting ANGEL directly. Your verified purchase is $${saved.amount} USD. Download the album here: ${url}\n\nReference: ${ref}`,
  html:`<div style="background:#0c1119;color:#edf2f6;font:16px Arial;padding:32px"><h1>ANGEL is yours.</h1><p>Thank you for supporting Yarden directly.</p><p>Verified purchase: $${saved.amount} USD</p><p><a style="color:#c9d8e5" href="${url}">Download your digital album</a></p><small>Ref: ${ref}</small></div>`,
  idempotencyKey:`angel-album-${ref}`});
 if(email.sent)await saveRecord(orderKey(ref),{...saved,emailSent:true});
 await sendAdminNotification('ANGEL direct album purchase',`Verified $${saved.amount} USD payment (${saved.kind}). Ref: ${ref}`).catch(()=>undefined);
 return {order:{...saved,emailSent:email.sent},paid:true};
}
