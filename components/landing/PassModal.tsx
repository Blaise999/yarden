// components/landing/PassModal.tsx — dark on-brand modal around the working generator
"use client";

import React, { useEffect, useRef } from "react";
import YardPassGen from "./pass/YardPassGen";

type PassModalProps = { open: boolean; onClose: () => void };

export function PassModal({ open, onClose }: PassModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href],select:not(:disabled)') || []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = focusables(), first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = oldOverflow; previous?.focus(); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Create your Yard Pass">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        className="yd-pass-modal relative w-full max-w-6xl overflow-hidden rounded-3xl ring-1 ring-white/12"
        style={{ background: "#0B0B10", animation: "yardPassIn .35s cubic-bezier(.2,1,.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#704355,#e5b5a4,#e7cbb0,#704355)" }} />
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-9">
          <div className="flex flex-col gap-1"><span className="text-[10px] uppercase tracking-[0.26em] text-[#e8c6b8]">YARDEN / THE YARD</span><strong className="font-serif text-xl font-normal tracking-tight text-white">Your membership card.</strong></div>
          <button
            type="button" onClick={onClose} aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12]"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="max-h-[82svh] overflow-y-auto overscroll-contain px-5 py-7 sm:px-9 sm:py-9">
          <YardPassGen />
        </div>
      </div>
      <style>{`@keyframes yardPassIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
