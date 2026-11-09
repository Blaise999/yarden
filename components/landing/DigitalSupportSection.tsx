"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Disc3, Heart, LockKeyhole, Plus } from "lucide-react";

type Level = "album" | "patron";
const steps = [100, 250, 500, 1000];

export default function DigitalSupportSection() {
  const [level, setLevel] = useState<Level>("album");
  const [custom, setCustom] = useState(100);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/support/availability", { cache: "no-store" })
      .then(response => response.json())
      .then(data => {
        if (active) {
          setReady(data.ready === true);
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) {
          setReady(false);
          setChecking(false);
        }
      });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setNote("");
    try {
      const response = await fetch("/api/support/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: level, amount: level === "album" ? 40 : custom, email, name, consent }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to open checkout.");
      window.location.assign(data.url);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not open checkout.");
      setBusy(false);
    }
  }

  return (
    <section className="v255-support" id="support-angel" aria-labelledby="v255-support-title">
      <div className="v255-support-inner">
        <div className="v255-support-heading">
          <div className="v255-support-topline"><span>YARDEN / ANGEL</span><span>DIGITAL ALBUM</span></div>
          <h2 id="v255-support-title">Own <span>ANGEL.</span></h2>
          <p>Download the album directly. $40, or choose an amount from $100 to $1,000 to support Yarden.</p>
        </div>

        <div className="v255-support-grid">
          <div className="v255-support-artstage">
            <div className="v255-support-art-wrap">
              <img
                src="/editorial/angel-vinyl-cutout.webp"
                alt="ANGEL album artwork on a vinyl sleeve, with a black record pulled out from behind it"
                loading="lazy"
                decoding="async"
                width={1099}
                height={789}
              />
            </div>
            <div className="v255-support-art-caption"><span>ANGEL — THE DEBUT ALBUM</span><span>YARDEN</span></div>
          </div>

          <div className="v255-support-purchase">
            <div className="v255-support-purchase-heading"><Heart size={15} aria-hidden="true"/><span>SUPPORT THE ARTIST</span></div>
            <h3>Choose your amount.</h3>
            <div className="v255-support-levels" role="group" aria-label="Choose support amount">
              <button type="button" className={level === "album" ? "is-selected" : ""} aria-pressed={level === "album"} onClick={() => setLevel("album") }>
                <span className="v255-level-title"><Disc3 size={18} aria-hidden="true"/> DIGITAL ALBUM</span>
                <strong>$40</strong>
                <small>COMPLETE ALBUM DOWNLOAD</small>
              </button>
              <button type="button" className={level === "patron" ? "is-selected" : ""} aria-pressed={level === "patron"} onClick={() => setLevel("patron") }>
                <span className="v255-level-title"><Plus size={18} aria-hidden="true"/> PAY WHAT IT'S WORTH</span>
                <strong>$100–$1K</strong>
                <small>SAME ALBUM, MORE SUPPORT</small>
              </button>
            </div>

            {level === "patron" && <div className="v255-support-custom">
              <div className="v255-support-amounts">{steps.map(value => <button type="button" key={value} className={custom === value ? "is-active" : ""} onClick={() => setCustom(value)}>${value}</button>)}</div>
              <label htmlFor="angel-amount">YOUR AMOUNT / USD</label>
              <div className="v255-support-amount-input"><span>$</span><input id="angel-amount" type="number" min={100} max={1000} step={1} value={custom} onChange={event => setCustom(event.target.value === "" ? 0 : Number(event.target.value))}/></div>
            </div>}

            <form className="v255-support-form" onSubmit={submit}>
              <div className="v255-support-fields">
                <label>FULL NAME<input required autoComplete="name" maxLength={90} value={name} onChange={event => setName(event.target.value)} placeholder="Your name"/></label>
                <label>EMAIL ADDRESS<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
              </div>
              <label className="v255-support-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I agree to purchase the album and receive a receipt and download link by email. I have read the <Link href="/privacy">privacy notice</Link>.</span></label>
              <button type="submit" disabled={!ready || busy || checking || !consent || !name || !email || (level === "patron" && (custom < 100 || custom > 1000 || !Number.isInteger(custom)))} className="v255-support-submit">
                {checking ? "CHECKING AVAILABILITY…" : !ready ? "DIGITAL ALBUM COMING SOON" : busy ? "OPENING CHECKOUT…" : `SUPPORT WITH $${level === "album" ? 40 : custom}`}
                <ArrowUpRight size={20} aria-hidden="true"/>
              </button>
              <p className="v255-support-note"><LockKeyhole size={14} aria-hidden="true"/>{ready ? "Secure payment via Flutterwave. Download access follows payment verification." : "Digital purchases aren't open yet. No payment will be taken."}</p>
              <p className="v255-support-status" role="status" aria-live="polite">{note}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
