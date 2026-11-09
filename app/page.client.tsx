"use client";
import React, {useState} from "react";
import Link from "next/link";
import {ArrowDownRight,ArrowUpRight, ArrowRight} from "lucide-react";
import SilverSiteShell from "../components/landing/SilverSiteShell";
import ListeningPartySection from "../components/landing/ListeningPartySection";
import HomeMusicSection from "../components/landing/HomeMusicSection";
import HomeMugshotSection from "../components/landing/HomeMugshotSection";
import AngelMerchSection from "../components/landing/AngelMerchSection";
import DigitalSupportSection from "../components/landing/DigitalSupportSection";
import type {ReleaseItem} from "../components/landing/ReleasesSection";

function albumLink(r?:ReleaseItem){return r?.links?.[r.primary||"apple"]||r?.fanLink||r?.links?.spotify||r?.links?.apple||"/music";}
export default function PageClient({releases=[]}:{releases:ReleaseItem[]}){
 const album=releases.find(r=>r.format?.toLowerCase()==="album")||releases[0];
 const [email,setEmail]=useState("");
 const [consent,setConsent]=useState(false);
 const [status,setStatus]=useState("");
 const [sending,setSending]=useState(false);
 async function signup(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); if(sending)return;setSending(true);setStatus("");
  try{
    const res=await fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,consent})});
    const json=await res.json();if(!res.ok)throw new Error(json.error||"Please try again.");
    setStatus(json.message||"You're on the list.");setEmail("");setConsent(false);
  }catch(err){setStatus(err instanceof Error?err.message:"Please try again.")}
  finally{setSending(false)}
 }
 return <SilverSiteShell>
  <section className="v23-hero" id="top" aria-labelledby="v23-hero-title">
   <picture className="v23-hero-visual"><source media="(max-width: 700px)" srcSet="/editorial/yarden-hero-mobile.webp"/><img src="/editorial/yarden-hero-desktop.webp" width={1900} height={2742} alt="Yarden in a white jacket, photographed against a charcoal studio background" fetchPriority="high" decoding="async" /></picture>
   <div className="v23-hero-shade" aria-hidden="true" />
   <div className="v23-hero-body"><p className="v23-overline"><span className="v23-spark"/>YARDEN / 2026</p><p className="v23-hero-intro">THE DEBUT ALBUM</p><h1 id="v23-hero-title" className="v23-metal">ANGEL<span className="v23-period">.</span></h1><p className="v23-hero-description">Thirteen songs. Every shade of feeling.<br/>Out now, everywhere.</p><div className="v23-hero-actions"><a href={albumLink(album)} target={albumLink(album).startsWith("http")?"_blank":undefined} rel="noopener noreferrer" className="v23-action-primary">Listen to ANGEL <ArrowUpRight size={18}/></a><Link href="/music" className="v23-action-secondary">Explore the music <ArrowRight size={17}/></Link></div></div>
   <div className="v23-hero-bottom"><span>THE ANGEL ERA / THISISYARDEN.COM</span><a href="#spotlight" aria-label="Scroll to the album">SCROLL TO DISCOVER <ArrowDownRight size={17}/></a></div>
  </section>
  <section className="v23-album" id="spotlight" aria-labelledby="v23-album-title">
   <div className="v23-album-heading"><span className="v23-overline">01 / THE RECORD</span><p>A new chapter.</p></div>
   <div className="v23-album-layout"><div className="v23-album-art"><a href={albumLink(album)} target={albumLink(album).startsWith("http")?"_blank":undefined} rel="noopener noreferrer" aria-label="Stream ANGEL"><img src={album?.art||"/Pictures/angel.jpg"} alt="ANGEL official album cover" loading="lazy" decoding="async" /></a><span>YARDEN / ANGEL · 2026</span></div><div className="v23-album-copy"><h2 id="v23-album-title">The feeling<br/>takes <em>form.</em></h2><p>ANGEL — the debut album. Thirteen songs spanning every part of the story. Listen the way it was meant to be heard.</p><div className="v23-album-actions"><a href={albumLink(album)} target={albumLink(album).startsWith("http")?"_blank":undefined} rel="noopener noreferrer">Stream the album <ArrowUpRight size={18}/></a><Link href="/music">Discography <ArrowUpRight size={18}/></Link></div></div></div>
  </section>
  <HomeMusicSection releases={releases} />
  <AngelMerchSection />
  <DigitalSupportSection />
  <div className="v23-listening-heading"><span className="v23-overline">03 / THE GATHERINGS</span><p>More than a listening party.</p></div>
  <ListeningPartySection/>
  <HomeMugshotSection />
  <section className="v23-letters" id="letters" aria-labelledby="v23-letters-title"><div><span className="v23-overline">THE YARD / STAY CLOSE</span><h2 id="v23-letters-title">Keep in <em>touch.</em></h2><p>New music, listening sessions and the things worth sharing. Direct from Yarden.</p></div><form onSubmit={signup} aria-busy={sending}><div className="v23-newsletter-field"><label className="sr-only" htmlFor="v23-email">Email address</label><input id="v23-email" type="email" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/><button type="submit" disabled={sending||!consent} aria-label="Join the mailing list">{sending?"…":<ArrowRight size={20}/>}</button></div><label className="v23-newsletter-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to receive Yarden emails. Unsubscribe any time.</span></label><p className="v23-form-status" role="status" aria-live="polite">{status}</p></form></section>
 </SilverSiteShell>;
}
