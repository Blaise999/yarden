// src/components/landing/PassModal.tsx
"use client";

import React from "react";
import { Modal, IconClose, cx } from "./ui";
import PassGenerator from "./pass/PassGenerator";

type PassModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PassModal({ open, onClose }: PassModalProps) {
  return (
    <Modal open={open} onClose={onClose} title=" ">
      {/* Scroll container INSIDE modal */}
      <div className="relative -mx-5 -my-4 max-h-[82vh] overflow-y-auto overscroll-contain">
        {/* Sticky header with close button */}
        <div
          className={cx(
            "sticky top-0 z-20 flex items-center justify-between gap-3",
            "border-b border-black/10 bg-[#FFFEF5]/92 px-5 py-4",
            "backdrop-blur-xl"
          )}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-black/50">
              Yarden Pass
            </div>
            <div className="text-sm sm:text-base font-black text-black truncate">
              Generate your Yard Pass
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cx(
              "shrink-0 inline-flex items-center justify-center",
              "h-10 w-10 rounded-full",
              "bg-black/5 hover:bg-black/10 active:bg-black/15",
              "transition"
            )}
          >
            <IconClose className="h-5 w-5 text-black/70" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <PassGenerator embedded />
        </div>

        {/* Bottom sticky close (nice on mobile after long scroll) */}
        <div className="sticky bottom-0 z-20 border-t border-black/10 bg-[#FFFEF5]/92 px-5 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            className={cx(
              "w-full rounded-xl py-3 font-black",
              "bg-black text-[rgb(var(--yard-gold))]",
              "hover:bg-black/90 active:bg-black/85 transition"
            )}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
