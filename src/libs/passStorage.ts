import fs from "fs";
import path from "path";
import type { YardPass } from "./passTypes";

const DATA_DIR = path.join(process.cwd(), "data");
const PASSES_FILE = path.join(DATA_DIR, "passes.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readPasses(): YardPass[] {
  ensureDataDir();
  if (!fs.existsSync(PASSES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(PASSES_FILE, "utf-8");
    return JSON.parse(raw) as YardPass[];
  } catch {
    return [];
  }
}

function writePasses(passes: YardPass[]) {
  ensureDataDir();
  fs.writeFileSync(PASSES_FILE, JSON.stringify(passes, null, 2), "utf-8");
}

export function getPassByAnonId(anonId: string): YardPass | null {
  const passes = readPasses();
  return passes.find((p) => p.anonId === anonId) || null;
}

export function savePass(pass: YardPass): YardPass {
  const passes = readPasses();
  const existingIndex = passes.findIndex((p) => p.anonId === pass.anonId);
  
  if (existingIndex >= 0) {
    passes[existingIndex] = pass;
  } else {
    passes.push(pass);
  }
  
  writePasses(passes);
  return pass;
}

export function getAllPasses(): YardPass[] {
  return readPasses();
}

export function generatePassId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const bytes = new Uint8Array(6);
  
  // Use crypto for random bytes
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for Node.js
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  
  return `YARD-${year}-${hex}`;
}
