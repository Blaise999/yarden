"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

import { TourSection, type ShowItem, type TourConfig } from "@/components/landing/TourSection";
import StoreSection, { type MerchItem, type StoreConfig } from "@/components/landing/StoreSection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";

import { DEFAULT_CMS, type CmsData } from "@/content/defaultCms";

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
type Tab = "passes" | "cms";

// ✅ infer the exact CMS newsletter item types (fixes PressItem[] vs CmsPressItem[] errors)
type CmsNewsletter = CmsData["newsletter"];
type CmsPressItem = CmsNewsletter["pressItems"][number];
type CmsEmbedVideo = CmsNewsletter["videos"][number];

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

async function apiGetAdminCms(): Promise<CmsData | null> {
  try {
    const res = await fetch("/api/admin/cms", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const cms = data?.cms as CmsData | undefined;
    if (!cms || cms.version !== 1) return null;
    return cms;
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
    const saved = data?.cms as CmsData | undefined;
    if (!saved || saved.version !== 1) return null;
    return saved;
  } catch {
    return null;
  }
}

async function apiResetAdminCms(): Promise<CmsData | null> {
  try {
    const res = await fetch("/api/admin/cms/reset", { method: "POST", credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    const cms = data?.cms as CmsData | undefined;
    if (!cms || cms.version !== 1) return null;
    return cms;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [tab, setTab] = useState<Tab>("passes");

  const [password, setPassword] = useState("");
  const [passes, setPasses] = useState<YardPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPass, setSelectedPass] = useState<YardPass | null>(null);

  const [cms, setCms] = useState<CmsData>(DEFAULT_CMS);
  const [cmsLoading, setCmsLoading] = useState(false);

  const [newsletterEditOpen, setNewsletterEditOpen] = useState(false);
  const [newsletterDraft, setNewsletterDraft] = useState<CmsData["newsletter"]>(DEFAULT_CMS.newsletter);
  const [newsletterSaving, setNewsletterSaving] = useState(false);

  // ✅ blank templates built from DEFAULT_CMS so shapes always match CmsPressItem/CmsEmbedVideo
  const makeBlankPress = useCallback((): CmsPressItem => {
    const base = DEFAULT_CMS.newsletter.pressItems?.[0];
    // if your DEFAULT_CMS has at least 1 item (it should), this stays fully typed
    return {
      ...(base as CmsPressItem),
      title: "",
      outlet: "",
      date: "",
      href: "",
      image: (base as any)?.image ?? "/media/yarden/press/youtube.jpg",
      tag: "",
      excerpt: "",
    };
  }, []);

  const makeBlankVideo = useCallback((): CmsEmbedVideo => {
    const base = DEFAULT_CMS.newsletter.videos?.[0];
    return {
      ...(base as CmsEmbedVideo),
      title: "",
      meta: "",
      youtubeId: "",
      href: "",
    };
  }, []);

  const loadCms = useCallback(async () => {
    setCmsLoading(true);
    try {
      const fromApi = await apiGetAdminCms();
      if (fromApi) setCms(fromApi);
    } finally {
      setCmsLoading(false);
    }
  }, []);

  const publishCms = useCallback(async (next: CmsData) => {
    setCmsLoading(true);
    try {
      const merged: CmsData = { ...next, version: 1, updatedAt: Date.now() };
      const saved = await apiPutAdminCms(merged);
      if (saved) setCms(saved);
      else setCms(merged);
    } finally {
      setCmsLoading(false);
    }
  }, []);

  const patchCms = useCallback(
    async (patch: Partial<CmsData>) => {
      const next: CmsData = { ...cms, ...patch, version: 1, updatedAt: Date.now() };
      await publishCms(next);
    },
    [cms, publishCms]
  );

  const resetCms = useCallback(async () => {
    setCmsLoading(true);
    try {
      const fresh = await apiResetAdminCms();
      if (fresh) setCms(fresh);
      else setCms({ ...DEFAULT_CMS, updatedAt: Date.now() });
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
                <>
                  Enter Dashboard <span>→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">Set ADMIN_PASSWORD in your environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-xl text-black">☥</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-yellow-400">The Yard</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400">Total Passes</p>
              <p className="text-xl font-bold text-yellow-400">{passes.length}</p>
            </div>

            <button
              onClick={() => setTab("passes")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === "passes" ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              Passes
            </button>

            <button
              onClick={() => setTab("cms")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === "cms" ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              CMS
            </button>

            <button
              onClick={tab === "passes" ? fetchPasses : loadCms}
              disabled={loading || cmsLoading}
              className="px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-400/30 transition disabled:opacity-50"
            >
              {loading || cmsLoading ? "..." : "Refresh"}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === "passes" ? (
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
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pass ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {passes.map((pass) => (
                        <tr key={pass.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-900 font-medium">{formatDate(pass.createdAt)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-bold text-gray-900">{pass.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">{pass.email}</p>
                            <p className="text-xs text-gray-400">{pass.phone}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                pass.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {pass.gender === "female" ? "👼" : "🧬"} {pass.gender === "female" ? "Angel" : "Descendant"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{pass.id}</code>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedPass(pass)}
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold hover:bg-yellow-200 transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => downloadPass(pass)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
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
        ) : (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">CMS Published</p>
                <p className="text-sm font-bold text-gray-900">{cmsLoading ? "Loading..." : cmsUpdated}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={loadCms}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Pull
                </button>

                <button
                  onClick={resetCms}
                  disabled={cmsLoading}
                  className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-200 transition disabled:opacity-50"
                >
                  Reset CMS
                </button>

                <a
                  href="/"
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-900 transition"
                >
                  Open Site
                </a>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/10 mb-6 bg-black">
              <TourSection
                id="admin-tour"
                shows={cms.tour.shows}
                config={cms.tour.config}
                editable
                onSave={async (payload: { shows: ShowItem[]; config: TourConfig }) => {
                  await patchCms({ tour: payload });
                }}
              />
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/10 mb-6 bg-black">
              <StoreSection
                merch={cms.store.merch}
                config={cms.store.config}
                editable
                onSave={async (payload: { merch: MerchItem[]; config: StoreConfig }) => {
                  await patchCms({ store: payload });
                }}
              />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Newsletter</p>
                <p className="text-sm font-bold text-gray-900">
                  {cms.newsletter.pressItems.length} press • {cms.newsletter.videos.length} videos
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setNewsletterDraft(cms.newsletter);
                    setNewsletterEditOpen(true);
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-200 transition"
                >
                  Edit Newsletter
                </button>

                <button
                  onClick={async () => {
                    await patchCms({ newsletter: DEFAULT_CMS.newsletter });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                >
                  Reset Newsletter
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/10 bg-black">
              <NewsletterSection
                pressItems={cms.newsletter.pressItems}
                videos={cms.newsletter.videos}
                backgroundImage={cms.newsletter.backgroundImage}
              />
            </div>
          </>
        )}
      </main>

      {selectedPass && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPass(null)}>
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
                <img src={selectedPass.pngDataUrl} alt={`Pass for ${selectedPass.name}`} className="w-full rounded-2xl shadow-lg" />
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
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPass.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">IP Address</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPass.ip}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User Agent</p>
                <p className="text-xs font-mono text-gray-600 bg-white p-2 rounded-lg break-all">{selectedPass.userAgent}</p>
              </div>

              <button onClick={() => downloadPass(selectedPass)} className="w-full py-4 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition">
                Download Pass Image
              </button>
            </div>
          </div>
        </div>
      )}

      {newsletterEditOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => (newsletterSaving ? null : setNewsletterEditOpen(false))}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <div>
                <h3 className="text-xl font-black text-gray-900">Edit Newsletter</h3>
                <p className="text-sm text-gray-500">Last publish: {cmsUpdated}</p>
              </div>
              <button
                onClick={() => (newsletterSaving ? null : setNewsletterEditOpen(false))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Background image</p>
                <input
                  value={newsletterDraft.backgroundImage}
                  onChange={(e) => setNewsletterDraft((d) => ({ ...d, backgroundImage: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                  placeholder="/media/yarden/newsletter.jpg or https://..."
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Press</p>
                    <p className="text-sm font-bold text-gray-900">{newsletterDraft.pressItems.length} items</p>
                  </div>
                  <button
                    onClick={() =>
                      setNewsletterDraft((d) => ({
                        ...d,
                        pressItems: [makeBlankPress(), ...d.pressItems],
                      }))
                    }
                    className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-200 transition"
                  >
                    Add Press
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {newsletterDraft.pressItems.map((p, idx) => (
                    <div key={`${p.href || "press"}_${idx}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-sm font-black text-gray-900">Press #{idx + 1}</p>
                        <button
                          onClick={() => setNewsletterDraft((d) => ({ ...d, pressItems: d.pressItems.filter((_, i) => i !== idx) }))}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={p.title}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], title: e.target.value };
                              return { ...d, pressItems: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Title"
                        />
                        <input
                          value={(p as any).outlet ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], outlet: e.target.value } as any;
                              return { ...d, pressItems: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Outlet"
                        />
                        <input
                          value={(p as any).date ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], date: e.target.value } as any;
                              return { ...d, pressItems: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Date"
                        />
                        <input
                          value={(p as any).tag ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], tag: e.target.value } as any;
                              return { ...d, pressItems: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Tag"
                        />
                        <input
                          value={p.href}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], href: e.target.value };
                              return { ...d, pressItems: next };
                            })
                          }
                          className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Link (https://...)"
                        />
                        <input
                          value={(p as any).image ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], image: e.target.value } as any;
                              return { ...d, pressItems: next };
                            })
                          }
                          className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Image (/public path or https://...)"
                        />
                        <textarea
                          value={(p as any).excerpt ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.pressItems];
                              next[idx] = { ...next[idx], excerpt: e.target.value } as any;
                              return { ...d, pressItems: next };
                            })
                          }
                          className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          rows={2}
                          placeholder="Excerpt"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Videos</p>
                    <p className="text-sm font-bold text-gray-900">{newsletterDraft.videos.length} items</p>
                  </div>
                  <button
                    onClick={() =>
                      setNewsletterDraft((d) => ({
                        ...d,
                        videos: [makeBlankVideo(), ...d.videos],
                      }))
                    }
                    className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-200 transition"
                  >
                    Add Video
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {newsletterDraft.videos.map((v, idx) => (
                    <div key={`${(v as any).youtubeId || "vid"}_${idx}`} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-sm font-black text-gray-900">Video #{idx + 1}</p>
                        <button
                          onClick={() => setNewsletterDraft((d) => ({ ...d, videos: d.videos.filter((_, i) => i !== idx) }))}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={(v as any).title ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.videos];
                              next[idx] = { ...next[idx], title: e.target.value } as any;
                              return { ...d, videos: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Title"
                        />
                        <input
                          value={(v as any).meta ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.videos];
                              next[idx] = { ...next[idx], meta: e.target.value } as any;
                              return { ...d, videos: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="Meta"
                        />
                        <input
                          value={(v as any).youtubeId ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.videos];
                              next[idx] = { ...next[idx], youtubeId: e.target.value } as any;
                              return { ...d, videos: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="YouTube ID"
                        />
                        <input
                          value={(v as any).href ?? ""}
                          onChange={(e) =>
                            setNewsletterDraft((d) => {
                              const next = [...d.videos];
                              next[idx] = { ...next[idx], href: e.target.value } as any;
                              return { ...d, videos: next };
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:outline-none transition text-sm"
                          placeholder="YouTube Link"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => (newsletterSaving ? null : setNewsletterEditOpen(false))}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    setNewsletterSaving(true);
                    try {
                      const cleaned: CmsData["newsletter"] = {
                        backgroundImage: (newsletterDraft.backgroundImage ?? "").trim(),
                        pressItems: (newsletterDraft.pressItems ?? [])
                          .map((p: any) => ({
                            ...p,
                            title: (p.title ?? "").trim(),
                            outlet: (p.outlet ?? "").trim(),
                            date: (p.date ?? "").trim(),
                            href: (p.href ?? "").trim(),
                            image: (p.image ?? "").trim(),
                            tag: (p.tag ?? "").trim() || undefined,
                            excerpt: (p.excerpt ?? "").trim() || undefined,
                          }))
                          .filter((p: any) => p.title || p.href),
                        videos: (newsletterDraft.videos ?? [])
                          .map((v: any) => ({
                            ...v,
                            title: (v.title ?? "").trim(),
                            meta: (v.meta ?? "").trim() || undefined,
                            youtubeId: (v.youtubeId ?? "").trim(),
                            href: (v.href ?? "").trim() || undefined,
                          }))
                          .filter((v: any) => v.title && v.youtubeId),
                      };

                      await patchCms({ newsletter: cleaned });
                      setNewsletterEditOpen(false);
                    } finally {
                      setNewsletterSaving(false);
                    }
                  }}
                  disabled={newsletterSaving}
                  className="px-5 py-3 bg-black text-yellow-400 rounded-xl text-sm font-black hover:bg-gray-900 transition disabled:opacity-60"
                >
                  {newsletterSaving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
