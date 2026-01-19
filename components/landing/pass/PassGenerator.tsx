"use client";

import React, { useEffect, useCallback, useMemo, useRef, useState, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Gender = "male" | "female" | "";

interface PassData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  title: "YARDEN'S ANGEL" | "YARDEN'S DESCENDANT";
  status: "Angel Certified" | "Descendant Certified";
  yearJoined: number;
  createdAt: string;
  photoDataUrl?: string;
  pngDataUrl?: string;
}

function getAnonIdCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/yard_anon_id=([^;]+)/);
  return match ? match[1] : null;
}

function setAnonIdCookie(id: string) {
  if (typeof document === "undefined") return;
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `yard_anon_id=${id}; path=/; max-age=${maxAge}; samesite=lax`;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateAnonId(): string {
  let id = getAnonIdCookie();
  if (!id) {
    id = generateUUID();
    setAnonIdCookie(id);
  }
  return id;
}

function firstNameOf(full: string) {
  const t = full.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] || "";
}

function maskEmail(email: string) {
  const e = email.trim();
  const at = e.indexOf("@");
  if (at <= 1) return e;
  const name = e.slice(0, at);
  const domain = e.slice(at);
  const head = name.slice(0, 2);
  const tail = name.slice(-1);
  return `${head}***${tail}${domain}`;
}

function maskPhone(phone: string) {
  const p = phone.trim().replace(/\s+/g, "");
  if (p.length < 7) return p;
  return `${p.slice(0, 4)}***${p.slice(-3)}`;
}

const Field = memo(function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-bold text-black/70 mb-1.5">{label}</label>
      {hint ? <div className="text-[11px] sm:text-xs text-black/45 -mt-0.5 mb-2">{hint}</div> : null}
      {children}
    </div>
  );
});

export default function PassGenerator() {
  const prefersReduced = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("");

  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const [savedPass, setSavedPass] = useState<PassData | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [err, setErr] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing pass (device-based)
  useEffect(() => {
    const checkExistingPass = async () => {
      try {
        const anonId = getOrCreateAnonId();
        const res = await fetch(`/api/passes?anonId=${anonId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pass) {
            setSavedPass(data.pass);
            setIsLocked(false);
          }
        }
      } catch (error) {
        console.error("Error checking existing pass:", error);
      } finally {
        setLoadingExisting(false);
      }
    };
    checkExistingPass();
  }, []);

  const greeting = useMemo(() => {
    if (savedPass?.name) return `Welcome back, ${firstNameOf(savedPass.name) || "you"}.`;
    if (name.trim()) return `Alright ${firstNameOf(name) || name.trim()}, let’s do it.`;
    return "Make your pass. Keep it. Use it.";
  }, [savedPass?.name, name]);

  const subGreeting = useMemo(() => {
    if (!savedPass) {
      return "This pass is tied to this device. Once you generate it, download the PNG so you always have it.";
    }
    return "Your pass is already generated on this device. You can download it anytime.";
  }, [savedPass]);

  const renderCard = useMemo<PassData>(() => {
    if (savedPass) return savedPass;

    const title: PassData["title"] = gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT";
    const status: PassData["status"] = gender === "female" ? "Angel Certified" : "Descendant Certified";

    return {
      id: "YARD-XX-XXXXXXXX",
      name: name.trim() || "Your Name",
      email: email.trim() || "you@email.com",
      phone: phone.trim() || "+234...",
      gender: (gender || "male") as PassData["gender"],
      title,
      status,
      yearJoined: new Date().getFullYear(),
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      photoDataUrl,
    };
  }, [savedPass, name, email, phone, gender, photoDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void drawPass(canvas, renderCard, isLocked);
  }, [renderCard, isLocked]);

  const onPickPhoto = useCallback(async (file?: File | null) => {
    if (!file) {
      setPhotoDataUrl(undefined);
      setPhotoPreview(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPhotoDataUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const generateCard = useCallback(async () => {
    setErr("");
    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();

    if (!n || !em || !ph || !gender) {
      setErr("Fill your details and pick a path (Angel/Descendant).");
      return;
    }
    if (!em.includes("@")) {
      setErr("That email doesn’t look right. Check it and try again.");
      return;
    }

    setSaving(true);
    try {
      const year = String(new Date().getFullYear()).slice(-2);
      const hex = Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
      const cardId = `YARD-${year}-${hex}`;

      const title: PassData["title"] = gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT";
      const status: PassData["status"] = gender === "female" ? "Angel Certified" : "Descendant Certified";

      const newPass: PassData = {
        id: cardId,
        name: n,
        email: em,
        phone: ph,
        gender: gender as PassData["gender"],
        title,
        status,
        yearJoined: new Date().getFullYear(),
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        photoDataUrl,
      };

      // Export PNG from canvas
      const exportCanvas = document.createElement("canvas");
      await drawPass(exportCanvas, newPass, false);
      const pngDataUrl = exportCanvas.toDataURL("image/png", 1.0);

      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, phone: ph, gender, pngDataUrl }),
      });

      if (!res.ok) throw new Error("Failed to save pass");

      setSavedPass({ ...newPass, pngDataUrl });
      setIsLocked(false);
    } catch (error) {
      console.error("Error generating pass:", error);
      setErr("Couldn’t generate right now. Try again in a minute.");
    } finally {
      setSaving(false);
    }
  }, [name, email, phone, gender, photoDataUrl]);

  const downloadPNG = useCallback(async () => {
    if (!savedPass?.pngDataUrl && !canvasRef.current) return;
    setSaving(true);
    try {
      let dataUrl: string;
      if (savedPass?.pngDataUrl) {
        dataUrl = savedPass.pngDataUrl;
      } else {
        const exportCanvas = document.createElement("canvas");
        await drawPass(exportCanvas, renderCard, false);
        dataUrl = exportCanvas.toDataURL("image/png", 1.0);
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${savedPass?.id || "yard-pass"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setSaving(false);
    }
  }, [savedPass, renderCard]);

  const regenerateCard = useCallback(() => {
    if (!confirm("This will overwrite your existing pass on this device. Continue?")) return;
    setSavedPass(null);
    setIsLocked(true);
    setName("");
    setEmail("");
    setPhone("");
    setGender("");
    setPhotoDataUrl(undefined);
    setPhotoPreview(undefined);
  }, []);

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-black/20 border-t-black/60 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top copy */}
      <div className="rounded-2xl sm:rounded-3xl border border-black/10 bg-[#FFFEF5]/85 backdrop-blur-sm p-5 sm:p-6 md:p-7 shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black">{greeting}</h2>
            <p className="mt-1.5 text-xs sm:text-sm text-black/60 max-w-2xl">{subGreeting}</p>
          </div>

          {!isLocked ? (
            <span className="px-3 py-1.5 rounded-full bg-green-500/15 text-green-700 text-xs font-extrabold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Pass active
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-black/6 text-black/70 text-xs font-extrabold">
              Preview locked
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-black/55">
          <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">Unique ID</span>
          <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">Personal stamp</span>
          <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">Downloadable PNG</span>
          <span className="px-2.5 py-1 rounded-full bg-black/5 border border-black/10">No noise</span>
        </div>
      </div>

      {/* Form and Preview Grid */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Form Section */}
        <motion.div
          className="order-2 lg:order-1 rounded-2xl sm:rounded-3xl border border-black/10 bg-[#FFFEF5]/80 backdrop-blur-sm p-5 sm:p-6 md:p-8 shadow-lg"
          initial={prefersReduced ? undefined : { opacity: 0, y: 15 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black">Your Details</h3>
              <p className="text-xs sm:text-sm text-black/60 mt-1">
                Keep it simple — name, contact, and your path. That’s it.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateCard();
              }}
              className="space-y-4"
            >
              <Field label="Full Name" hint="This is what shows on your pass.">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                  disabled={!isLocked}
                  autoComplete="name"
                />
              </Field>

              <Field label="Email Address" hint="Used to save your pass + updates later.">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@email.com"
                  type="email"
                  disabled={!isLocked}
                  autoComplete="email"
                />
              </Field>

              <Field label="Phone Number" hint="Optional for future show alerts.">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="+234 800 000 0000"
                  disabled={!isLocked}
                  autoComplete="tel"
                />
              </Field>

              <Field label="Choose your path" hint="This decides your pass title.">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    disabled={!isLocked}
                    className={`gender-btn ${gender === "male" ? "gender-btn-active" : ""}`}
                  >
                    <span className="text-lg">♂</span>
                    <span>Descendant</span>
                    <span className="text-[10px] opacity-70">Legacy mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    disabled={!isLocked}
                    className={`gender-btn ${gender === "female" ? "gender-btn-active" : ""}`}
                  >
                    <span className="text-lg">♀</span>
                    <span>Angel</span>
                    <span className="text-[10px] opacity-70">Wings mode</span>
                  </button>
                </div>
              </Field>

              <Field label="Upload Your Photo" hint="Use a clear portrait. It looks better on the card.">
                <div
                  className={`photo-upload-area ${!isLocked ? "opacity-60 pointer-events-none" : ""}`}
                  onClick={() => isLocked && fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoDataUrl(undefined);
                          setPhotoPreview(undefined);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center text-sm hover:bg-black"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-black/50">
                      <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold">Click to upload photo</span>
                      <span className="text-xs">JPG/PNG • Portrait recommended</span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickPhoto(e.target.files?.[0])}
                    className="hidden"
                    disabled={!isLocked}
                  />
                </div>
              </Field>

              {err && <p className="text-sm font-semibold text-red-600">{err}</p>}

              {isLocked ? (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 px-6 bg-black text-[rgb(var(--yard-gold))] font-black rounded-xl hover:bg-black/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>Generate My Pass ☥</>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={regenerateCard}
                  className="w-full py-3.5 px-6 bg-black/10 text-black font-black rounded-xl hover:bg-black/15 transition"
                >
                  Regenerate Pass
                </button>
              )}

              <div className="text-[11px] sm:text-xs text-black/45 leading-relaxed">
                Tip: after generating, download the PNG. If you clear cookies or switch devices, you might not see the saved pass.
              </div>
            </form>
          </div>
        </motion.div>

        {/* Card Preview Section */}
        <motion.div
          className="order-1 lg:order-2 space-y-4"
          initial={prefersReduced ? undefined : { opacity: 0, y: 15 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-black text-black/60 uppercase tracking-wider">
                {isLocked ? "Pass Preview" : "Your Yard Pass"}
              </p>
              {!isLocked && savedPass?.id ? (
                <p className="text-[11px] sm:text-xs text-black/45 mt-1">ID: <span className="font-semibold">{savedPass.id}</span></p>
              ) : null}
            </div>

            {!isLocked && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-black flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Ready
              </span>
            )}
          </div>

          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-black/10">
            <canvas ref={canvasRef} className="block w-full h-auto" />

            {/* Locked Overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="bg-white/95 rounded-2xl p-6 text-center shadow-xl max-w-[240px]">
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="font-black text-black text-sm">Generate to Reveal</p>
                  <p className="text-xs text-black/60 mt-1">Fill the form and hit generate.</p>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          {!isLocked && (
            <button
              onClick={downloadPNG}
              disabled={saving}
              className="w-full py-3.5 px-6 bg-[rgb(var(--yard-gold))] text-black font-black rounded-xl hover:brightness-105 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {saving ? "Preparing..." : "Download PNG ↓"}
            </button>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.08);
          color: #111;
          outline: none;
          transition: all 150ms ease;
        }
        .form-input:focus {
          border-color: rgba(0, 0, 0, 0.25);
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
        }
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-input::placeholder {
          color: rgba(0, 0, 0, 0.35);
          font-weight: 600;
        }
        .gender-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 14px 12px;
          font-weight: 900;
          font-size: 13px;
          border-radius: 12px;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.7);
          transition: all 150ms ease;
          cursor: pointer;
        }
        .gender-btn:hover:not(:disabled) {
          border-color: rgba(0, 0, 0, 0.2);
          background: rgba(255, 210, 0, 0.06);
        }
        .gender-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .gender-btn-active {
          background: rgba(255, 210, 0, 0.16);
          border-color: rgba(255, 210, 0, 0.55);
          color: #111;
        }
        .photo-upload-area {
          width: 100%;
          height: 140px;
          border-radius: 12px;
          border: 2px dashed rgba(0, 0, 0, 0.15);
          background: white;
          cursor: pointer;
          overflow: hidden;
          transition: all 150ms ease;
        }
        .photo-upload-area:hover {
          border-color: rgba(0, 0, 0, 0.3);
          background: rgba(255, 210, 0, 0.03);
        }
      `}</style>
    </div>
  );
}

/** Canvas renderer */
async function drawPass(canvas: HTMLCanvasElement, card: PassData, isLocked: boolean) {
  try {
    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {}

  // Card dimensions (postcard style - landscape)
  const W = 1200;
  const H = 750;
  const scale = 2;

  canvas.width = W * scale;
  canvas.height = H * scale;
  canvas.style.width = "100%";
  canvas.style.aspectRatio = `${W}/${H}`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background - cream/yellow
  ctx.fillStyle = "#FFF9E6";
  ctx.fillRect(0, 0, W, H);

  // Draw star border
  drawStarBorder(ctx, W, H);

  // Photo frame area (left side)
  const photoX = 80;
  const photoY = 100;
  const photoW = 340;
  const photoH = 450;

  // Photo frame shadow
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Photo frame background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Photo frame border
  ctx.strokeStyle = "#E0D9C8";
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Inner photo area
  const innerPadding = 15;
  const innerX = photoX + innerPadding;
  const innerY = photoY + innerPadding;
  const innerW = photoW - innerPadding * 2;
  const innerH = photoH - innerPadding * 2;

  if (card.photoDataUrl) {
    try {
      const img = await loadImage(card.photoDataUrl);
      const imgScale = Math.max(innerW / img.width, innerH / img.height);
      const iw = img.width * imgScale;
      const ih = img.height * imgScale;
      const ix = innerX + (innerW - iw) / 2;
      const iy = innerY + (innerH - ih) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(innerX, innerY, innerW, innerH);
      ctx.clip();
      ctx.drawImage(img, ix, iy, iw, ih);
      ctx.restore();
    } catch {
      drawPlaceholderImage(ctx, innerX, innerY, innerW, innerH);
    }
  } else {
    drawPlaceholderImage(ctx, innerX, innerY, innerW, innerH);
  }

  // Inner border
  ctx.strokeStyle = "#D0C9B8";
  ctx.lineWidth = 1;
  ctx.strokeRect(innerX, innerY, innerW, innerH);

  // Right side content
  const contentX = 480;
  const contentY = 100;

  // Title
  ctx.fillStyle = "#8B7355";
  ctx.font = "italic 900 52px Georgia, serif";
  ctx.textAlign = "left";

  const titleLine1 = "YARDEN'S";
  const titleLine2 = card.gender === "female" ? "ANGEL" : "DESCENDANT";

  ctx.fillText(titleLine1, contentX, contentY + 50);
  ctx.fillText(titleLine2, contentX + 40, contentY + 110);

  // Small personal line under title
  ctx.font = "600 16px Georgia, serif";
  ctx.fillStyle = "#6B5A44";
  const fn = firstNameOf(card.name) || "Member";
  ctx.fillText(`Made for ${fn} • ID ${card.id}`, contentX, contentY + 142);

  // Form fields with dotted lines
  ctx.font = "500 24px Georgia, serif";
  ctx.fillStyle = "#4A4A4A";

  const fieldY = contentY + 200;
  const lineSpacing = 70;
  const dotStartX = contentX + 180;
  const lineEndX = W - 100;

  // Name field
  ctx.fillText("Name", contentX, fieldY);
  drawDottedLine(ctx, dotStartX, fieldY, lineEndX);
  if (!isLocked && card.name !== "Your Name") {
    ctx.font = "700 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(card.name, dotStartX + 10, fieldY);
    ctx.font = "500 24px Georgia, serif";
    ctx.fillStyle = "#4A4A4A";
  }

  // Year joined field
  ctx.fillText("Year joined", contentX, fieldY + lineSpacing);
  drawDottedLine(ctx, dotStartX, fieldY + lineSpacing, lineEndX);
  if (!isLocked) {
    ctx.font = "700 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(String(card.yearJoined), dotStartX + 10, fieldY + lineSpacing);
    ctx.font = "500 24px Georgia, serif";
    ctx.fillStyle = "#4A4A4A";
  }

  // Status field
  ctx.fillText("Status", contentX, fieldY + lineSpacing * 2);
  drawDottedLine(ctx, dotStartX, fieldY + lineSpacing * 2, lineEndX);
  if (!isLocked) {
    ctx.font = "700 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(card.status, dotStartX + 10, fieldY + lineSpacing * 2);
  }

  // Contact line (masked) + join date
  if (!isLocked) {
    ctx.font = "600 14px Georgia, serif";
    ctx.fillStyle = "#6E6E6E";
    const emailMasked = maskEmail(card.email);
    const phoneMasked = maskPhone(card.phone);
    ctx.fillText(`Contact: ${emailMasked} • ${phoneMasked}`, contentX, fieldY + lineSpacing * 2 + 36);
    ctx.fillText(`Created: ${card.createdAt}`, contentX, fieldY + lineSpacing * 2 + 58);
  }

  // Bottom message (more personal, not corny)
  const msgY = H - 150;
  ctx.font = "italic 500 18px Georgia, serif";
  ctx.fillStyle = "#7A7A7A";

  const message =
    card.gender === "female"
      ? "If you lose this pass, you’re still certified — this just proves it."
      : "If you lose this pass, you’re still official — this just proves it.";
  const message2 = "Keep the PNG. Keep the flex.";

  ctx.fillText(message, contentX, msgY);
  ctx.fillText(message2, contentX, msgY + 28);

  // Signature line
  ctx.font = "italic 700 22px Georgia, serif";
  ctx.fillStyle = "#6B5A44";
  ctx.fillText("— Yarden ☥", contentX, H - 92);

  // Unique "member mark" (QR-ish) near bottom-right
  drawMemberMark(ctx, W - 205, H - 170, card.id);

  // Stamp effect (still keeps your old vibe)
  drawStamp(ctx, W - 180, H - 120);

  // Bottom dotted line
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = "#C0B8A8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentX, H - 70);
  ctx.lineTo(W - 80, H - 70);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStarBorder(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const starSize = 18;
  const spacing = 70;
  const margin = 35;

  ctx.font = `900 ${starSize}px Arial`;
  ctx.fillStyle = "#2A2A2A";

  // Top row
  for (let x = margin; x < W - margin; x += spacing) {
    ctx.fillText("★", x, margin + 10);
  }

  // Bottom row
  for (let x = margin; x < W - margin; x += spacing) {
    if (Math.abs(x - W / 2) < spacing / 2) {
      ctx.fillStyle = "#D64545";
      ctx.fillText("★", x, H - margin + 5);
      ctx.fillStyle = "#2A2A2A";
    } else {
      ctx.fillText("★", x, H - margin + 5);
    }
  }

  // Left column
  for (let y = margin + spacing; y < H - margin; y += spacing) {
    ctx.fillText("★", margin - 5, y);
  }

  // Right column
  for (let y = margin + spacing; y < H - margin; y += spacing) {
    ctx.fillText("★", W - margin - 10, y);
  }
}

function drawDottedLine(ctx: CanvasRenderingContext2D, startX: number, y: number, endX: number) {
  ctx.fillStyle = "#9A9A9A";
  for (let x = startX; x < endX; x += 12) {
    ctx.fillText(".", x, y);
  }
}

function drawPlaceholderImage(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const skyGrad = ctx.createLinearGradient(x, y, x, y + h * 0.6);
  skyGrad.addColorStop(0, "#87CEEB");
  skyGrad.addColorStop(1, "#B0E0E6");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h * 0.6);

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.3, 50, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.4, y + h * 0.32, 35, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.6, y + h * 0.32, 40, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  const hillGrad = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
  hillGrad.addColorStop(0, "#7CB342");
  hillGrad.addColorStop(1, "#558B2F");
  ctx.fillStyle = hillGrad;

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.6, y + h * 0.65);
  ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.55, x + w, y + h * 0.7);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  const frontHillGrad = ctx.createLinearGradient(x, y + h * 0.7, x, y + h);
  frontHillGrad.addColorStop(0, "#8BC34A");
  frontHillGrad.addColorStop(1, "#689F38");
  ctx.fillStyle = frontHillGrad;

  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.75);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.6, x + w, y + h * 0.85);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.globalAlpha = 0.35;

  ctx.strokeStyle = "#C88";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#C88";
  ctx.font = "400 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🤍", x, y + 5);

  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const innerR = 48;
    const outerR = 52;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
    ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
    ctx.stroke();
  }

  ctx.restore();
}

/** A tiny deterministic "member mark" from the pass ID (feels official, no libs) */
function drawMemberMark(ctx: CanvasRenderingContext2D, x: number, y: number, seed: string) {
  const size = 110;
  const cells = 11;
  const cell = Math.floor(size / cells);

  // Frame
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(x, y, cell * cells, cell * cells);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, cell * cells, cell * cells);

  // Finder corners (like QR)
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(fx, fy, cell * 3, cell * 3);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(fx + cell, fy + cell, cell, cell);
  };
  drawFinder(x + cell, y + cell);
  drawFinder(x + cell * 7, y + cell);
  drawFinder(x + cell, y + cell * 7);

  // Data bits
  const bits = hashBits(seed, cells * cells);
  let i = 0;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder =
        (r >= 1 && r <= 3 && c >= 1 && c <= 3) ||
        (r >= 1 && r <= 3 && c >= 7 && c <= 9) ||
        (r >= 7 && r <= 9 && c >= 1 && c <= 3);
      if (inFinder) continue;

      const on = bits[i++ % bits.length];
      if (on) {
        ctx.fillStyle = "rgba(0,0,0,0.80)";
        ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
      }
    }
  }

  // Label
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.font = "700 10px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("MEMBER MARK", x + 8, y + cell * cells + 14);

  ctx.restore();
}

function hashBits(seed: string, n: number): boolean[] {
  // simple string hash -> bits
  let h1 = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h1 ^= seed.charCodeAt(i);
    h1 = Math.imul(h1, 16777619);
  }
  const out: boolean[] = [];
  let x = h1 >>> 0;
  for (let i = 0; i < n; i++) {
    // xorshift
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out.push((x >>> 0) % 3 === 0);
  }
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
