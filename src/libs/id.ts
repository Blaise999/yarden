export function generateFanId() {
  const year = String(new Date().getFullYear()).slice(-2);
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `YARD-${year}-${hex}`; // e.g. YARD-25-9F2A1C0B77AA
}
