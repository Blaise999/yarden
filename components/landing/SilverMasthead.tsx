import React from "react";
export default function SilverMasthead({kicker,title,description,photo=true}:{kicker:string;title:string;description?:string;photo?:boolean}){
 return <section className={`v23-masthead${photo?'':' v23-masthead--plain'}`}>
   {photo && <div className="v23-masthead-image"><img src="/editorial/yarden-studio.webp" width={1200} height={1800} alt="Yarden studio portrait" loading="eager" decoding="async" /></div>}
   <div className="v23-masthead-copy"><span className="v23-overline">{kicker}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>
 </section>
}
