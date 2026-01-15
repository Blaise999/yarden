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

const Field = memo(function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-bold text-black/70 mb-1.5">{label}</label>
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

  const renderCard = useMemo<PassData>(() => {
    if (savedPass) return savedPass;
    const title: PassData["title"] = gender === "female" ? "YARDEN'S ANGEL" : "YARDEN'S DESCENDANT";
    const status: PassData["status"] = gender === "female" ? "Angel Certified" : "Descendant Certified";
    return {
      id: "YARD-XX-XXXXXXXX",
      name: name.trim() || "Your Name",
      email: email.trim() || "you@email.com",
      phone: phone.trim() || "+234...",
      gender: gender || "male",
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
      setErr("Please fill all fields and select gender.");
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
        gender,
        title,
        status,
        yearJoined: new Date().getFullYear(),
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        photoDataUrl,
      };
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
      setErr("Failed to generate card. Please try again.");
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
    if (!confirm("This will overwrite your existing card. Continue?")) return;
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
              <h3 className="text-lg sm:text-xl font-black text-black">Fill Your Details</h3>
              <p className="text-xs sm:text-sm text-black/60 mt-1">Complete the form to generate your Yard Pass</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); generateCard(); }} className="space-y-4">
              <Field label="Full Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                  disabled={!isLocked}
                />
              </Field>

              <Field label="Email Address">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@email.com"
                  type="email"
                  disabled={!isLocked}
                />
              </Field>

              <Field label="Phone Number">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="+234 800 000 0000"
                  disabled={!isLocked}
                />
              </Field>

              <Field label="Select Gender">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    disabled={!isLocked}
                    className={`gender-btn ${gender === "male" ? "gender-btn-active" : ""}`}
                  >
                    <span className="text-lg">♂</span>
                    <span>Male</span>
                    <span className="text-[10px] opacity-70">Descendant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    disabled={!isLocked}
                    className={`gender-btn ${gender === "female" ? "gender-btn-active" : ""}`}
                  >
                    <span className="text-lg">♀</span>
                    <span>Female</span>
                    <span className="text-[10px] opacity-70">Angel</span>
                  </button>
                </div>
              </Field>

              <Field label="Upload Your Photo">
                <div 
                  className={`photo-upload-area ${!isLocked ? 'opacity-60 pointer-events-none' : ''}`}
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
                      <span className="text-xs">Portrait recommended</span>
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
                  className="w-full py-3.5 px-6 bg-black text-[rgb(var(--yard-gold))] font-bold rounded-xl hover:bg-black/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>Generate My Card ☥</>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={regenerateCard}
                  className="w-full py-3.5 px-6 bg-black/10 text-black font-bold rounded-xl hover:bg-black/15 transition"
                >
                  Regenerate Card
                </button>
              )}
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
              <p className="text-xs sm:text-sm font-bold text-black/60 uppercase tracking-wider">
                {isLocked ? "Card Preview" : "Your Yard Pass"}
              </p>
            </div>
            {!isLocked && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Generated
              </span>
            )}
          </div>

          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-black/10">
            <canvas ref={canvasRef} className="block w-full h-auto" />
            
            {/* Locked Overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="bg-white/95 rounded-2xl p-6 text-center shadow-xl max-w-[200px]">
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="font-bold text-black text-sm">Generate to Reveal</p>
                  <p className="text-xs text-black/60 mt-1">Fill the form and click generate</p>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          {!isLocked && (
            <button
              onClick={downloadPNG}
              disabled={saving}
              className="w-full py-3.5 px-6 bg-[rgb(var(--yard-gold))] text-black font-bold rounded-xl hover:brightness-105 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
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
          font-weight: 500;
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
        }
        .gender-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 14px 12px;
          font-weight: 700;
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
          background: rgba(255, 210, 0, 0.05);
        }
        .gender-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .gender-btn-active {
          background: rgba(255, 210, 0, 0.15);
          border-color: rgba(255, 210, 0, 0.5);
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
  drawStarBorder(ctx, W, H, card.gender === "female");

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

  // Form fields with dotted lines
  ctx.font = "500 24px Georgia, serif";
  ctx.fillStyle = "#4A4A4A";
  
  const fieldY = contentY + 180;
  const lineSpacing = 70;
  const dotStartX = contentX + 180;
  const lineEndX = W - 100;

  // Name field
  ctx.fillText("Name", contentX, fieldY);
  drawDottedLine(ctx, dotStartX, fieldY, lineEndX);
  if (!isLocked && card.name !== "Your Name") {
    ctx.font = "600 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(card.name, dotStartX + 10, fieldY);
    ctx.font = "500 24px Georgia, serif";
    ctx.fillStyle = "#4A4A4A";
  }

  // Year joined field
  ctx.fillText("Year joined", contentX, fieldY + lineSpacing);
  drawDottedLine(ctx, dotStartX, fieldY + lineSpacing, lineEndX);
  if (!isLocked) {
    ctx.font = "600 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(String(card.yearJoined), dotStartX + 10, fieldY + lineSpacing);
    ctx.font = "500 24px Georgia, serif";
    ctx.fillStyle = "#4A4A4A";
  }

  // Status field
  ctx.fillText("Status", contentX, fieldY + lineSpacing * 2);
  drawDottedLine(ctx, dotStartX, fieldY + lineSpacing * 2, lineEndX);
  if (!isLocked) {
    ctx.font = "600 22px Georgia, serif";
    ctx.fillStyle = "#2A2A2A";
    ctx.fillText(card.status, dotStartX + 10, fieldY + lineSpacing * 2);
  }

  // Bottom message
  const msgY = H - 140;
  ctx.font = "italic 400 18px Georgia, serif";
  ctx.fillStyle = "#7A7A7A";
  
  const message = card.gender === "female" 
    ? "Losing this card won't revoke your wings but it"
    : "Losing this card won't revoke your legacy but it";
  const message2 = "might revoke your bragging rights.";
  
  ctx.fillText(message, contentX, msgY);
  ctx.fillText(message2, contentX, msgY + 28);

  // Stamp effect (bottom right)
  drawStamp(ctx, W - 180, H - 120, card.gender === "female");

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

function drawStarBorder(ctx: CanvasRenderingContext2D, W: number, H: number, isFemale: boolean) {
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
    // Add red star in the middle for variety
    if (Math.abs(x - W/2) < spacing/2) {
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
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(x, y, x, y + h * 0.6);
  skyGrad.addColorStop(0, "#87CEEB");
  skyGrad.addColorStop(1, "#B0E0E6");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h * 0.6);

  // Cloud
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

  // Hills
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

  // Front hill
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

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, isFemale: boolean) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  
  // Outer circle
  ctx.strokeStyle = "#C88";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 55, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(x, y, 45, 0, Math.PI * 2);
  ctx.stroke();

  // Heart/Love symbol in center
  ctx.fillStyle = "#C88";
  ctx.font = "400 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🤍", x, y + 5);

  // Small decorative lines
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
