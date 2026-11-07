"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Camera, X } from 'lucide-react';

// Load the selfie uploader and AI-edit UI only after a visitor asks to use it.
const MugshotStudio = dynamic(() => import('./AngelMugshot'), {
  ssr: false,
  loading: () => <p className="v23-mugshot-loading" role="status">Opening the ANGEL studio…</p>,
});

export default function HomeMugshotSection() {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const timeout = window.setTimeout(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('v23-mugshot-studio')?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth', block: 'start',
      });
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [opened]);
  return (
    <section className="v23-home-mugshot" id="fan-files" aria-labelledby="v23-home-mugshot-title">
      <div className="v23-feature-heading"><span className="v23-overline">04 / THE FAN EXPERIENCE</span><span>THE ANGEL FILES</span></div>
      <div className="v23-home-mugshot-grid">
        <div className="v23-home-mugshot-copy">
          <span className="v23-feature-tag"><Camera size={16} aria-hidden="true" /> YOUR FACE. YOUR FILE.</span>
          <h2 id="v23-home-mugshot-title">Wanted for<br /><em>love.</em></h2>
          <p>Part of the ANGEL story, now with your face in it. Turn your selfie into a personalized Yarden booking photo and share it with the world.</p>
          <button className="v23-mugshot-button" type="button" aria-expanded={opened} aria-controls="v23-mugshot-studio" onClick={() => setOpened(value => !value)}>
            {opened ? 'Close the studio' : 'Create your mugshot'} {opened ? <X size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
          </button>
          <span className="v23-mugshot-note">AI-GENERATED FAN EXPERIENCE · YOUR PHOTO, YOUR CHOICE</span>
        </div>
        <div className="v23-mugshot-visual" aria-hidden="true">
          <div className="v23-mugshot-measure" />
          <div className="v23-mugshot-outline"><span>YOU<br />BELONG<br />HERE</span></div>
          <div className="v23-mugshot-board"><strong>YARDEN</strong><span>ANGEL — OUT NOW</span><small>CASE NO. / 2026</small></div>
          <span className="v23-mugshot-visual-bottom">FAN FILES / ANGEL ERA</span>
        </div>
      </div>
      <div id="v23-mugshot-studio" className="v23-home-mugshot-studio">
        {opened && <MugshotStudio />}
      </div>
    </section>
  );
}
