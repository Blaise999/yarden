// components/landing/pass/YardPassGen.tsx
// Self-contained, working Yard Pass generator.
// Renders a live canvas pass, lets the user download it, and POSTs to /api/passes.
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type Gender = "male" | "female" | "";

function genId() {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += s[Math.floor(Math.random() * s.length)];
  return `YRD-${out.slice(0, 4)}-${out.slice(4)}`;
}

/* draw the pass onto a canvas (2x for crispness) */
function drawPass(
  canvas: HTMLCanvasElement,
  data: { name: string; title: string; status: string; id: string; year: number }
) {
  const W = 1000, H = 620, S = 2;
  canvas.width = W * S; canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(S, S);

  const GOLD = "#E4B13C", GOLD_D = "#b98a29", INK = "#0A0A0F", BONE = "#F3ECDD", MUT = "#9A93A8";

  // background
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.82, H * 0.15, 40, W * 0.82, H * 0.15, 620);
  g.addColorStop(0, "rgba(228,177,60,.20)"); g.addColorStop(1, "rgba(228,177,60,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // gold frame
  ctx.strokeStyle = "rgba(228,177,60,.55)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // right gold stub
  const stubX = W - 150;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(stubX, 24); ctx.lineTo(W - 24, 24); ctx.lineTo(W - 24, H - 24); ctx.lineTo(stubX, H - 24);
  ctx.closePath(); ctx.fill();
  // perforation dots
  ctx.fillStyle = INK;
  for (let y = 60; y < H - 40; y += 26) { ctx.beginPath(); ctx.arc(stubX, y, 4, 0, Math.PI * 2); ctx.fill(); }
  // vertical text on stub
  ctx.save();
  ctx.translate(W - 74, H / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = INK; ctx.font = "700 30px Georgia, serif"; ctx.textAlign = "center";
  ctx.fillText("THE DESCENDANTS", 0, 8);
  ctx.restore();

  // ankh (top-left)
  const ax = 66, ay = 74;
  ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.ellipse(ax, ay - 6, 14, 17, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ax, ay + 10); ctx.lineTo(ax, ay + 44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ax - 16, ay + 20); ctx.lineTo(ax + 16, ay + 20); ctx.stroke();

  // wordmark
  ctx.fillStyle = BONE; ctx.textAlign = "left";
  ctx.font = "italic 600 40px Georgia, serif";
  ctx.fillText("Yarden", 96, 88);

  // top-right label
  ctx.fillStyle = GOLD; ctx.textAlign = "right";
  ctx.font = "700 15px system-ui, sans-serif";
  ctx.fillText("Y A R D   P A S S", stubX - 40, 66);
  ctx.fillStyle = MUT; ctx.font = "500 12px system-ui, sans-serif";
  ctx.fillText(`EST. ${data.year}`, stubX - 40, 88);

  // holder
  ctx.textAlign = "left";
  ctx.fillStyle = MUT; ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText("PASS HOLDER", 66, 300);
  ctx.fillStyle = BONE; ctx.font = "600 62px Georgia, serif";
  const name = (data.name || "Your Name").slice(0, 20);
  ctx.fillText(name, 64, 360);

  // title
  ctx.fillStyle = GOLD; ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillText(data.title.toUpperCase(), 66, 404);

  // divider
  ctx.strokeStyle = "rgba(243,236,221,.16)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(66, 470); ctx.lineTo(stubX - 40, 470); ctx.stroke();

  // status + id
  ctx.fillStyle = MUT; ctx.font = "500 13px system-ui, sans-serif";
  ctx.fillText("STATUS", 66, 512);
  ctx.fillStyle = BONE; ctx.font = "600 20px Georgia, serif";
  ctx.fillText(data.status, 66, 540);

  ctx.fillStyle = MUT; ctx.font = "500 13px system-ui, sans-serif";
  ctx.fillText("PASS ID", 360, 512);
  ctx.fillStyle = BONE; ctx.font = "600 20px ui-monospace, Menlo, monospace";
  ctx.fillText(data.id, 360, 540);

  // faux barcode bottom
  let bx = 66; const by = 560;
  ctx.fillStyle = "rgba(243,236,221,.75)";
  for (let i = 0; i < 46; i++) { const w = (i % 3) + 1; ctx.fillRect(bx, by, w, 22); bx += w + 3; }
}

export default function YardPassGen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [idNum] = useState(genId);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const year = new Date().getFullYear();
  const title = gender === "female" ? "Yarden's Angel" : "Yarden's Descendant";
  const statusLabel = gender === "female" ? "Angel Certified" : "Descendant Certified";

  // live preview
  useEffect(() => {
    if (canvasRef.current) drawPass(canvasRef.current, { name, title, status: statusLabel, id: idNum, year });
  }, [name, title, statusLabel, idNum, year]);

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && phone.trim() && gender;

  const generate = useCallback(async () => {
    if (!valid || !canvasRef.current) { setMsg("Fill in every field to mint your pass."); return; }
    setStatus("saving"); setMsg("");
    const pngDataUrl = canvasRef.current.toDataURL("image/png");

    // download immediately
    try {
      const a = document.createElement("a");
      a.href = pngDataUrl; a.download = `yard-pass-${idNum}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch {}

    // save to backend
    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), gender, pngDataUrl }),
      });
      if (res.ok) { setStatus("done"); setMsg("You're in. Your pass downloaded — welcome to the descendants."); }
      else { setStatus("done"); setMsg("Your pass downloaded. (Couldn't reach the list — try again later.)"); }
    } catch {
      setStatus("done"); setMsg("Your pass downloaded. (Offline — we couldn't save it to the list.)");
    }
  }, [valid, name, email, phone, gender, idNum]);

  const input =
    "w-full rounded-xl bg-white/[0.04] border border-white/12 px-4 py-3 text-[15px] text-[#F3ECDD] placeholder-white/35 outline-none transition focus:border-[#E4B13C]/70 focus:bg-white/[0.06]";

  return (
    <div className="grid gap-6 md:grid-cols-[1.05fr_.95fr]">
      {/* preview */}
      <div className="order-2 md:order-1">
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)]">
          <canvas ref={canvasRef} className="block w-full" style={{ aspectRatio: "1000 / 620" }} />
        </div>
        <p className="mt-3 text-center text-xs text-white/40">Live preview · updates as you type</p>
      </div>

      {/* form */}
      <div className="order-1 md:order-2">
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E4B13C]">Yard Pass</div>
          <h3 className="mt-1 text-2xl font-semibold text-[#F3ECDD]" style={{ fontFamily: "Lora, Georgia, serif" }}>
            Mint your pass
          </h3>
          <p className="mt-1 text-sm text-white/50">Free. It just means you hear it first.</p>
        </div>

        <div className="grid gap-3">
          <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={22} />
          <input className={input} placeholder="you@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} placeholder="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            {([["male", "Descendant"], ["female", "Angel"]] as const).map(([g, label]) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={
                  "rounded-xl border px-4 py-3 text-sm font-medium transition " +
                  (gender === g
                    ? "border-[#E4B13C] bg-[#E4B13C]/12 text-[#E4B13C]"
                    : "border-white/12 bg-white/[0.03] text-white/70 hover:border-white/25")
                }
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={status === "saving"}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4B13C] px-5 py-3.5 text-sm font-semibold text-[#12100a] transition hover:brightness-105 disabled:opacity-60"
          >
            {status === "saving" ? "Minting…" : "Generate & download my pass"}
          </button>

          {msg ? (
            <p className={"text-sm " + (status === "done" ? "text-[#E4B13C]" : "text-white/60")}>{msg}</p>
          ) : (
            <p className="text-xs text-white/35">Your details stay private. Unsubscribe anytime.</p>
          )}
        </div>
      </div>
    </div>
  );
}
