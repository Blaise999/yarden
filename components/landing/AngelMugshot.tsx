'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Download, ImagePlus, RefreshCw } from 'lucide-react';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1536;

function board(ctx: CanvasRenderingContext2D, fanName: string, caseNumber: string, vertical = 0) {
  const x = 0.165 * CANVAS_WIDTH;
  const y = (0.615 + vertical) * CANVAS_HEIGHT;
  const w = 0.67 * CANVAS_WIDTH;
  const h = 0.21 * CANVAS_HEIGHT;
  ctx.save();
  ctx.shadowColor = '#0009'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#111111'; ctx.fillRect(x, y, w, h);
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 3;
  ctx.strokeStyle = '#ddd8c6'; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  const line = (offset: number) => { ctx.beginPath(); ctx.moveTo(x + 35, y + offset); ctx.lineTo(x + w - 35, y + offset); ctx.stroke(); };
  ctx.strokeStyle = '#e4e0d3'; ctx.lineWidth = 1.8;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3f1e9';
  ctx.font = 'bold 76px Impact, "Arial Narrow", Arial, sans-serif';
  ctx.fillText('YARDEN', x + w / 2, y + 68, w - 55);
  line(118);
  ctx.font = 'bold 63px Impact, "Arial Narrow", Arial, sans-serif';
  ctx.fillText('ANGEL — OUT NOW', x + w / 2, y + 164, w - 52);
  line(205);
  ctx.font = 'bold 24px Arial, sans-serif';
  const upperName = (fanName.trim() || 'AN ANGEL').toUpperCase();
  ctx.fillText(`NAME: ${upperName}`, x + w / 2, y + 244, w - 65);
  ctx.font = '19px Arial, sans-serif';
  ctx.fillText(`FILE #${caseNumber}    •    GUILTY OF FEELING EVERYTHING`, x + w / 2, y + 283, w - 66);
  ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#f4f2eb'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.shadowColor = '#000b'; ctx.shadowBlur = 5;
  ctx.fillText('YARDEN  /  THE ANGEL FILES  /  2026', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 45);
  ctx.restore();
}

async function compressedSelfie(input: File) {
  const url = URL.createObjectURL(input);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Cannot read photo.')); img.src = url; });
    const max = 1500;
    const ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * ratio); c.height = Math.round(img.naturalHeight * ratio);
    if (!c.width || !c.height) throw new Error('Photo has invalid dimensions.');
    const context = c.getContext('2d'); if (!context) throw new Error('Photo processing unavailable.');
    context.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob>((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('Photo conversion failed.')), 'image/jpeg', .84));
    if (blob.size > 3 * 1024 * 1024) throw new Error('Photo is too large after processing.');
    return new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
  } finally { URL.revokeObjectURL(url); }
}

export default function AngelMugshot() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState('');
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [caseNumber, setCaseNumber] = useState('000001');
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => () => { if (thumbnail) URL.revokeObjectURL(thumbnail); }, [thumbnail]);
  useEffect(() => {
    if (!generated || !canvas.current) return;
    const c = canvas.current;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const img = new Image();
    let active = true;
    img.onload = () => {
      if (!active) return;
      ctx.clearRect(0, 0, c.width, c.height);
      // The model is asked for a 2:3 photo; crop defensively if its dimensions differ.
      const scale = Math.max(c.width / img.width, c.height / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      board(ctx, name, caseNumber, offset);
    };
    img.src = generated;
    return () => { active = false; };
  }, [generated, name, caseNumber, offset]);

  function choose(file?: File) {
    if (!file) return;
    setError(''); setGenerated('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image under 20 MB.'); return;
    }
    setPhoto(file);
    setThumbnail(URL.createObjectURL(file));
  }

  async function generate() {
    if (!photo || !consent || busy) return;
    setBusy(true); setError(''); setGenerated(''); setOffset(0);
    try {
      const compressed = await compressedSelfie(photo);
      const body = new FormData();
      body.set('photo', compressed); body.set('consent', 'yes');
      const response = await fetch('/api/mugshot', { method: 'POST', body });
      const data: { image?: string; error?: string } = await response.json();
      if (!response.ok || !data.image?.startsWith('data:image/jpeg;base64,')) throw new Error(data.error || 'Could not create a mugshot.');
      const number = Math.floor(Math.random() * 900000) + 100000;
      setCaseNumber(String(number)); setGenerated(data.image);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  function download() {
    if (!canvas.current || !generated) return;
    canvas.current.toBlob(blob => {
      if (!blob) { setError('Download failed.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.download = 'Yarden-ANGEL-Mugshot.png'; a.href = url; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  }

  return (
    <section className="angel-mugshot section-pad" id="mugshot" aria-labelledby="angel-mugshot-title">
      <div className="angel-mugshot__intro">
        <p className="eyeline">THE ANGEL FILES / FAN EXPERIENCE</p>
        <h2 id="angel-mugshot-title">Wanted for <em>love.</em></h2>
        <p>Be the face of the ANGEL era. Upload a selfie and get your own cinematic booking photograph, made for you.</p>
        <span>YARDEN <span aria-hidden="true">☥</span> ANGEL — OUT NOW</span>
      </div>
      <div className="angel-mugshot__grid">
        <div className="angel-mugshot__controls">
          <label className="angel-mugshot__upload">
            <ImagePlus size={24} aria-hidden="true" />
            <strong>{photo ? 'Change your selfie' : 'Choose a selfie'}</strong>
            <small>Clear, front-facing photos work best. JPG, PNG or WebP (20 MB max before resize).</small>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => choose(e.target.files?.[0])} />
          </label>
          {thumbnail && <img className="angel-mugshot__thumbnail" src={thumbnail} alt="Your chosen selfie" />}
          <label className="angel-mugshot__field">Your name on the slate
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" maxLength={24} />
          </label>
          <label className="angel-mugshot__consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I own this photo or have permission to use it, and I agree to have it temporarily sent to an AI image provider to create my promotional photo. <a href="/privacy">Privacy details</a>.</span></label>
          <button className="angel-mugshot__generate" onClick={generate} disabled={!photo || !consent || busy}>
            {busy ? 'Creating your mugshot…' : generated ? 'Generate another mugshot' : 'Get my mugshot'} <ArrowUpRight size={19} />
          </button>
          <p className="angel-mugshot__note" aria-live="polite" role="status">{busy ? 'Rendering a realistic scene with your face and hands. This can take a moment.' : error || 'A real AI photo transformation, not a face pasted onto a poster. Up to 3 attempts per hour.'}</p>
          {generated && <>
            <label className="angel-mugshot__field">Adjust the booking slate position
              <input type="range" min="-0.06" max="0.06" step="0.005" value={offset} onChange={e => setOffset(Number(e.target.value))} />
            </label>
            <div className="angel-mugshot__actions"><button onClick={download}><Download size={18} /> Download HD photo</button><button onClick={generate} disabled={busy}><RefreshCw size={18} /> Try again</button></div>
          </>}
          <small className="angel-mugshot__footnote">Fictional promotional artwork only — not a real arrest or government document. Your generated image is not saved to a public gallery.</small>
        </div>
        <div className="angel-mugshot__preview">
          {generated ? <canvas ref={canvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label="Your generated Yarden ANGEL mugshot" /> : <div className="angel-mugshot__placeholder" aria-label="Mugshot stage preview"><div className="angel-mugshot__ruler"/><div className="angel-mugshot__outline"><span>YOUR FACE<br />GOES HERE</span></div><div className="angel-mugshot__slate"><strong>YARDEN</strong><b>ANGEL — OUT NOW</b><small>GUILTY OF FEELING EVERYTHING</small></div><span className="angel-mugshot__corner">FILE YOURSELF UNDER ANGEL / 2026</span></div>}
        </div>
      </div>
    </section>
  );
}
