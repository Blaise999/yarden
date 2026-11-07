'use client';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { AngelConfig } from '../../libs/angelStore';
import AngelMugshot from './AngelMugshot';
import { getPublicAngel } from './angelPublicClient';

export default function AngelExtras({mode="all"}:{mode?:"all"|"vinyl"|"mugshot"}) {
  const showVinyl = mode !== "mugshot";
  const showMugshot = mode !== "vinyl";
  const [config, setConfig] = useState<AngelConfig | null>(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    if (!showVinyl) return;
    void getPublicAngel()
      .then(data => { if (active) setConfig(data); })
      .catch(() => { if (active) setError('Reservations and dates are temporarily unavailable.'); });
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
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your order.'); }
    finally { setBusy(false); }
  }

  return <div className="angel-extras">
    {showVinyl && <section className="section-pad vinyl-section" id="vinyl">
      <div>
        <p className="eyeline">THE RECORD / KEEP IT FOREVER</p><h2>{config?.vinylTitle || 'ANGEL — on wax.'}</h2>
        <div className="vinyl-display"><img src="/Pictures/angel.jpg" alt="ANGEL album sleeve" loading="lazy" /><span aria-hidden="true" /></div>
        <p>{config?.vinylDescription}</p><small>{config?.priceLabel}</small>
      </div>
      <div>{config?.vinylEnabled ? <>{sent ? <div role="status" className="order-success"><h3>Your request is in.</h3><p>Reference: {sent}</p><p>The team will contact you to confirm availability, payment and shipping. No payment has been taken.</p><button onClick={() => setSent('')}>Place another request</button></div> : <form onSubmit={order}>
        <h3>Reserve your copy.</h3>
        {([['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone / WhatsApp'], ['country', 'Country'], ['address', 'Delivery address']] as const).map(([key, label]) =>
          <label key={key}>{label}<input name={key} type={key === 'email' ? 'email' : 'text'} required maxLength={key === 'email' ? 254 : 500} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'country' ? 'country-name' : 'street-address'} /></label>
        )}
        <label>Copies<input name="quantity" type="number" min="1" max="10" defaultValue="1" required /></label>
        <label>Anything else?<textarea name="note" maxLength={1000} /></label>
        <label className="order-consent"><input name="consent" type="checkbox" required /> I agree to be contacted about this order and have read the <a href="/privacy">privacy notice</a>.</label>
        <button disabled={busy}>{busy ? 'Saving your request…' : 'Send vinyl order ↗'}</button><small>Reservation request only. Price, shipping and payment are confirmed by the team.</small>
      </form>}</> : <p>{config ? 'Vinyl reservations are currently closed.' : 'Loading availability…'}</p>}
      <p role="status">{error}</p></div>
    </section>}
    {showMugshot && <AngelMugshot />}
  </div>;
}
