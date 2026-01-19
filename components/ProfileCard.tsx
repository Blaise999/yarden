"use client";

import type { FanProfile } from "../libs/types";
import { fmtDate } from "../libs/utils";

export function ProfileCard({ profile }: { profile: FanProfile }) {
  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.id);
    } catch {}
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-yard-${profile.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ink-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-80">
            THE YARD PASS
          </p>
          <h3 className="mt-2 text-2xl font-black">{profile.name}</h3>
          <p className="mt-1 text-sm font-semibold opacity-80">{profile.email}</p>
        </div>

        <div className="rounded-2xl bg-[rgb(var(--yard-yellow))] px-4 py-3 text-black">
          <p className="text-xs font-black opacity-80">Fan ID</p>
          <p className="mt-1 font-mono text-sm font-black">{profile.id}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Info label="House" value={profile.group === "Angels" ? "Angels 🪽" : "Descendants"} />
        <Info label="Joined" value={fmtDate(profile.createdAt)} />
        <Info
          label="Prefs"
          value={[
            profile.prefs.shows ? "Shows" : null,
            profile.prefs.news ? "News" : null,
            profile.prefs.releases ? "Releases" : null,
          ]
            .filter(Boolean)
            .join(", ")}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={copyId}
          className="rounded-2xl bg-[rgb(var(--yard-yellow))] px-4 py-2 text-sm font-black text-black hover:opacity-90"
        >
          Copy Fan ID
        </button>
        <button
          onClick={downloadJson}
          className="rounded-2xl border border-[rgb(var(--yard-yellow))]/60 px-4 py-2 text-sm font-black hover:bg-white/5"
        >
          Download profile
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--yard-yellow))]/25 bg-black/50 p-4">
      <p className="text-xs font-extrabold opacity-75">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}
