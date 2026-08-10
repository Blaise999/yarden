"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FanProfile } from "../../libs/types";
import { loadProfile, clearProfile } from "../../libs/storage";
import { ProfileCard } from "../../components/ProfileCard";

export default function ProfilePage() {
  const [profile, setProfile] = useState<FanProfile | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-black">My Fan ID</h2>
          <p className="mt-2 text-sm font-semibold text-black/70">
            Your saved Yard pass on this device.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/signup"
            className="rounded-2xl border border-black/25 px-4 py-2 text-sm font-extrabold text-black hover:bg-black/5"
          >
            {profile ? "Create new" : "Sign up"}
          </Link>

          {profile && (
            <button
              onClick={() => {
                clearProfile();
                setProfile(null);
              }}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-extrabold text-[rgb(var(--yard-yellow))] hover:opacity-90"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {!profile ? (
        <div className="rounded-3xl border border-black/20 bg-yellow-300/25 p-6">
          <p className="text-sm font-extrabold text-black">
            No saved profile found.
          </p>
          <p className="mt-2 text-sm font-semibold text-black/70">
            Go to signup to generate your Fan ID.
          </p>
        </div>
      ) : (
        <ProfileCard profile={profile} />
      )}
    </div>
  );
}
