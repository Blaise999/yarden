// components/landing/PassModal.tsx — dark on-brand modal around the working generator
"use client";

import React, { useEffect } from "react";
import YardPassGen from "./pass/YardPassGen";

type PassModalProps = { open: boolean; onClose: () => void };

export function PassModal({ open, onClose }: PassModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl ring-1 ring-white/12"
        style={{ background: "#0B0B10", animation: "yardPassIn .35s cubic-bezier(.2,1,.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#b98a29,#E4B13C,#b98a29)" }} />
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">Join the descendants</div>
          <button
            type="button" onClick={onClose} aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12]"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="max-h-[82vh] overflow-y-auto overscroll-contain px-6 pb-7">
          <YardPassGen />
        </div>
      </div>
      <style>{`@keyframes yardPassIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
