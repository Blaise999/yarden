'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import type { AngelConfig, Party } from '../../libs/angelStore';
import AnkhMark from '../AnkhMark';

const FALLBACK_PHOTO = '/Pictures/yarden4.png';

function dateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return { month: 'DATE', day: 'TBA', long: value || 'Date to be announced' };
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return { month: 'DATE', day: 'TBA', long: value };
  return {
    month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase(),
    day: match[3],
    long: new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
  };
}

function PartyPhoto({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return <img src={broken ? FALLBACK_PHOTO : src} alt={alt} loading="lazy" decoding="async" onError={() => setBroken(true)} />;
}

export default function ListeningPartySection() {
  const [config, setConfig] = useState<AngelConfig | null>(null);
  const [selected, setSelected] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/angel', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw Error('Unable to load dates');
        return response.json() as Promise<AngelConfig>;
      })
      .then((data) => setConfig(data))
      .catch((error) => { if (error?.name !== 'AbortError') setLoadError(true); });
    return () => controller.abort();
  }, []);

  const parties = useMemo(() => (config?.parties || [])
    .filter((party: Party) => party.published !== false && party.city?.trim() && party.venue?.trim() && party.date?.trim())
    .sort((a, b) => a.date.localeCompare(b.date)), [config]);
  const current = parties.find(party => party.id === selected) || parties[0];
  const cover = current?.image || config?.partyImage || FALLBACK_PHOTO;
  const headline = config?.partyTitle?.trim() || 'The listening room.';
  const intro = config?.partyDescription?.trim() || 'Good music hits differently when we hear it together. Find your place in the room.';
  const eyebrow = config?.partyEyebrow?.trim() || 'ANGEL / IN PERSON';

  return (
    <section className="lp-section" id="tour" aria-labelledby="lp-title">
      <div className="lp-art">
        <PartyPhoto src={cover} alt={current ? `${current.title || 'Yarden listening party'} — ${current.city}` : 'Yarden — ANGEL listening room'} />
        <div className="lp-art-shade" aria-hidden="true" />
        <div className="lp-art-top"><span>YARDEN / ANGEL</span><span>THE LISTENING SESSIONS</span></div>
        <div className="lp-art-bottom">
          <AnkhMark className="lp-art-symbol" />
          <p>{current ? current.title || 'A night with ANGEL.' : 'THE MUSIC. THE MOMENT. THE ROOM.'}</p>
          <small>{current ? `${current.city.toUpperCase()} · ${dateParts(current.date).long.toUpperCase()}` : 'YOUR INVITATION IS COMING'}</small>
        </div>
      </div>
      <div className="lp-editorial">
        <div className="lp-eyebrow"><span className="lp-pulse" />{eyebrow}<span>EST. 2026</span></div>
        <h2 id="lp-title">{headline === 'The listening room.' ? <>The listening<br /><em>room.</em></> : headline}</h2>
        <p className="lp-description">{intro}</p>
        <div className="lp-divider" />
        <div className="lp-events-label"><span><CalendarDays size={15} /> UPCOMING GATHERINGS</span><span>{parties.length ? String(parties.length).padStart(2, '0') : '—'}</span></div>
        {!config && !loadError ? <p className="lp-empty" role="status">Checking listening-party dates…</p> : parties.length ? (
          <div className="lp-events">
            {parties.map(party => {
              const d = dateParts(party.date);
              const active = current?.id === party.id;
              return <button type="button" key={party.id} className={`lp-event${active ? ' is-active' : ''}`} onClick={() => setSelected(party.id)} aria-pressed={active}>
                <span className="lp-event-date"><strong>{d.day}</strong><small>{d.month}</small></span>
                <span className="lp-event-details"><strong>{party.title?.trim() || party.city}</strong><small><MapPin size={12} /> {party.venue}, {party.city}</small><small>{party.time || 'Time to be announced'}</small></span>
                <span className="lp-event-arrow"><ArrowUpRight size={20} /></span>
              </button>;
            })}
          </div>
        ) : <p className="lp-empty">Dates will be announced here. Be first to hear when the next room opens.</p>}
        {current?.description && <p className="lp-active-desc">{current.description}</p>}
        <div className="lp-footer">
          {current?.link ? <a className="lp-cta" href={current.link} target="_blank" rel="noopener noreferrer">{current.buttonText || 'EVENT DETAILS'} <ArrowUpRight size={18}/></a> : <a className="lp-cta" href="#join">JOIN THE YARD <ArrowUpRight size={18}/></a>}
          <span>{current?.status || 'NO TICKET REQUIRED TO STAY IN THE LOOP'}</span>
        </div>
      </div>
    </section>
  );
}
