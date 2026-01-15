"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FanProfile, Gender, FanPrefs } from "@/libs/types";
import { generateFanId } from "@/libs/id";
import { saveProfile } from "@/libs/storage";

const defaultPrefs: FanPrefs = { shows: true, news: true, releases: true };

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [prefs, setPrefs] = useState<FanPrefs>(defaultPrefs);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const group = useMemo(
    () => (gender === "male" ? "Descendants" : "Angels"),
    [gender]
  );

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function togglePref(k: keyof FanPrefs) {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  }

  function submit() {
    setError(null);

    const n = name.trim();
    const e = email.trim().toLowerCase();

    if (!n) return setError("Enter your full name.");
    if (!isValidEmail(e)) return setError("Enter a valid email.");
    if (!consent) return setError("Confirm you agree to receive updates.");

    const profile: FanProfile = {
      artist: "Yarden",
      id: generateFanId(),
      name: n,
      email: e,
      gender,
      group,
      prefs,
      createdAt: new Date().toISOString(),
    };

    saveProfile(profile);
    router.push("/profile");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-black text-black">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada Obi"
            className="w-full rounded-2xl border border-black/25 bg-yellow-200/40 px-4 py-3 text-sm font-semibold text-black placeholder:text-black/45 outline-none focus:border-black"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-black">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. ada@email.com"
            className="w-full rounded-2xl border border-black/25 bg-yellow-200/40 px-4 py-3 text-sm font-semibold text-black placeholder:text-black/45 outline-none focus:border-black"
            inputMode="email"
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-black text-black">Signup option</span>
        <div className="grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={[
              "rounded-2xl border px-4 py-3 text-left text-sm font-extrabold",
              gender === "male"
                ? "border-black bg-black text-[rgb(var(--yard-yellow))]"
                : "border-black/25 bg-yellow-200/40 text-black hover:bg-black/5",
            ].join(" ")}
          >
            ♂ Male → Descendants
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={[
              "rounded-2xl border px-4 py-3 text-left text-sm font-extrabold",
              gender === "female"
                ? "border-black bg-black text-[rgb(var(--yard-yellow))]"
                : "border-black/25 bg-yellow-200/40 text-black hover:bg-black/5",
            ].join(" ")}
          >
            ♀ Female → Angels 🪽
          </button>
        </div>
        <p className="text-xs font-bold text-black/65">
          You’ll be registered as: <span className="text-black">{group}</span>
        </p>
      </div>

      <div className="rounded-3xl border border-black/20 bg-yellow-200/35 p-4">
        <span className="text-sm font-black text-black">What do you want?</span>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <Pref checked={prefs.shows} onClick={() => togglePref("shows")} label="Shows" />
          <Pref checked={prefs.news} onClick={() => togglePref("news")} label="News" />
          <Pref checked={prefs.releases} onClick={() => togglePref("releases")} label="Releases" />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-3xl border border-black/20 bg-yellow-200/35 p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-black"
        />
        <span className="text-sm font-semibold text-black/80">
          I agree to receive updates from Yarden (shows, news, releases).
        </span>
      </label>

      {error && (
        <div className="rounded-2xl border border-black bg-black px-4 py-3 text-sm font-bold text-[rgb(var(--yard-yellow))]">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        className="w-full rounded-2xl bg-black px-6 py-3 text-sm font-extrabold text-[rgb(var(--yard-yellow))] shadow-sm hover:opacity-90"
      >
        Generate my Fan ID
      </button>

      <p className="text-xs font-semibold text-black/60">
        Frontend-only: your profile saves on this device for now.
      </p>
    </div>
  );
}

function Pref({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-3 text-sm font-extrabold",
        checked
          ? "border-black bg-black text-[rgb(var(--yard-yellow))]"
          : "border-black/25 bg-yellow-200/40 text-black hover:bg-black/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
