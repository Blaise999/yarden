// app/admin/passes/AdminPage.client.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { DEFAULT_CMS, type CmsData } from "../../content/defaultCms";
import type {
  ReleaseItem,
  VisualItem,
  ShowItem,
  TourConfig,
  MerchItem,
  StoreConfig,
  PressItem,
  EmbedVideo,
  PlatformKey,
} from "../../content/cmsTypes";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface YardPass {
  id: string;
  anonId: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  title: string;
  status: string;
  yearJoined: number;
  createdAt: string;
  pngDataUrl: string;
  ip: string;
  userAgent: string;
}

type View = "login" | "dashboard";
type Tab = "passes" | "releases" | "videos" | "tour" | "merch" | "newsletter";

const PLATFORM_OPTIONS: PlatformKey[] = [
  "spotify", "apple", "youtube", "audiomack", "boomplay", "soundcloud", "deezer", "tidal"
];

const VIDEO_KINDS = [
  "Official Video",
  "Official Music Video", 
  "Official Visualizer",
  "Visualizer"
] as const;

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.split("/").filter(Boolean)[0] || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function apiGetAdminCms(): Promise<CmsData | null> {
  try {
    const res = await fetch("/api/admin/cms", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.cms ?? null;
  } catch {
    return null;
  }
}

async function apiPutAdminCms(cms: CmsData): Promise<CmsData | null> {
  try {
    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cms }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.cms ?? null;
  } catch {
    return null;
  }
}

async function apiUploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.url ?? null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function ImageUploader({ 
  value, 
  onChange, 
  label = "Image" 
}: { 
  value: string; 
  onChange: (url: string) => void; 
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      
      // Upload
      const url = await apiUploadImage(file);
      if (url) {
        onChange(url);
        setPreview(url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-start gap-3">
        <div 
          className="relative w-24 h-24 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200 cursor-pointer hover:ring-yellow-400 transition"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-3xl">+</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-yellow-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
          >
            {uploading ? "Uploading..." : "Upload from device"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = "text",
  rows,
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string;
  type?: string;
  rows?: number;
}) {
  const Component = rows ? "textarea" : "input";
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <Component
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-yellow-500 focus:outline-none resize-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-yellow-500 focus:outline-none bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`w-10 h-6 rounded-full transition-colors ${value ? "bg-yellow-400" : "bg-gray-200"}`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4 ml-0.5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════
// RELEASE EDITOR
// ═══════════════════════════════════════════════════════════════════

function ReleaseEditor({
  release,
  onChange,
  onRemove,
}: {
  release: ReleaseItem;
  onChange: (r: ReleaseItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200 shrink-0">
          {release.art && <img src={release.art} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{release.title || "Untitled"}</h3>
            {release.enabled ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Live</span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Draft</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{release.year} • {release.format || "Release"}</p>
        </div>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Title" value={release.title} onChange={(v) => onChange({ ...release, title: v })} placeholder="Muse" />
            <InputField label="Subtitle" value={release.subtitle || ""} onChange={(v) => onChange({ ...release, subtitle: v })} placeholder="EP" />
            <InputField label="Year" value={release.year || ""} onChange={(v) => onChange({ ...release, year: v })} placeholder="2025" />
            <SelectField 
              label="Format" 
              value={release.format || ""} 
              onChange={(v) => onChange({ ...release, format: v })}
              options={[
                { value: "", label: "Auto" },
                { value: "EP", label: "EP" },
                { value: "Album", label: "Album" },
                { value: "Single", label: "Single" },
                { value: "Mixtape", label: "Mixtape" },
              ]}
            />
          </div>

          <ImageUploader label="Cover Art" value={release.art} onChange={(v) => onChange({ ...release, art: v })} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Artwork Source Label" value={release.artSourceLabel || ""} onChange={(v) => onChange({ ...release, artSourceLabel: v })} placeholder="Apple Music" />
            <InputField label="Artwork Source URL" value={release.artSourceHref || ""} onChange={(v) => onChange({ ...release, artSourceHref: v })} placeholder="https://..." />
          </div>

          <InputField label="Smart Link (Fanlink)" value={release.fanLink || ""} onChange={(v) => onChange({ ...release, fanLink: v })} placeholder="https://vyd.co/..." />

          <InputField 
            label="Chips (comma-separated)" 
            value={(release.chips || []).join(", ")} 
            onChange={(v) => onChange({ ...release, chips: v.split(",").map(s => s.trim()).filter(Boolean) })} 
            placeholder="EP, 2025, New"
          />

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Platform Links</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PLATFORM_OPTIONS.map((platform) => (
                <InputField
                  key={platform}
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  value={release.links[platform] || ""}
                  onChange={(v) => onChange({ ...release, links: { ...release.links, [platform]: v || undefined } })}
                  placeholder={`https://${platform}.com/...`}
                />
              ))}
            </div>
          </div>

          <SelectField
            label="Primary Platform"
            value={release.primary || ""}
            onChange={(v) => onChange({ ...release, primary: (v || undefined) as PlatformKey | undefined })}
            options={[
              { value: "", label: "Auto (first available)" },
              ...PLATFORM_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))
            ]}
          />

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Tracklist</p>
            {(release.tracklist || []).map((track, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{i + 1}.</span>
                <input
                  value={track.title}
                  onChange={(e) => {
                    const newTracklist = [...(release.tracklist || [])];
                    newTracklist[i] = { ...newTracklist[i], title: e.target.value };
                    onChange({ ...release, tracklist: newTracklist });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-yellow-500 focus:outline-none"
                  placeholder="Track title"
                />
                <input
                  value={track.meta || ""}
                  onChange={(e) => {
                    const newTracklist = [...(release.tracklist || [])];
                    newTracklist[i] = { ...newTracklist[i], meta: e.target.value };
                    onChange({ ...release, tracklist: newTracklist });
                  }}
                  className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-yellow-500 focus:outline-none"
                  placeholder="feat. ..."
                />
                <button
                  onClick={() => {
                    const newTracklist = (release.tracklist || []).filter((_, idx) => idx !== i);
                    onChange({ ...release, tracklist: newTracklist });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...release, tracklist: [...(release.tracklist || []), { title: "" }] })}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
            >
              + Add Track
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <ToggleField label="Enabled (visible on site)" value={release.enabled} onChange={(v) => onChange({ ...release, enabled: v })} />
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Delete Release
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIDEO EDITOR
// ═══════════════════════════════════════════════════════════════════

function VideoEditor({
  video,
  onChange,
  onRemove,
}: {
  video: VisualItem;
  onChange: (v: VisualItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const youtubeId = extractYouTubeId(video.href);
  const thumbnailUrl = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg` : null;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-24 h-14 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200 shrink-0">
          {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{video.title || "Untitled"}</h3>
            {video.enabled ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Live</span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Draft</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{video.year} • {video.kind}</p>
        </div>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          <InputField label="Title" value={video.title} onChange={(v) => onChange({ ...video, title: v })} placeholder="ME & U (feat. Mellissa)" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Year" value={video.year} onChange={(v) => onChange({ ...video, year: v })} placeholder="2025" />
            <SelectField 
              label="Kind" 
              value={video.kind} 
              onChange={(v) => onChange({ ...video, kind: v as VisualItem["kind"] })}
              options={VIDEO_KINDS.map(k => ({ value: k, label: k }))}
            />
          </div>

          <InputField label="YouTube URL" value={video.href} onChange={(v) => onChange({ ...video, href: v })} placeholder="https://youtu.be/..." />
          
          {youtubeId && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">✓ YouTube video detected</p>
              <p className="text-xs text-green-600 mt-1">ID: {youtubeId}</p>
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="" className="mt-2 rounded-lg w-40" />
              )}
            </div>
          )}

          <InputField label="Tag (optional)" value={video.tag || ""} onChange={(v) => onChange({ ...video, tag: v || undefined })} placeholder="New" />

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <ToggleField label="Enabled (visible on site)" value={video.enabled} onChange={(v) => onChange({ ...video, enabled: v })} />
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Delete Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHOW EDITOR
// ═══════════════════════════════════════════════════════════════════

function ShowEditor({
  show,
  onChange,
  onRemove,
}: {
  show: ShowItem;
  onChange: (s: ShowItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-xl bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InputField label="Date" value={show.dateLabel} onChange={(v) => onChange({ ...show, dateLabel: v })} placeholder="APR 12" />
        <InputField label="City" value={show.city} onChange={(v) => onChange({ ...show, city: v })} placeholder="Lagos" />
        <InputField label="Venue" value={show.venue} onChange={(v) => onChange({ ...show, venue: v })} placeholder="— Venue TBA" />
        <SelectField 
          label="Status" 
          value={show.status || "announce"} 
          onChange={(v) => onChange({ ...show, status: v as ShowItem["status"] })}
          options={[
            { value: "announce", label: "Announced" },
            { value: "onsale", label: "On Sale" },
            { value: "soldout", label: "Sold Out" },
          ]}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1">
          <InputField label="Ticket Link" value={show.href || ""} onChange={(v) => onChange({ ...show, href: v || undefined })} placeholder="https://..." />
        </div>
        <button
          onClick={onRemove}
          className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MERCH EDITOR
// ═══════════════════════════════════════════════════════════════════

function MerchEditor({
  item,
  onChange,
  onRemove,
}: {
  item: MerchItem;
  onChange: (m: MerchItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200 shrink-0">
          {item.images[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 truncate">{item.name || "Untitled"}</h3>
            {item.available ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Available</span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Coming Soon</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{item.price}</p>
        </div>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" value={item.name} onChange={(v) => onChange({ ...item, name: v })} placeholder="Ankh Tee" />
            <InputField label="Price" value={item.price} onChange={(v) => onChange({ ...item, price: v })} placeholder="₦15,000" />
          </div>

          <ImageUploader 
            label="Product Image" 
            value={item.images[0] || ""} 
            onChange={(v) => onChange({ ...item, images: [v, ...item.images.slice(1)] })} 
          />

          <InputField label="Tag" value={item.tag || ""} onChange={(v) => onChange({ ...item, tag: v || undefined })} placeholder="New, Limited, etc." />

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <ToggleField label="Available for purchase" value={item.available} onChange={(v) => onChange({ ...item, available: v })} />
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Delete Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRESS EDITOR  
// ═══════════════════════════════════════════════════════════════════

function PressEditor({
  item,
  onChange,
  onRemove,
}: {
  item: PressItem;
  onChange: (p: PressItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200 shrink-0">
          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{item.title || "Untitled"}</h3>
          <p className="text-sm text-gray-500">{item.outlet} • {item.date}</p>
        </div>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          <InputField label="Title" value={item.title} onChange={(v) => onChange({ ...item, title: v })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Outlet" value={item.outlet} onChange={(v) => onChange({ ...item, outlet: v })} placeholder="Wonderland Magazine" />
            <InputField label="Date" value={item.date} onChange={(v) => onChange({ ...item, date: v })} placeholder="Dec 1, 2023" />
          </div>
          <InputField label="URL" value={item.href} onChange={(v) => onChange({ ...item, href: v })} />
          <ImageUploader label="Image" value={item.image || ""} onChange={(v) => onChange({ ...item, image: v || undefined })} />
          <InputField label="Tag" value={item.tag || ""} onChange={(v) => onChange({ ...item, tag: v || undefined })} placeholder="Interview, Feature, etc." />
          <InputField label="Excerpt" value={item.excerpt || ""} onChange={(v) => onChange({ ...item, excerpt: v || undefined })} rows={2} />
          
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Delete Press Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [tab, setTab] = useState<Tab>("passes");

  const [password, setPassword] = useState("");
  const [passes, setPasses] = useState<YardPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPass, setSelectedPass] = useState<YardPass | null>(null);

  const [cms, setCms] = useState<CmsData>({ ...DEFAULT_CMS, updatedAt: Date.now() });
  const [cmsLoading, setCmsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // ═══════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════

  const loadCms = useCallback(async () => {
    setCmsLoading(true);
    try {
      const fromApi = await apiGetAdminCms();
      if (fromApi) setCms(fromApi);
    } finally {
      setCmsLoading(false);
    }
  }, []);

  const saveCms = useCallback(async (next: CmsData) => {
    setSaveStatus("saving");
    setCmsLoading(true);
    try {
      const merged: CmsData = { ...next, version: 1, updatedAt: Date.now() };
      const saved = await apiPutAdminCms(merged);
      if (saved) setCms(saved);
      else setCms(merged);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } finally {
      setCmsLoading(false);
    }
  }, []);

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/passes", { credentials: "include" });
      if (res.status === 401) {
        setView("login");
        return;
      }
      const data = await res.json();
      setPasses(data.passes || []);
    } catch {
      setError("Failed to load passes");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/passes", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPasses(data.passes || []);
        setView("dashboard");
        await loadCms();
      }
    } catch {
      // ignore
    }
  }, [loadCms]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ═══════════════════════════════════════════════════════════════════
  // AUTH HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      setPassword("");
      await fetchPasses();
      setView("dashboard");
      await loadCms();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    setView("login");
    setPasses([]);
    setCms(DEFAULT_CMS);
    setTab("passes");
  };

  const downloadPass = (pass: YardPass) => {
    if (!pass.pngDataUrl) return alert("No image available");
    const link = document.createElement("a");
    link.href = pass.pngDataUrl;
    link.download = `${pass.id}.png`;
    link.click();
  };

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const total = passes.length;
    const angels = passes.filter((p) => p.gender === "female").length;
    const descendants = passes.filter((p) => p.gender === "male").length;
    const todayCount = passes.filter((p) => new Date(p.createdAt).toDateString() === today).length;
    return { total, angels, descendants, todayCount };
  }, [passes]);

  const cmsUpdated = useMemo(() => {
    try {
      return new Date(cms.updatedAt).toLocaleString("en-NG");
    } catch {
      return String(cms.updatedAt);
    }
  }, [cms.updatedAt]);

  // ═══════════════════════════════════════════════════════════════════
  // LOGIN VIEW
  // ═══════════════════════════════════════════════════════════════════

  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
              <span className="text-3xl text-yellow-400">☥</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none transition-colors text-lg"
                placeholder="••••••••"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-black text-yellow-400 font-bold text-lg rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>Enter Dashboard →</>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <span className="text-xl text-black">☥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-yellow-400">The Yard</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-yellow-400 text-sm animate-pulse">Saving...</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-green-400 text-sm">✓ Saved</span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mb-2">
            {(["passes", "releases", "videos", "tour", "merch", "newsletter"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  tab === t ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PASSES TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "passes" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Angels</p>
                <p className="text-2xl font-black text-pink-500">{stats.angels}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Descendants</p>
                <p className="text-2xl font-black text-blue-500">{stats.descendants}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Today</p>
                <p className="text-2xl font-black text-green-500">{stats.todayCount}</p>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={fetchPasses}
                disabled={loading}
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loading && passes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-gray-500">Loading passes...</p>
              </div>
            ) : passes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <span className="text-5xl">📭</span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">No Passes Yet</h3>
                <p className="text-gray-500 mt-1">Passes will appear here when users generate them.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {passes.map((pass) => (
                        <tr key={pass.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-900">{formatDate(pass.createdAt)}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{pass.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-500">{pass.email}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              pass.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {pass.title}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedPass(pass)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200 transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => downloadPass(pass)}
                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold hover:bg-yellow-200 transition"
                              >
                                Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RELEASES TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "releases" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Music Releases</h2>
                <p className="text-sm text-gray-500">{cms.releases.length} releases • Last updated: {cmsUpdated}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newRelease: ReleaseItem = {
                      id: generateId("release"),
                      title: "",
                      subtitle: "",
                      year: new Date().getFullYear().toString(),
                      art: "",
                      chips: [],
                      links: {},
                      enabled: false,
                    };
                    setCms(prev => ({ ...prev, releases: [newRelease, ...prev.releases] }));
                  }}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500 transition"
                >
                  + Add Release
                </button>
                <button
                  onClick={() => saveCms(cms)}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {cmsLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {cms.releases.map((release, idx) => (
                <ReleaseEditor
                  key={release.id}
                  release={release}
                  onChange={(r) => {
                    const newReleases = [...cms.releases];
                    newReleases[idx] = r;
                    setCms(prev => ({ ...prev, releases: newReleases }));
                  }}
                  onRemove={() => {
                    setCms(prev => ({ ...prev, releases: prev.releases.filter((_, i) => i !== idx) }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIDEOS TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "videos" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Music Videos</h2>
                <p className="text-sm text-gray-500">{cms.visuals.length} videos • YouTube thumbnails auto-imported</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newVideo: VisualItem = {
                      id: generateId("video"),
                      title: "",
                      kind: "Official Video",
                      year: new Date().getFullYear().toString(),
                      href: "",
                      enabled: false,
                    };
                    setCms(prev => ({ ...prev, visuals: [newVideo, ...prev.visuals] }));
                  }}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500 transition"
                >
                  + Add Video
                </button>
                <button
                  onClick={() => saveCms(cms)}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {cmsLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> Just paste a YouTube URL and the thumbnail will be automatically imported. 
                Supported formats: youtu.be/xxx, youtube.com/watch?v=xxx
              </p>
            </div>

            <div className="space-y-3">
              {cms.visuals.map((video, idx) => (
                <VideoEditor
                  key={video.id}
                  video={video}
                  onChange={(v) => {
                    const newVisuals = [...cms.visuals];
                    newVisuals[idx] = v;
                    setCms(prev => ({ ...prev, visuals: newVisuals }));
                  }}
                  onRemove={() => {
                    setCms(prev => ({ ...prev, visuals: prev.visuals.filter((_, i) => i !== idx) }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TOUR TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "tour" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tour Dates</h2>
                <p className="text-sm text-gray-500">{cms.tour.shows.length} shows</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newShow: ShowItem = {
                      id: generateId("show"),
                      dateLabel: "",
                      city: "",
                      venue: "",
                      status: "announce",
                    };
                    setCms(prev => ({ 
                      ...prev, 
                      tour: { ...prev.tour, shows: [...prev.tour.shows, newShow] }
                    }));
                  }}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500 transition"
                >
                  + Add Show
                </button>
                <button
                  onClick={() => saveCms(cms)}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {cmsLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Tour Settings</h3>
              <ImageUploader 
                label="Tour Poster" 
                value={cms.tour.config.posterSrc} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  tour: { ...prev.tour, config: { ...prev.tour.config, posterSrc: v } }
                }))} 
              />
              <InputField 
                label="Headline" 
                value={cms.tour.config.headline} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  tour: { ...prev.tour, config: { ...prev.tour.config, headline: v } }
                }))} 
              />
              <InputField 
                label="Description" 
                value={cms.tour.config.description} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  tour: { ...prev.tour, config: { ...prev.tour.config, description: v } }
                }))} 
                rows={2}
              />
              <InputField 
                label="Ticket Portal URL" 
                value={cms.tour.config.ticketPortalHref || ""} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  tour: { ...prev.tour, config: { ...prev.tour.config, ticketPortalHref: v || undefined } }
                }))} 
              />
            </div>

            <div className="space-y-3">
              {cms.tour.shows.map((show, idx) => (
                <ShowEditor
                  key={show.id}
                  show={show}
                  onChange={(s) => {
                    const newShows = [...cms.tour.shows];
                    newShows[idx] = s;
                    setCms(prev => ({ ...prev, tour: { ...prev.tour, shows: newShows } }));
                  }}
                  onRemove={() => {
                    setCms(prev => ({ 
                      ...prev, 
                      tour: { ...prev.tour, shows: prev.tour.shows.filter((_, i) => i !== idx) }
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MERCH TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "merch" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Merchandise</h2>
                <p className="text-sm text-gray-500">{cms.store.merch.length} items</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newItem: MerchItem = {
                      id: generateId("merch"),
                      name: "",
                      price: "₦ —",
                      images: [],
                      available: false,
                    };
                    setCms(prev => ({ 
                      ...prev, 
                      store: { ...prev.store, merch: [newItem, ...prev.store.merch] }
                    }));
                  }}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500 transition"
                >
                  + Add Item
                </button>
                <button
                  onClick={() => saveCms(cms)}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {cmsLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Store Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Title" 
                  value={cms.store.config.title} 
                  onChange={(v) => setCms(prev => ({ 
                    ...prev, 
                    store: { ...prev.store, config: { ...prev.store.config, title: v } }
                  }))} 
                />
                <InputField 
                  label="Store URL" 
                  value={cms.store.config.storeHref || ""} 
                  onChange={(v) => setCms(prev => ({ 
                    ...prev, 
                    store: { ...prev.store, config: { ...prev.store.config, storeHref: v || undefined } }
                  }))} 
                />
              </div>
              <InputField 
                label="Description" 
                value={cms.store.config.desc || ""} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  store: { ...prev.store, config: { ...prev.store.config, desc: v || undefined } }
                }))} 
              />
            </div>

            <div className="space-y-3">
              {cms.store.merch.map((item, idx) => (
                <MerchEditor
                  key={item.id}
                  item={item}
                  onChange={(m) => {
                    const newMerch = [...cms.store.merch];
                    newMerch[idx] = m;
                    setCms(prev => ({ ...prev, store: { ...prev.store, merch: newMerch } }));
                  }}
                  onRemove={() => {
                    setCms(prev => ({ 
                      ...prev, 
                      store: { ...prev.store, merch: prev.store.merch.filter((_, i) => i !== idx) }
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* NEWSLETTER TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {tab === "newsletter" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Newsletter & Press</h2>
                <p className="text-sm text-gray-500">
                  {cms.newsletter.pressItems.length} press items • {cms.newsletter.videos.length} embed videos
                </p>
              </div>
              <button
                onClick={() => saveCms(cms)}
                disabled={cmsLoading}
                className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
              >
                {cmsLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Background</h3>
              <ImageUploader 
                label="Background Image" 
                value={cms.newsletter.backgroundImage || ""} 
                onChange={(v) => setCms(prev => ({ 
                  ...prev, 
                  newsletter: { ...prev.newsletter, backgroundImage: v || undefined }
                }))} 
              />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Press Items</h3>
                <button
                  onClick={() => {
                    const newItem: PressItem = {
                      id: generateId("press"),
                      title: "",
                      outlet: "",
                      date: "",
                      href: "",
                    };
                    setCms(prev => ({ 
                      ...prev, 
                      newsletter: { ...prev.newsletter, pressItems: [newItem, ...prev.newsletter.pressItems] }
                    }));
                  }}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition"
                >
                  + Add Press
                </button>
              </div>
              <div className="space-y-3">
                {cms.newsletter.pressItems.map((item, idx) => (
                  <PressEditor
                    key={item.id}
                    item={item}
                    onChange={(p) => {
                      const newItems = [...cms.newsletter.pressItems];
                      newItems[idx] = p;
                      setCms(prev => ({ ...prev, newsletter: { ...prev.newsletter, pressItems: newItems } }));
                    }}
                    onRemove={() => {
                      setCms(prev => ({ 
                        ...prev, 
                        newsletter: { ...prev.newsletter, pressItems: prev.newsletter.pressItems.filter((_, i) => i !== idx) }
                      }));
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Embed Videos</h3>
                <button
                  onClick={() => {
                    const newVideo: EmbedVideo = {
                      id: generateId("embed"),
                      title: "",
                      youtubeId: "",
                    };
                    setCms(prev => ({ 
                      ...prev, 
                      newsletter: { ...prev.newsletter, videos: [newVideo, ...prev.newsletter.videos] }
                    }));
                  }}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition"
                >
                  + Add Video
                </button>
              </div>
              <div className="space-y-3">
                {cms.newsletter.videos.map((video, idx) => (
                  <div key={video.id} className="p-4 border border-gray-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InputField 
                        label="Title" 
                        value={video.title} 
                        onChange={(v) => {
                          const newVideos = [...cms.newsletter.videos];
                          newVideos[idx] = { ...newVideos[idx], title: v };
                          setCms(prev => ({ ...prev, newsletter: { ...prev.newsletter, videos: newVideos } }));
                        }} 
                      />
                      <InputField 
                        label="YouTube ID" 
                        value={video.youtubeId} 
                        onChange={(v) => {
                          const newVideos = [...cms.newsletter.videos];
                          newVideos[idx] = { ...newVideos[idx], youtubeId: v };
                          setCms(prev => ({ ...prev, newsletter: { ...prev.newsletter, videos: newVideos } }));
                        }} 
                        placeholder="e.g. dQw4w9WgXcQ"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setCms(prev => ({ 
                            ...prev, 
                            newsletter: { ...prev.newsletter, videos: prev.newsletter.videos.filter((_, i) => i !== idx) }
                          }));
                        }}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pass Detail Modal */}
      {selectedPass && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPass(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedPass.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{selectedPass.id}</p>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {selectedPass.pngDataUrl ? (
                <img
                  src={selectedPass.pngDataUrl}
                  alt={`Pass for ${selectedPass.name}`}
                  className="w-full rounded-2xl shadow-lg"
                />
              ) : (
                <div className="p-12 bg-gray-100 rounded-2xl text-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-b-3xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPass.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPass.phone}</p>
                </div>
              </div>

              <button
                onClick={() => downloadPass(selectedPass)}
                className="w-full py-4 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition"
              >
                Download Pass Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
