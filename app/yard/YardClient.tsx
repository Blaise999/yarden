"use client";
import {useState} from "react";
import {ArrowUpRight} from "lucide-react";
import {PassModal} from "../../components/landing/PassModal";
export default function YardClient(){const[open,setOpen]=useState(false);return <section className="v23-subsection v23-yard-page"><span className="v23-overline">THE YARD / MEMBERS</span><h2>Closer to<br/>the music.</h2><p>Build your own Yard Pass and be part of the story. Free to keep. Not an event ticket.</p><button type="button" className="v23-action-primary" onClick={()=>setOpen(true)}>Create your Yard Pass <ArrowUpRight size={18}/></button><img className="v23-yard-emblem" src="/brand/yard-original-ivory.png" alt="The Yard emblem" loading="lazy" />{open&&<PassModal open={open} onClose={()=>setOpen(false)}/>}</section>}
