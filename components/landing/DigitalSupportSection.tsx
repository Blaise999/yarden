"use client";
import { FormEvent,useEffect,useState } from "react";
import Link from "next/link";
import { ArrowUpRight,Disc3,Heart,LockKeyhole,Plus } from "lucide-react";

type Level="album"|"patron";
const steps=[100,250,500,1000];

export default function DigitalSupportSection(){
 const [level,setLevel]=useState<Level>("album");
 const [custom,setCustom]=useState(100);
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [consent,setConsent]=useState(false);
 const [ready,setReady]=useState(false);
 const [checking,setChecking]=useState(true);
 const [busy,setBusy]=useState(false);
 const [note,setNote]=useState("");
 useEffect(()=>{let active=true;fetch("/api/support/availability",{cache:"no-store"}).then(r=>r.json()).then(r=>{if(active){setReady(r.ready===true);setChecking(false);}}).catch(()=>{if(active){setReady(false);setChecking(false);}});return()=>{active=false};},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!ready)return;setBusy(true);setNote("");try{
  const res=await fetch("/api/support/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:level,amount:level==='album'?40:custom,email,name,consent})});
  const data=await res.json();if(!res.ok||!data.url)throw new Error(data.error||"Unable to open checkout.");
  window.location.assign(data.url);
 }catch(e){setNote(e instanceof Error?e.message:"Could not open checkout.");setBusy(false);}}
 return <section className="v24-support" id="support-angel" aria-labelledby="v24-support-title">
   <div className="v24-support-heading"><span className="v23-overline">05 / ANGEL, DIRECT</span><p>DIGITAL ALBUM / SECURE CHECKOUT</p></div>
   <div className="v24-support-layout">
     <div className="v24-support-editorial">
       <div className="v24-support-stack">
         <div className="v24-support-disc" aria-hidden="true"><div className="v24-support-disc-label"><img src="/Pictures/angel.jpg" alt="" loading="lazy" decoding="async"/></div></div>
         <div className="v24-support-album"><img src="/Pictures/angel.jpg" alt="ANGEL album cover" loading="lazy" decoding="async" width={500} height={500}/><span className="v24-support-album-shine"/></div>
         <p className="v24-support-float">YARDEN<br/>ANGEL<br/><small>THE DEBUT ALBUM</small></p>
       </div>
       <div className="v24-support-strip" aria-hidden="true"><div>DIRECT DOWNLOAD <span>✳</span> SUPPORT YARDEN <span>✳</span> ANGEL DIGITAL ALBUM <span>✳</span> PAY WHAT IT&apos;S WORTH <span>✳</span> DIRECT DOWNLOAD <span>✳</span> SUPPORT YARDEN <span>✳</span> ANGEL DIGITAL ALBUM <span>✳</span></div></div>
     </div>
     <div className="v24-support-copy"><p className="v24-support-eyebrow"><Heart size={14} strokeWidth={1.5}/> YOUR COPY OF ANGEL</p><h2 id="v24-support-title">Own ANGEL.<br/><span>Support Yarden.</span></h2><p className="v24-support-description">Get the digital album for $40. Want to give more? Choose any amount from $100 to $1,000. Either way, you get the same record.</p>
       <div className="v24-support-levels" role="group" aria-label="Choose support amount"><button type="button" className={level==='album'?'is-selected':''} onClick={()=>setLevel('album')}><span><Disc3 size={19}/> DIGITAL ALBUM</span><strong>$40</strong><small>THE COMPLETE DIGITAL ALBUM.</small></button><button type="button" className={level==='patron'?'is-selected':''} onClick={()=>setLevel('patron')}><span><Plus size={18}/> PAY WHAT IT'S WORTH</span><strong>$100–$1K</strong><small>SAME ALBUM. MORE DIRECT SUPPORT.</small></button></div>
       {level==='patron'&&<div className="v24-support-custom"><div className="v24-support-amounts">{steps.map(value=><button type="button" key={value} className={custom===value?'is-active':''} onClick={()=>setCustom(value)}>${value}</button>)}</div><label htmlFor="angel-amount">YOUR AMOUNT / USD</label><div className="v24-support-amount-input"><span>$</span><input id="angel-amount" type="number" min={100} max={1000} step={1} value={custom} onChange={e=>setCustom(e.target.value===''?0:Number(e.target.value))}/></div></div>}
       <form className="v24-support-form" onSubmit={submit}>
         <div className="v24-support-fields"><label>YOUR NAME<input required autoComplete="name" maxLength={90} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></label><label>YOUR EMAIL<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label></div>
         <label className="v24-support-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to purchase the digital album and receive a purchase receipt and download link by email. I have read the <Link href="/privacy">privacy notice</Link>.</span></label>
         <button type="submit" disabled={!ready||busy||checking||!consent||!name||!email||(level==='patron'&&(custom<100||custom>1000||!Number.isInteger(custom)))} className="v24-support-submit">{checking?'Checking checkout…':!ready?'DIGITAL ALBUM COMING SOON':busy?'OPENING SECURE CHECKOUT…':`SUPPORT WITH $${level==='album'?40:custom}`}<ArrowUpRight size={20}/></button>
         <p className="v24-support-note"><LockKeyhole size={13}/>{ready?'Secure payment via Flutterwave. The album is unlocked only after payment verification.':'Digital purchases are not open yet. No payment will be taken.'}</p>
         <p className="v24-support-status" role="status" aria-live="polite">{note}</p>
       </form>
     </div>
   </div>
 </section>;
}
