// src/components/landing/PassModal.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  IconAnkh,
  IconArrowUpRight,
  IconSpark,
  MiniInput,
  MiniSelect,
  Modal,
  NoiseOverlay,
  cx,
} from "@/components/landing/ui";

type Option = { label: string; value: string };

type PassModalProps = {
  open: boolean;
  onClose: () => void;

  /**
   * Optional: if you already have your full pass generator page,
   * you can pass a route and we’ll show a “Open full generator” CTA.
   */
  fullGeneratorHref?: string; // e.g. "/pass"
};

function makeCode(tier: string, name: string) {
  const base = name.trim().slice(0, 3).toUpperCase().padEnd(3, "X");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${tier.toUpperCase()}-${base}-${rand}`;
}

export function PassModal({ open, onClose, fullGeneratorHref }: PassModalProps) {
  const tiers: Option[] = useMemo(
    () => [
      { label: "Ankh", value: "Ankh" },
      { label: "Muse", value: "Muse" },
      { label: "Descend", value: "Descend" },
    ],
    []
  );

  const colors: Option[] = useMemo(
    () => [
      { label: "Obsidian", value: "Obsidian" },
      { label: "Ivory", value: "Ivory" },
      { label: "Aurum", value: "Aurum" },
      { label: "Saffron", value: "Saffron" },
    ],
    []
  );

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [tier, setTier] = useState("Ankh");
  const [colorway, setColorway] = useState("Obsidian");
  const [result, setResult] = useState<string | null>(null);

  const canGenerate = name.trim().length >= 2;

  const onReset = () => {
    setName("");
    setCity("");
    setTier("Ankh");
    setColorway("Obsidian");
    setResult(null);
  };

  const onGenerate = () => {
    if (!canGenerate) {
      setResult("Type your name first.");
      return;
    }
    const code = makeCode(tier, name);
    const c = city.trim() || "—";
    setResult(`Pass created • ${code} • ${c} • ${colorway}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate your Yarden Pass">
      <div className="grid gap-6 lg:grid-cols-[1fr_.95fr]">
        {/* Left: Form */}
        <div className="grid gap-4">
          <MiniInput label="Name on pass" placeholder="Your name" value={name} onChange={setName} />
          <MiniInput label="City" placeholder="Lagos" value={city} onChange={setCity} />

          <div className="grid gap-4 md:grid-cols-2">
            <MiniSelect label="Tier" value={tier} onChange={setTier} options={tiers} />
            <MiniSelect label="Colorway" value={colorway} onChange={setColorway} options={colors} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" onClick={onGenerate} iconLeft={<IconSpark className="h-4 w-4" />}>
              Generate
            </Button>

            <Button variant="secondary" onClick={onReset}>
              Reset
            </Button>

            {fullGeneratorHref ? (
              <Button
                variant="ghost"
                href={fullGeneratorHref}
                iconRight={<IconArrowUpRight className="h-4 w-4" />}
              >
                Full generator
              </Button>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-widest text-white/60">Next (real system)</div>
            <div className="mt-2 text-sm text-white/70">
              Save to DB, generate a shareable image/PNG, unique QR, and a public URL like{" "}
              <span className="text-white/85">/pass/ANKH-ABC-1234</span>.
            </div>
          </div>

          {result ? (
            <div className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/12">
              <div className="text-xs uppercase tracking-widest text-white/60">Result</div>
              <div className="mt-2 text-sm text-white/80">{result}</div>
            </div>
          ) : null}
        </div>

        {/* Right: Preview */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.10),transparent_55%)]" />
            <NoiseOverlay />
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Yarden Pass</div>
              <IconAnkh className="h-6 w-6 text-white/75" />
            </div>

            <div className="mt-5 text-2xl font-semibold tracking-tight">
              {name.trim() ? name.trim() : "Your Name"}
            </div>

            <div className="mt-2 text-sm text-white/60">
              Tier: <span className="text-white/80">{tier}</span>
            </div>
            <div className="mt-1 text-sm text-white/60">
              City: <span className="text-white/80">{city.trim() ? city.trim() : "—"}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{colorway}</Badge>
              <Badge>☥</Badge>
              <Badge>Member</Badge>
            </div>

            <div className="mt-8 rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-widest text-white/60">Share</div>
              <div className="mt-2 text-sm text-white/70">
                Next: shareable card image + public URL.
              </div>

              <div className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-white/70">Example</div>
                  <div className="text-xs text-white/50">thisisyarden.com</div>
                </div>
                <div className={cx("mt-1 text-sm font-semibold tracking-tight text-white")}>
                  /pass/{tier.toUpperCase()}-ABC-1234
                </div>
              </div>
            </div>

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-4 flex items-center justify-between text-xs text-white/50">
              <span>thisisyarden.com</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
