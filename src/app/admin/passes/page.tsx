"use client";

import React, { useEffect, useState, useCallback } from "react";

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

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [password, setPassword] = useState("");
  const [passes, setPasses] = useState<YardPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPass, setSelectedPass] = useState<YardPass | null>(null);

  // Check if already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/passes", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPasses(data.passes || []);
        setView("dashboard");
      }
    } catch {
      // Not logged in, stay on login
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Login successful, fetch passes
      setPassword("");
      await fetchPasses();
      setView("dashboard");
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/passes", { credentials: "include" });
      
      if (res.status === 401) {
        setView("login");
        return;
      }

      const data = await res.json();
      setPasses(data.passes || []);
    } catch (err) {
      setError("Failed to load passes");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    setView("login");
    setPasses([]);
  };

  const downloadPass = (pass: YardPass) => {
    if (!pass.pngDataUrl) return alert("No image available");
    const link = document.createElement("a");
    link.href = pass.pngDataUrl;
    link.download = `${pass.id}.png`;
    link.click();
  };

  const formatDate = (iso: string) => {
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
  };

  // ============ LOGIN VIEW ============
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
              <span className="text-3xl text-yellow-400">☥</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-1">Enter password to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
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
                  Enter Dashboard
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Set ADMIN_PASSWORD in your environment variables
          </p>
        </div>
      </div>
    );
  }

  // ============ DASHBOARD VIEW ============
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400">Total Passes</p>
              <p className="text-xl font-bold text-yellow-400">{passes.length}</p>
            </div>
            <button
              onClick={fetchPasses}
              disabled={loading}
              className="px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-400/30 transition disabled:opacity-50"
            >
              {loading ? "..." : "Refresh"}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-black text-gray-900">{passes.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Angels</p>
            <p className="text-2xl font-black text-pink-500">
              {passes.filter(p => p.gender === "female").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Descendants</p>
            <p className="text-2xl font-black text-blue-500">
              {passes.filter(p => p.gender === "male").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Today</p>
            <p className="text-2xl font-black text-green-500">
              {passes.filter(p => {
                const today = new Date().toDateString();
                return new Date(p.createdAt).toDateString() === today;
              }).length}
            </p>
          </div>
        </div>

        {/* Passes List */}
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
                        <p className="text-sm text-gray-900 font-medium">
                          {formatDate(pass.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-gray-900">{pass.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{pass.email}</p>
                        <p className="text-xs text-gray-400">{pass.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          pass.gender === "female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {pass.gender === "female" ? "👼" : "🧬"}
                          {pass.gender === "female" ? "Angel" : "Descendant"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {pass.id}
                        </code>
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
            {/* Modal Header */}
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

            {/* Pass Image */}
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

            {/* Pass Details */}
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
                <p className="text-xs font-mono text-gray-600 bg-white p-2 rounded-lg break-all">
                  {selectedPass.userAgent}
                </p>
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
