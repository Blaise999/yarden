"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { YardPass } from "@/libs/passTypes";

export default function AdminPassesPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passes, setPasses] = useState<YardPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingPass, setViewingPass] = useState<YardPass | null>(null);

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/passes");
      if (res.status === 401) {
        setIsAuthed(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPasses(data.passes || []);
      setIsAuthed(true);
    } catch (err) {
      setError("Failed to load passes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }
      
      setIsAuthed(true);
      setPassword("");
      fetchPasses();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPass = (pass: YardPass) => {
    const link = document.createElement("a");
    link.href = pass.pngDataUrl;
    link.download = `${pass.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Login</h1>
          <p className="text-sm text-gray-600 mb-6">Enter password to access the dashboard</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-yellow-400 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☥</span>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-yellow-400/70">Yard Pass Management</p>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-yellow-400/70">Total passes:</span>{" "}
            <span className="font-bold">{passes.length}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {loading && passes.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading passes...</p>
          </div>
        ) : passes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-600">No passes generated yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">AnonId</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IP</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {passes.map((pass) => (
                    <tr key={pass.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(pass.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{pass.name}</td>
                      <td className="px-4 py-3 text-gray-600">{pass.email}</td>
                      <td className="px-4 py-3 text-gray-600">{pass.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pass.gender === "female" 
                            ? "bg-pink-100 text-pink-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {pass.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{pass.title}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{pass.status}</td>
                      <td className="px-4 py-3 text-gray-600">{pass.yearJoined}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono truncate max-w-[100px]">
                        {pass.anonId.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[80px]">
                        {pass.ip}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingPass(pass)}
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadPass(pass)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
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

      {/* View Modal */}
      {viewingPass && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingPass(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewingPass.name}</h3>
                <p className="text-sm text-gray-500">{viewingPass.id}</p>
              </div>
              <button
                onClick={() => setViewingPass(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <img 
                src={viewingPass.pngDataUrl} 
                alt={`Pass for ${viewingPass.name}`}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">User Agent</p>
                  <p className="text-gray-700 font-medium text-xs truncate">{viewingPass.userAgent}</p>
                </div>
                <div>
                  <p className="text-gray-500">Anonymous ID</p>
                  <p className="text-gray-700 font-medium font-mono text-xs">{viewingPass.anonId}</p>
                </div>
              </div>
              
              <button
                onClick={() => downloadPass(viewingPass)}
                className="mt-4 w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 transition"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
