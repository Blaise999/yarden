'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import type { AngelConfig, Party, VinylOrder } from '../../../libs/angelStore';

const field = 'w-full min-w-0 rounded-lg border border-white/20 bg-white/[0.07] p-3 text-sm text-white placeholder-white/30 outline-none focus:border-lime-200';
const label = 'block text-xs uppercase tracking-widest text-white/60 mb-2';

function Field({ name, value, onChange, type = 'text', hint, multiline = false }: {
  name: string; value: string; onChange: (value: string) => void; type?: string; hint?: string; multiline?: boolean;
}) {
  return <label className="block"><span className={label}>{name}</span>
    {multiline ? <textarea rows={3} className={field} value={value} maxLength={1500} onChange={e => onChange(e.target.value)} placeholder={hint} />
      : <input className={field} type={type} value={value} maxLength={1500} onChange={e => onChange(e.target.value)} placeholder={hint} />}
  </label>;
}

function PhotoEditor({ value, onChange, name }: {value: string; onChange: (url: string) => void; name: string}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const image = e.target.files?.[0];
    if (!image) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(image.type) || image.size > 4 * 1024 * 1024) {
      setError('Use JPG, PNG, WebP or GIF under 4 MB.'); return;
    }
    setUploading(true);
    try {
      const form = new FormData(); form.append('file', image);
      const response = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: form });
      const data = await response.json();
      if (!response.ok || !data.url) throw Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); if (uploadRef.current) uploadRef.current.value = ''; }
  }
  return <div className="space-y-3">
    <span className={label}>{name}</span>
    {value && <div className="w-full max-w-xs aspect-[4/5] overflow-hidden rounded-lg bg-white/10"><img src={value} alt="Current listening-party artwork" className="h-full w-full object-cover" /></div>}
    <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleUpload} className="hidden" />
    <button type="button" disabled={uploading} onClick={() => uploadRef.current?.click()} className="rounded-lg bg-lime-200 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload photo'}</button>
    <Field name="Or paste image URL" value={value} onChange={onChange} hint="https://… or /Pictures/…" />
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    <p className="text-xs text-white/50">Photos require Vercel Blob storage and BLOB_READ_WRITE_TOKEN. Files up to 4 MB.</p>
  </div>;
}

function Panel({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return <section className="rounded-2xl border border-white/15 bg-white/[0.035] p-5 sm:p-7 my-6 space-y-5"><div><h2 className="text-2xl font-semibold text-white">{title}</h2>{subtitle && <p className="text-sm text-white/60 mt-2">{subtitle}</p>}</div>{children}</section>;
}

export default function AngelAdmin() {
  const [config, setConfig] = useState<AngelConfig | null>(null);
  const [orders, setOrders] = useState<VinylOrder[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch('/api/admin/angel', { credentials: 'include', cache: 'no-store' })
      .then(async response => { const body = await response.json(); if (!response.ok) throw Error(body.error); setConfig(body.config); setOrders(body.orders); })
      .catch(error => setMessage(error.message || 'Unable to load the admin dashboard'));
  }, []);

  function edit(next: AngelConfig) { setConfig(next); setDirty(true); setMessage(''); }
  function updateParty(index: number, data: Partial<Party>) {
    if (!config) return;
    edit({ ...config, parties: config.parties.map((party, i) => i === index ? { ...party, ...data } : party) });
  }
  async function save() {
    if (!config || busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/angel', {
        method: 'PUT', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(config),
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error || 'Unable to save');
      setMessage('Saved. Your listening-party updates are now available on the website.');
      setDirty(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Network error; changes were not saved.'); }
    finally { setBusy(false); }
  }
  async function updateOrder(id: string, status: VinylOrder['status']) {
    try {
      const response = await fetch('/api/admin/angel', {method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});
      if (!response.ok) throw Error('Could not update order');
      setOrders(rows => rows.map(row => row.id === id ? {...row,status} : row));
      setMessage('Order updated.');
    } catch { setMessage('Order status update failed.'); }
  }

  return <main className="min-h-screen bg-[#0d1010] text-[#f3f2e9] px-5 py-10 sm:px-10">
    <div className="mx-auto max-w-5xl">
      <a href="/admin" className="text-sm text-lime-200">← Main admin</a>
      <p className="mt-9 text-xs font-semibold uppercase tracking-[.3em] text-lime-200">ANGEL / THE YARD</p>
      <h1 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-tight">Listening parties <span className="font-serif italic font-normal">& vinyl.</span></h1>
      <p className="mt-4 max-w-2xl text-white/60 text-sm leading-6">Everything you save here updates the listening-party area on the homepage. Edit the artwork, headline, locations, date, time and event links.</p>
      {message && <p role="status" className="my-5 rounded-lg border border-lime-200/30 p-4 text-sm">{message}</p>}
      {!config ? <p className="mt-10">Loading your settings…</p> : <>
        <Panel title="Listening room — appearance" subtitle="These settings control the entire listening-party block on the homepage.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="Small heading" value={config.partyEyebrow || ''} onChange={v => edit({...config, partyEyebrow:v})} hint="ANGEL / IN PERSON" />
            <Field name="Main headline" value={config.partyTitle || ''} onChange={v => edit({...config, partyTitle:v})} hint="The listening room." />
          </div>
          <Field name="Introduction" multiline value={config.partyDescription || ''} onChange={v => edit({...config, partyDescription:v})} />
          <PhotoEditor name="Default section photograph" value={config.partyImage || ''} onChange={v => edit({...config, partyImage:v})} />
        </Panel>
        <Panel title={`Listening-party dates (${config.parties.length})`} subtitle="Publish only real, confirmed dates. Each event can have its own photograph and description; select it on the site to change the featured image.">
          {config.parties.length === 0 && <p className="text-sm text-white/60">No events yet. The homepage will show “Dates coming soon” until you publish one.</p>}
          {config.parties.map((party, i) => <fieldset key={party.id} className="rounded-xl border border-white/20 bg-black/25 p-4 sm:p-6 space-y-5">
            <legend className="px-2 text-lime-200 font-semibold">{party.title || party.city || `New listening party ${i+1}`}</legend>
            <label className="inline-flex items-center gap-3 text-sm"><input type="checkbox" checked={party.published !== false} onChange={e => updateParty(i, {published:e.target.checked})} className="accent-lime-200" /> Published on homepage</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="Event title" value={party.title || ''} onChange={v => updateParty(i,{title:v})} hint="An evening with ANGEL" />
              <Field name="Date" type="date" value={party.date} onChange={v => updateParty(i,{date:v})} />
              <Field name="City" value={party.city} onChange={v => updateParty(i,{city:v})} hint="Lagos" />
              <Field name="Venue" value={party.venue} onChange={v => updateParty(i,{venue:v})} hint="Venue name" />
              <Field name="Time (include timezone)" value={party.time} onChange={v => updateParty(i,{time:v})} hint="7 PM WAT" />
              <Field name="Status" value={party.status} onChange={v => updateParty(i,{status:v})} hint="RSVP open / coming soon" />
              <Field name="Event link (HTTPS)" value={party.link} onChange={v => updateParty(i,{link:v})} hint="https://…" />
              <Field name="Button text" value={party.buttonText || ''} onChange={v => updateParty(i,{buttonText:v})} hint="RSVP / EVENT DETAILS" />
            </div>
            <Field name="Event description" multiline value={party.description || ''} onChange={v => updateParty(i,{description:v})} />
            <PhotoEditor name="Event photograph (overrides default when selected)" value={party.image || ''} onChange={v => updateParty(i,{image:v})} />
            <button type="button" className="border border-red-400/40 rounded-lg px-4 py-2 text-sm text-red-200" onClick={() => edit({...config, parties:config.parties.filter(p => p.id !== party.id)})}>Remove this date</button>
          </fieldset>)}
          <button type="button" className="rounded-lg border border-lime-200/50 px-4 py-3 text-sm font-semibold" onClick={() => edit({...config, parties:[...config.parties, {id:crypto.randomUUID(),city:'',venue:'',date:'',time:'',link:'',status:'Coming soon',title:'',description:'',image:'',buttonText:'Event details',published:false}]})}>+ Add listening party</button>
          <p className="text-xs text-white/55">All fields marked by the editor should be completed before publishing. New dates start hidden.</p>
        </Panel>
        <Panel title="Vinyl reservation settings">
          <label className="inline-flex gap-3 items-center"><input type="checkbox" checked={config.vinylEnabled} onChange={e => edit({...config,vinylEnabled:e.target.checked})} /> Accept vinyl requests</label>
          {(['vinylTitle','vinylDescription','priceLabel'] as const).map(k => <Field key={k} name={k} value={config[k]} onChange={v => edit({...config,[k]:v})} />)}
        </Panel>
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 border border-lime-200/40 bg-[#141914] px-5 py-4 rounded-xl shadow-lg">
          <span className="text-sm text-white/60">{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
          <button disabled={busy || !dirty} onClick={save} className="bg-lime-200 text-black font-bold rounded-lg px-6 py-3 disabled:opacity-40">{busy ? 'Saving…' : 'Save & publish updates'}</button>
        </div>
        <Panel title={`Vinyl orders (${orders.length})`} subtitle="These are order requests; payment is arranged separately.">
          {orders.length === 0 && <p className="text-white/50">No vinyl orders yet.</p>}
          {orders.map(order => <article key={order.id} className="border-t border-white/20 py-5 space-y-2 text-sm">
            <h3 className="text-lg font-semibold">{order.name} · {order.quantity} × {order.product}</h3>
            <p className="text-white/60">{order.createdAt} · {order.id}</p><p>{order.email} · {order.phone}</p>
            <p className="whitespace-pre-wrap">{order.address}, {order.country}</p><p>{order.note}</p><p className="text-white/60">{order.priceLabel}</p>
            <label className="flex items-center gap-3">Status <select className="rounded-lg bg-[#222] p-2" value={order.status} onChange={e => updateOrder(order.id,e.target.value as VinylOrder['status'])}>{(['new','contacted','fulfilled','cancelled'] as const).map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          </article>)}
        </Panel>
      </>}
    </div>
  </main>;
}
