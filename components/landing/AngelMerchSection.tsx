"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, MoveHorizontal } from "lucide-react";

const pieces = [
  {
    id: "01", name: "ANGEL UNIFORM", shade: "The Ivory Edit", color: "IVORY / WHITE",
    cover: "/merch/angel-drop/ivory-product.webp",
    editorial: "/merch/angel-drop/ivory-editorial.webp",
    alt: "White Yarden's Angel cropped shirt, front product view",
  },
  {
    id: "02", name: "ANGEL UNIFORM", shade: "The Noir Edit", color: "NOIR / BLACK",
    cover: "/merch/angel-drop/noir-product.webp",
    editorial: "/merch/angel-drop/noir-editorial.webp",
    alt: "Black Yarden's Angel cropped shirt, front product view",
  },
];

export default function AngelMerchSection() {
  const root = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const o = new IntersectionObserver(([entry]) => { if(entry.isIntersecting){setVisible(true); o.disconnect();} }, {threshold:0.08});
    o.observe(root.current);
    return () => o.disconnect();
  }, []);
  return <section id="merch" ref={root} className={`v24-merch ${visible ? "is-visible" : ""}`} aria-labelledby="v24-merch-title">
    <div className="v24-merch-topline"><span>04 / THE ANGEL WARDROBE</span><span>LIMITED FIRST EDITION <span aria-hidden="true">✧</span> 2026</span></div>
    <div className="v24-merch-heading"><div><p className="v24-merch-kicker">PIECES FROM THE WORLD OF ANGEL</p><h2 id="v24-merch-title">Wear the <em>feeling.</em></h2></div><p>Not just something to listen to. Something to live in. The first pieces from the ANGEL era.</p></div>
    <div className="v24-merch-campaign">
      <div className="v24-merch-campaign-photo"><img src="/merch/angel-drop/campaign.webp" alt="Models wearing the white and black Yarden's Angel cropped tops" loading="lazy" decoding="async" width={1000} height={1333}/></div>
      <div className="v24-merch-campaign-copy"><span>YARDEN / ANGEL</span><strong>AN<br/>ANGEL<br/>IN EVERY<br/><i>SHADE.</i></strong><small>THE WARDROBE IS COMING.</small><ArrowDownRight size={36} strokeWidth={1}/></div>
      <span className="v24-merch-campaign-number">DROP 001 — 002</span>
    </div>
    <div className="v24-merch-drop-heading"><div><span>THE FIRST TWO PIECES</span><p>A small collection. A feeling you can wear.</p></div><span><MoveHorizontal size={16}/> HOVER TO SEE IT WORN</span></div>
    <div className="v24-merch-products">
      {pieces.map((piece, index) => <article className="v24-merch-card" key={piece.id} style={{"--merch-index":index} as CSSProperties}>
        <div className="v24-merch-card-photo">
          <img className="v24-merch-product-img" src={piece.cover} alt={piece.alt} loading="lazy" decoding="async" width={900} height={900}/>
          <img className="v24-merch-editorial-img" src={piece.editorial} alt={`Campaign look: ${piece.shade}`} loading="lazy" decoding="async" width={900} height={1200}/>
          <span className="v24-merch-patch">DROP 001</span>
          <span className="v24-merch-card-counter">0{index+1} / 02</span>
          <span className="v24-merch-photo-hint">THE LOOK ↗</span>
        </div>
        <div className="v24-merch-card-label"><div><span>{piece.color}</span><h3>{piece.name}</h3><p>{piece.shade}</p></div><div className="v24-merch-card-price"><strong>PRICE TBA</strong><small>COMING SOON</small></div></div>
      </article>)}
    </div>
    <div className="v24-merch-tail"><span>THE ANGEL DROP / MORE TO COME</span><Link href="/#letters">Be first to know <ArrowRight size={18}/></Link></div>
    <div className="v24-merch-marquee" aria-hidden="true"><div>ANGEL IS A FEELING ✧ ANGEL IS A FEELING ✧ ANGEL IS A FEELING ✧ ANGEL IS A FEELING ✧ </div></div>
  </section>;
}
