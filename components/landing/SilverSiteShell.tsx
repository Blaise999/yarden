"use client";
import React, {useEffect, useRef, useState} from "react";
import {ArrowUpRight, Menu, X} from "lucide-react";
import Link from "next/link";

const links = [
  ["Music", "/music"],
  ["Listening parties", "/#tour"],
  ["Films", "/films"],
  ["Vinyl", "/vinyl"],
  ["Mugshot", "/mugshot"],
  ["Journal", "/journal"],
  ["The Yard", "/yard"],
  ["About", "/about"],
];
export default function SilverSiteShell({children}:{children:React.ReactNode}) {
 const [menu,setMenu]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null);
 const menuRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   if (!menu) return;
   const old=document.body.style.overflow;
   const trigger=menuButton.current;
   document.body.style.overflow="hidden";
   const focus=Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a,button')??[]);
   focus[0]?.focus();
   function key(e:KeyboardEvent){
     if(e.key==="Escape") setMenu(false);
     if(e.key!=="Tab" || !focus.length) return;
     if(e.shiftKey && document.activeElement===focus[0]){e.preventDefault();focus[focus.length-1]?.focus();}
     if(!e.shiftKey && document.activeElement===focus[focus.length-1]){e.preventDefault();focus[0]?.focus();}
   }
   window.addEventListener("keydown",key);
   return ()=>{document.body.style.overflow=old;window.removeEventListener("keydown",key);trigger?.focus()};
 },[menu]);
 return <div className="yd v23">
   <a className="v23-skip" href="#main-content">Skip to content</a>
   <header className="v23-nav">
     <Link className="v23-brand" href="/" aria-label="Yarden home"><img src="/Pictures/yard2.png" width={1778} height={696} alt="Yarden" /></Link>
     <nav className="v23-primary" aria-label="Main navigation"><Link href="/music">Music</Link><Link href="/#tour">Listening parties</Link><Link href="/yard">The Yard</Link></nav>
     <button ref={menuButton} className="v23-menu-button" type="button" aria-controls="v23-menu" aria-expanded={menu} onClick={()=>setMenu(true)}><span>Explore</span><Menu size={19}/></button>
   </header>
   {menu && <div className="v23-menu-overlay" role="dialog" aria-modal="true" id="v23-menu" aria-label="Explore Yarden" ref={menuRef}>
     <div className="v23-menu-heading"><span>YARDEN / DIRECTORY</span><button type="button" aria-label="Close navigation" onClick={()=>setMenu(false)}><X size={24}/></button></div>
     <nav aria-label="Explore the website">{links.map(([label,url],i)=><Link key={url} href={url} onClick={()=>setMenu(false)}><small>{String(i+1).padStart(2,"0")}</small><span>{label}</span><ArrowUpRight size={18}/></Link>)}</nav>
     <div className="v23-menu-note">ANGEL — THE DEBUT ALBUM · OUT NOW</div>
   </div>}
   <main id="main-content">{children}</main>
   <footer className="v23-footer">
     <div className="v23-footer-top"><Link href="/" aria-label="Yarden home"><img src="/Pictures/yard2.png" alt="Yarden" width={1778} height={696}/></Link><p>Music for everything you feel.</p></div>
     <div className="v23-footer-links"><div><Link href="/music">Music</Link><Link href="/films">Films</Link><Link href="/vinyl">Vinyl</Link><Link href="/mugshot">Mugshot</Link><Link href="/yard">The Yard</Link><Link href="/journal">Journal</Link></div><div><a href="https://www.instagram.com/thisisyarden/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.youtube.com/@thisisyarden" target="_blank" rel="noopener noreferrer">YouTube ↗</a><a href="https://www.tiktok.com/@thisisyarden" target="_blank" rel="noopener noreferrer">TikTok ↗</a></div></div>
     <div className="v23-footer-bottom"><span>© {new Date().getFullYear()} Yarden</span><span>DESIGN & DEVELOPMENT / BLAISETECHH</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div>
   </footer>
 </div>;
}
