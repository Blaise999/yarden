'use client';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Disc3 } from 'lucide-react';
import type { AngelConfig } from '../../libs/angelStore';
import AngelMugshot from './AngelMugshot';
import { getPublicAngel } from './angelPublicClient';

export default function AngelExtras({mode="all"}:{mode?:"all"|"vinyl"|"mugshot"}) {
  const showVinyl = mode !== 'mugshot';
  const showMugshot = mode !== 'vinyl';
  const [config, setConfig] = useState<AngelConfig | null>(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!showVinyl) return;
    void getPublicAngel()
      .then(data => { if (active) setConfig(data); })
      .catch(() => { if (active) setError('Vinyl availability is temporarily unavailable.'); });
    return () => { active = false; };
  }, [showVinyl]);

  async function order(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/vinyl-orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, quantity: Number(data.quantity), consent: data.consent === 'on' }),
      });
      const response = await r.json();
      if (!r.ok) throw Error(response.error);
      setSent(response.id);
      form.reset();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your request.'); }
    finally { setBusy(false); }
  }

  return <div className="angel-extras">
    {showVinyl && <section className="v25-vinyl" id="vinyl" aria-labelledby="v25-vinyl-title">
      <div className="v25-vinyl-lead"><span>YARDEN / ANGEL</span><span>THE VINYL EDITION</span></div>
      <div className="v25-vinyl-grid">
        <div className="v25-vinyl-editorial">
          <span className="v25-micro"><Disc3 size={15} aria-hidden="true"/> A RECORD TO HOLD ONTO</span>
          <h1 id="v25-vinyl-title">ANGEL on vinyl.</h1>
          <p>{config?.vinylDescription || 'The songs you know, in a format you can keep. Leave your details to register interest in the ANGEL vinyl edition.'}</p>
          <div className="v25-vinyl-facts"><div><span>THE RECORD</span><strong>ANGEL</strong></div><div><span>THE ARTIST</span><strong>YARDEN</strong></div><div><span>AVAILABILITY</span><strong>{config?.priceLabel || 'TO BE CONFIRMED'}</strong></div></div>
          <small>Collector concept artwork. Final pressing, packaging, price and availability will be confirmed by Yarden&apos;s team.</small>
        </div>
        <div className="v25-vinyl-stage v253-vinyl-stage">
          <img
            className="v253-vinyl-art"
            src="/editorial/angel-vinyl-cutout.webp"
            alt="ANGEL vinyl concept: Yarden album sleeve with a glossy black record partly pulled out to the right"
            width={1099}
            height={789}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      <div className="v25-vinyl-reservations">
        <div className="v25-vinyl-reservation-copy"><span className="v25-micro">GET YOUR NAME DOWN</span><h2>Keep a copy for yourself.</h2><p>Registration is an expression of interest, not a paid order. Yarden&apos;s team will contact you when pricing, stock and shipping are confirmed.</p></div>
        <div className="v25-vinyl-form-container">{config?.vinylEnabled ? (sent ? <div role="status" className="v25-vinyl-success"><Check size={35}/><h3>You&apos;re on the list.</h3><p>Request reference: <strong>{sent}</strong></p><p>No payment has been taken. The team will reach out with next steps.</p><button onClick={() => setSent('')} type="button">Submit another request <ArrowUpRight size={18}/></button></div> : <form onSubmit={order} className="v25-vinyl-form"><h3>Vinyl request</h3><div className="v25-vinyl-fields">{([['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone / WhatsApp'], ['country', 'Country'], ['address', 'Delivery address']] as const).map(([key, label]) => <label key={key}>{label}<input name={key} type={key === 'email' ? 'email' : 'text'} required maxLength={key === 'email' ? 254 : 500} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'country' ? 'country-name' : 'street-address'} /></label>)}</div><div className="v25-vinyl-fields v25-vinyl-fields-last"><label>Copies<input name="quantity" type="number" min="1" max="10" defaultValue="1" required /></label><label>Order note (optional)<textarea name="note" maxLength={1000}/></label></div><label className="v25-vinyl-consent"><input name="consent" type="checkbox" required/><span>I agree to be contacted about this request and have read the <Link href="/privacy">privacy notice</Link>.</span></label><button className="v25-vinyl-submit" type="submit" disabled={busy}>{busy ? 'Saving your request…' : 'Register interest'} <ArrowUpRight size={18}/></button><small>No deposit. No checkout. No payment required.</small></form>) : <div className="v25-vinyl-notice"><Disc3 size={28}/><h3>Not taking requests yet.</h3><p>{config ? 'The ANGEL vinyl waitlist is currently closed. Follow Yarden for an announcement.' : 'Checking vinyl availability…'}</p><Link href="/#letters">Get release updates <ArrowUpRight size={17}/></Link></div>}{error && <p role="alert" className="v25-vinyl-error">{error}</p>}</div>
      </div>
    </section>}
    {showMugshot && <AngelMugshot />}
  </div>;
}
