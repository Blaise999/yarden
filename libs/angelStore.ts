import { randomUUID } from 'node:crypto';
import { readRecord, saveRecord, addToSet, readSet } from './persistence';
export type Party={id:string;city:string;venue:string;date:string;time:string;link:string;status:string;image?:string;title?:string;description?:string;buttonText?:string;published?:boolean};
export type AngelConfig={vinylEnabled:boolean;vinylTitle:string;vinylDescription:string;priceLabel:string;parties:Party[];partyTitle?:string;partyDescription?:string;partyEyebrow?:string;partyImage?:string};
export const defaultAngel:AngelConfig={vinylEnabled:true,vinylTitle:'ANGEL — on wax.',vinylDescription:'Reserve your copy. Leave your details and the team will contact you with pricing, availability and delivery.',priceLabel:'Price and delivery confirmed by the team',partyTitle:'The listening room.',partyEyebrow:'ANGEL / IN PERSON',partyDescription:'Good music hits differently when we hear it together. Find your place in the room.',partyImage:'/editorial/yarden-listening.webp',parties:[]};
export const getAngel=async()=>({...defaultAngel,...await readRecord<AngelConfig>('yarden:angel:config:v1')});
function safeImage(value: string) {
  return !value || /^\/(?!\/)[\w%./-]+$/.test(value) || /^https:\/\/[^\s]+$/i.test(value);
}
export function validateAngel(x: unknown): x is AngelConfig {
  if (!x || typeof x !== 'object') return false;
  const c = x as AngelConfig;
  const optionalText = (v: unknown, max = 1000) => v === undefined || (typeof v === 'string' && v.length <= max);
  return typeof c.vinylEnabled === 'boolean'
    && [c.vinylTitle,c.vinylDescription,c.priceLabel].every(v => typeof v === 'string' && v.length <= 1000)
    && [c.partyTitle,c.partyDescription,c.partyEyebrow].every(v => optionalText(v))
    && optionalText(c.partyImage, 2000)
    && safeImage(c.partyImage || '')
    && Array.isArray(c.parties) && c.parties.length <= 50
    && c.parties.every(p => p && [p.id,p.city,p.venue,p.date,p.time,p.link,p.status].every(v => typeof v === 'string' && v.length <= 500)
      && (!p.date || /^\d{4}-\d{2}-\d{2}$/.test(p.date))
      && (p.published !== true || (Boolean(p.date) && Boolean(p.city.trim()) && Boolean(p.venue.trim())))
      && (!p.link || /^https:\/\/[^\s]+$/i.test(p.link))
      && [p.title,p.description,p.buttonText].every(v => optionalText(v, 1500))
      && optionalText(p.image, 2000) && safeImage(p.image || '')
      && (p.published === undefined || typeof p.published === 'boolean'));
}
export const putAngel=(x:AngelConfig)=>saveRecord('yarden:angel:config:v1',x);
export type VinylOrder={id:string;createdAt:string;name:string;email:string;phone:string;address:string;country:string;quantity:number;note:string;product:string;priceLabel:string;status:'new'|'contacted'|'fulfilled'|'cancelled'};
export function orderInput(x:unknown){if(!x||typeof x!=='object')throw Error('Enter your order details.');const b=x as Record<string,unknown>;const fields=['name','email','phone','address','country','note'] as const;const out={} as Record<typeof fields[number],string>;for(const f of fields){if(typeof b[f]!=='string'||(b[f] as string).length>1000)throw Error('Invalid '+f);out[f]=(b[f] as string).trim();}if(!out.name||!out.phone||!out.address||!out.country||!/^\S+@\S+\.\S+$/.test(out.email)||out.email.length>254||b.consent!==true||!Number.isInteger(b.quantity)||Number(b.quantity)<1||Number(b.quantity)>10)throw Error('Complete the required details and agree to order follow-up.');return {...out,email:out.email.toLowerCase(),quantity:Number(b.quantity)};}
export async function createOrder(input:ReturnType<typeof orderInput>,config:AngelConfig){const order:VinylOrder={...input,id:randomUUID(),createdAt:new Date().toISOString(),product:config.vinylTitle,priceLabel:config.priceLabel,status:'new'};await saveRecord('yarden:vinyl:'+order.id,order);await addToSet('yarden:vinyl:index',order.id);return order;}
export async function listOrders(){const ids=await readSet('yarden:vinyl:index');return (await Promise.all(ids.map(id=>readRecord<VinylOrder>('yarden:vinyl:'+id)))).filter((o):o is VinylOrder=>!!o).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
