"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./yard-pass-v12.css";

type Gender = "male" | "female" | "";
type PassDesign = { name: string; title: string; status: string; id: string; year: number; issued: boolean };

/** A genuine printable/exportable canvas, not a screenshot or remotely stored photo. */
function renderPass(canvas: HTMLCanvasElement, pass: PassDesign, scale = 1) {
  const W = 1080, H = 660;
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  const ivory = "#efeee7";
  const muted = "#b6c2a6";
  const gold = "#d9ecab";
  const royal = "#20291c";
  const isAngel = pass.title.toLowerCase().includes("angel");

  // ANGEL-era plum black / muted rose-metallic foil, not the old yellow ticket.
  const ink = ctx.createLinearGradient(0, 0, W, H);
  ink.addColorStop(0, "#12180e");
  ink.addColorStop(.54, "#303d24");
  ink.addColorStop(1, "#0d120b");
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, W, H);

  const light = ctx.createRadialGradient(770, 180, 10, 770, 180, 690);
  light.addColorStop(0, "rgba(245,188,177,.20)");
  light.addColorStop(.58, "rgba(190,129,166,.09)");
  light.addColorStop(1, "rgba(190,129,166,0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);

  // Very fine technical grid gives the card a crafted, printed quality.
  ctx.strokeStyle = "rgba(249,225,216,.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Brushed-metal outer border and inner rule.
  const foil = ctx.createLinearGradient(0, 0, W, H);
  foil.addColorStop(0, "rgba(255,236,225,.88)");
  foil.addColorStop(.35, "rgba(198,143,161,.39)");
  foil.addColorStop(.75, "rgba(255,219,193,.7)");
  foil.addColorStop(1, "rgba(255,234,222,.22)");
  ctx.strokeStyle = foil;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = "rgba(250,216,217,.13)";
  ctx.lineWidth = 1;
  ctx.strokeRect(33, 33, W - 66, H - 66);

  // Right exhibition panel, with engraved concentric ANGEL halos.
  const rightStart = 740;
  const panel = ctx.createLinearGradient(rightStart, 0, W, H);
  panel.addColorStop(0, "rgba(128,73,102,.34)");
  panel.addColorStop(1, "rgba(53,31,47,.12)");
  ctx.fillStyle = panel;
  ctx.fillRect(rightStart, 34, W - rightStart - 34, H - 68);
  ctx.strokeStyle = "rgba(248,206,200,.32)";
  ctx.beginPath(); ctx.moveTo(rightStart, 34); ctx.lineTo(rightStart, H - 34); ctx.stroke();

  ctx.save();
  ctx.translate(910, 312);
  for (let n = 0; n < 7; n++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 73 + n * 20, 108 + n * 16, -0.21, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(242,199,189,${Math.max(.09, .46 - n * .055)})`;
    ctx.lineWidth = n === 0 ? 2.3 : 1;
    ctx.stroke();
  }
  // Custom engraved ankh: curved top and cross, not an emoji or a photograph.
  ctx.strokeStyle = "#eff4df";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.ellipse(0, -33, 29, 42, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 105); ctx.moveTo(-43, 50); ctx.lineTo(43, 50); ctx.stroke();
  ctx.restore();

  // Foil masthead and the album era label.
  ctx.textAlign = "left";
  ctx.fillStyle = ivory;
  ctx.font = "italic 500 55px Georgia, serif";
  ctx.fillText("Yarden", 69, 111);
  ctx.fillStyle = gold;
  ctx.font = "700 17px Arial, sans-serif";
  ctx.fillText("T H E   Y A R D   /   M E M B E R S H I P", 72, 152);

  ctx.fillStyle = muted;
  ctx.font = "600 14px Arial, sans-serif";
  ctx.fillText("CARD HOLDER", 72, 277);
  let fontSize = 66;
  const holder = pass.name.trim() || "YOUR NAME";
  do {
    ctx.font = `500 ${fontSize}px Georgia, serif`;
    if (ctx.measureText(holder).width <= 620 || fontSize <= 31) break;
    fontSize -= 2;
  } while (true);
  ctx.fillStyle = ivory;
  ctx.fillText(holder, 68, 354, 620);

  ctx.fillStyle = gold;
  ctx.font = "500 26px Georgia, serif";
  ctx.fillText(pass.title || "YARD MEMBER", 71, 407);
  ctx.strokeStyle = "rgba(249,226,215,.29)";
  ctx.beginPath(); ctx.moveTo(72, 450); ctx.lineTo(682, 450); ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = "600 13px Arial, sans-serif";
  ctx.fillText("MEMBERSHIP ID", 72, 502);
  ctx.fillText("JOINED", 515, 502);
  ctx.fillStyle = ivory;
  ctx.font = "600 22px monospace";
  ctx.fillText(pass.issued ? pass.id : "ISSUED AFTER REGISTRATION", 71, 536, 410);
  ctx.font = "500 24px Georgia, serif";
  ctx.fillText(String(pass.year), 514, 536);

  ctx.fillStyle = "rgba(251,230,223,.6)";
  ctx.font = "600 12px Arial, sans-serif";
  ctx.fillText("YARDEN / THE ANGEL ERA", 72, 591);
  ctx.textAlign = "center";
  ctx.font = "600 15px Arial, sans-serif";
  ctx.fillStyle = gold;
  ctx.fillText(isAngel ? "ANGEL / 01" : "DESCENDANT / 01", 910, 94);
  ctx.font = "700 13px Arial, sans-serif";
  ctx.fillText(pass.issued ? "YARD PASS — ACTIVE" : "PREVIEW — NOT ISSUED", 905, 570);
  ctx.font = "400 13px Arial, sans-serif";
  ctx.fillStyle = "#d9ecab";
  ctx.fillText("NOT A CONCERT TICKET", 905, 590);

  if (!pass.issued) {
    ctx.save();
    ctx.translate(360, 203);
    ctx.rotate(-Math.PI / 16);
    ctx.textAlign = "center";
    ctx.font = "600 17px Arial, sans-serif";
    ctx.fillStyle = "rgba(250,214,204,.4)";
    ctx.fillText("L I V E   P R E V I E W", 0, 0);
    ctx.restore();
  }
  void royal; // palette reserved for later card finishes
}

export default function YardPassGen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [passId, setPassId] = useState("");
  const [yearJoined, setYearJoined] = useState(new Date().getFullYear());
  const [existing, setExisting] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [serviceStatus, setServiceStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const title = gender === "female" ? "Yarden's Angel" : gender === "male" ? "Yarden's Descendant" : "The Yard / Member";
  const label = gender === "female" ? "Angel Certified" : "Descendant Certified";
  const card = useMemo<PassDesign>(() => ({ name, title, status: label, id: passId, year: yearJoined, issued: existing }), [name,title,label,passId,yearJoined,existing]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/passes", { cache: "no-store", signal: controller.signal })
      .then(async res => {
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Membership service is unavailable");
        return result;
      })
      .then(({ pass }) => {
        if (controller.signal.aborted) return;
        setServiceStatus("ready");
        if (pass) {
          setExisting(true);
          setName(pass.name);
          setEmail(pass.email);
          setPhone(pass.phone || "");
          setGender(pass.gender);
          setPassId(pass.id);
          setYearJoined(pass.yearJoined);
          setStatus("done");
          setMessage("Your membership is active. You can download the card again anytime on this browser.");
        }
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setServiceStatus("unavailable");
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Membership service is temporarily unavailable.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (canvasRef.current) renderPass(canvasRef.current, card, 1);
    // The editor preview is 1080 pixels wide; the exported artwork is 2160 pixels.
  }, [card]);

  const download = useCallback((data: PassDesign) => {
    const canvas = document.createElement("canvas");
    renderPass(canvas, data, 2);
    const anchor = document.createElement("a");
    anchor.download = `Yarden-Yard-Pass-${data.id}.png`;
    anchor.href = canvas.toDataURL("image/png");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, []);

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (existing) { download(card); return; }
    if (serviceStatus === "unavailable") {
      setStatus("error");
      setMessage("Membership is currently unavailable. Ask the site administrator to check /api/health.");
      return;
    }
    if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || !gender) {
      setStatus("error");
      setMessage("Enter your name and email, then select a pass style.");
      return;
    }
    setStatus("saving");
    setMessage("Saving your membership securely…");
    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), gender }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok || !response.pass) throw new Error(response.error || "Could not register your Yard Pass");
      const saved = response.pass;
      setExisting(true);
      setName(saved.name);
      setEmail(saved.email);
      setPhone(saved.phone || "");
      setGender(saved.gender);
      setPassId(saved.id);
      setYearJoined(saved.yearJoined);
      setStatus("done");
      setMessage(response.existing ? "Your existing membership was recovered." : "Welcome to The Yard. Your pass is ready to download.");
      download({ name: saved.name, title: saved.title, status: saved.status, id: saved.id, year: saved.yearJoined, issued: true });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not register. Please try again.");
    }
  };

  return (
    <div className="yp12" id="yard-pass-generator">
      <div className="yp12__art">
        <div className="yp12__card-shell">
          <canvas ref={canvasRef} className="yp12__canvas" aria-label="Preview of your ANGEL-era Yard Pass card" />
          <div className="yp12__card-sheen" aria-hidden="true" />
        </div>
        <p className="yp12__caption"><span>✳</span> 1080P LIVE PREVIEW <span>/</span> 2K PNG EXPORT <span>/</span> PRIVATE DETAILS</p>
        <div className="yp12__card-caption">
          <span>ONE PASS. ONE PLACE IN THE YARD.</span>
          <span>COLLECTOR SERIES / 001</span>
        </div>
      </div>
      <form className="yp12__form" onSubmit={generate}>
        <div className="yp12__overline">THE YARD <span>—</span> ANGEL COLLECTION</div>
        <h3>Something to <em>belong to.</em></h3>
        <p className="yp12__intro">Your own piece of Yarden's world. A digital membership card, beautifully yours. No photos required.</p>
        <label className="yp12__field">FULL NAME
          <input type="text" placeholder="How should your name appear?" value={name} onChange={event => setName(event.target.value)} maxLength={90} autoComplete="name" required disabled={existing || status === "saving"} />
        </label>
        <label className="yp12__field">EMAIL ADDRESS
          <input type="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} autoComplete="email" required disabled={existing || status === "saving"} />
        </label>
        <label className="yp12__field">PHONE <span>(OPTIONAL)</span>
          <input type="tel" placeholder="+234…" value={phone} onChange={event => setPhone(event.target.value)} maxLength={32} autoComplete="tel" disabled={existing || status === "saving"} />
        </label>
        <div className="yp12__choice-label">CHOOSE YOUR CARD STYLE</div>
        <div className="yp12__styles" role="group" aria-label="Yard Pass card style">
          <button type="button" className={gender === "female" ? "is-selected" : ""} onClick={() => setGender("female")} disabled={existing || status === "saving"}><span>✧</span> ANGEL</button>
          <button type="button" className={gender === "male" ? "is-selected" : ""} onClick={() => setGender("male")} disabled={existing || status === "saving"}><span>✳</span> DESCENDANT</button>
        </div>
        <button className="yp12__submit" type="submit" disabled={status === "saving" || serviceStatus === "unavailable"}>
          {status === "saving" ? "CREATING MEMBERSHIP…" : existing ? "DOWNLOAD YOUR PASS" : "CREATE YOUR YARD PASS"}<span aria-hidden="true">↗</span>
        </button>
        {message && <p role="status" className={`yp12__message ${status === "error" ? "is-error" : ""}`}>{message}</p>}
        <p className="yp12__privacy">Membership details are kept for your pass; the image is generated on your device. This is not a concert ticket, and signing up does not subscribe you to marketing emails.</p>
      </form>
    </div>
  );
}
