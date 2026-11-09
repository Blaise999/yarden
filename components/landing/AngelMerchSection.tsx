"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type GalleryItem = { number: number; caption: string; alt: string; kind?: "art" | "photo" };

const archive: GalleryItem[] = [
  {number: 0, caption: "ANGEL / SYMBOL", alt: "White silhouette of a winged figure and blade on black", kind:"art"},
  {number: 1, caption: "DETAIL STUDY", alt: "Black fragrance and styling accessories photographed on printed paper"},
  {number: 2, caption: "BLACK & WHITE", alt: "Two campaign models wearing white and black Yarden's Angel crop tops"},
  {number: 3, caption: "ANGEL / SHADOW", alt: "Black silhouette of a winged figure on white", kind:"art"},
  {number: 4, caption: "BEHIND THE SHOT", alt: "Outdoor behind-the-scenes photograph of the campaign"},
  {number: 5, caption: "BLACK LOOK / 01", alt: "Campaign model wearing the black Yarden's Angel crop top and furry hat"},
  {number: 6, caption: "WING STUDY", alt: "Model posing outdoors with white angel wings"},
  {number: 7, caption: "AFTER DARK", alt: "Campaign model wearing the black Yarden's Angel crop top beside a red car"},
  {number: 8, caption: "CAMPAIGN ART", alt: "Illustration featuring Yarden's Angel clothing artwork", kind:"art"},
  {number: 9, caption: "BLACK LOOK / 02", alt: "Campaign model in a black Yarden's Angel crop top wearing white wings"},
  {number: 10, caption: "WHITE EDITION", alt: "Front product photograph of the white Yarden's Angel cropped t-shirt"},
  {number: 11, caption: "BLACK EDITION", alt: "Front product photograph of the black Yarden's Angel cropped t-shirt"},
  {number: 12, caption: "BEAUTY DETAIL", alt: "Close-up campaign beauty portrait with fur hat and eyewear"},
];

const image = (n: number) => `/merch/angel-drop/gallery/${String(n).padStart(2,"0")}.webp`;

export default function AngelMerchSection() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = root.current;
    if (!target) return;
    if (!("IntersectionObserver" in window)) {
      target.querySelectorAll(".v25-reveal").forEach(el => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.06, rootMargin: "0px 0px 40px 0px" });
    target.querySelectorAll(".v25-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const marquee = [...archive, ...archive];

  return <section id="merch" ref={root} className="v25-merch" aria-labelledby="v25-merch-title">
    <div className="v25-section-top"><span>YARDEN / ANGEL</span><span>MERCHANDISE — DROP 01</span></div>
    <div className="v25-merch-intro v25-reveal">
      <div><span className="v25-micro">A LITTLE PIECE OF ANGEL</span><h2 id="v25-merch-title">ANGEL <span>on you.</span></h2></div>
      <p>The first Yarden&apos;s ANGEL pieces. Two editions, full campaign archive, and the entire drop story in motion. <strong>Coming soon.</strong></p>
    </div>

    <div className="v25-campaign v25-reveal">
      <div className="v25-campaign-photo"><img src={image(2)} alt="Yarden's Angel campaign: models wearing the black and white editions" loading="lazy" decoding="async" width={1350} height={1800}/><span className="v25-campaign-stamp">THE FIRST DROP / 2026</span></div>
    </div>

    <div className="v25-merch-ticker" aria-hidden="true"><div>BLACK EDITION <span>✳</span> WHITE EDITION <span>✳</span> ANGEL / DROP 01 <span>✳</span> CAMPAIGN ARCHIVE <span>✳</span> BLACK EDITION <span>✳</span> WHITE EDITION <span>✳</span> ANGEL / DROP 01 <span>✳</span> CAMPAIGN ARCHIVE <span>✳</span></div></div>

    <div className="v25-products-heading"><h3>The two editions.</h3><span>PRICE TO BE ANNOUNCED / RELEASE DATE COMING SOON</span></div>
    <div className="v25-products">
      <article className="v25-product v25-reveal">
        <div className="v25-product-visual"><img className="v25-product-main" src={image(10)} alt="Yarden's Angel white cropped t-shirt, front product shot" width={1500} height={1518} loading="lazy" decoding="async"/><img className="v25-product-look" src={image(2)} alt="White edition worn in the Yarden's Angel campaign" width={1350} height={1800} loading="lazy" decoding="async"/><span className="v25-product-number">01 / 02</span><span className="v25-product-hint">LOOKBOOK VIEW</span></div>
        <div className="v25-product-caption"><div><span>YARDEN&apos;S ANGEL</span><h4>White Edition</h4></div><p>PRICE TBA <small>COMING SOON</small></p></div>
      </article>
      <article className="v25-product v25-reveal">
        <div className="v25-product-visual"><img className="v25-product-main" src={image(11)} alt="Yarden's Angel black cropped t-shirt, front product shot" width={1500} height={1469} loading="lazy" decoding="async"/><img className="v25-product-look" src={image(5)} alt="Black edition worn in the Yarden's Angel campaign" width={1350} height={1800} loading="lazy" decoding="async"/><span className="v25-product-number">02 / 02</span><span className="v25-product-hint">LOOKBOOK VIEW</span></div>
        <div className="v25-product-caption"><div><span>YARDEN&apos;S ANGEL</span><h4>Black Edition</h4></div><p>PRICE TBA <small>COMING SOON</small></p></div>
      </article>
    </div>

    <div className="v25-archive-title v25-reveal"><div><span className="v25-micro">THE FULL ARCHIVE / 13 FRAMES</span><h3>Behind the drop.</h3><p>Every frame from the ANGEL merch world, now scrolling automatically from left to right.</p></div></div>
    <div className="v25-archive-marquee" aria-label="Yarden's Angel campaign image gallery moving automatically from left to right">
      <div className="v25-archive-track">
        {marquee.map((item, idx) => <figure key={`${item.number}-${idx}`} className={`v25-archive-frame ${item.kind === "art" ? "is-art" : ""}`}>
          <div className="v25-archive-image"><img src={image(item.number)} alt={item.alt} loading="lazy" decoding="async" width={item.number === 0 || item.number === 8 ? 1500 : 1100} height={1800}/></div>
          <figcaption><span>{String(item.number+1).padStart(2,'0')} / 13</span><span>{item.caption}</span></figcaption>
        </figure>)}
      </div>
    </div>
    <div className="v25-merch-outro"><span>ALL MERCHANDISE COMING SOON</span><Link href="/#letters">Get the drop announcement <ArrowUpRight size={17}/></Link></div>
  </section>;
}
