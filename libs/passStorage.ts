import type { YardPass } from "./passTypes";
import { readRecord, createRecord, addToSet, readSet, hasPersistentStore } from "./persistence";
import { randomBytes } from "node:crypto";
const key = (anonId: string) => `pass:${anonId}`;
const index = "passes:anon_ids"; // keep old live index compatible
export function isStorageConfigured() { return hasPersistentStore(); }
export async function getPassByAnonId(anonId: string): Promise<YardPass | null> {
  if (!/^[a-f0-9]{48}$/.test(anonId)) return null;
  return await readRecord<YardPass>(key(anonId));
}
/** Never overwrite an existing pass. Cookie-bound identity is immutable. */
export async function savePass(pass: YardPass): Promise<{ pass: YardPass; created: boolean }> {
  const created = await createRecord(key(pass.anonId), pass);
  await addToSet(index, pass.anonId);
  return { pass: created ? pass : (await getPassByAnonId(pass.anonId))!, created };
}
export async function getAllPasses(): Promise<YardPass[]> {
  const ids = await readSet(index);
  const passes = await Promise.all(ids.map(getPassByAnonId));
  return passes.filter((p): p is YardPass => !!p).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function generatePassId() {
  return `YARD-${String(new Date().getFullYear()).slice(-2)}-${randomBytes(8).toString("hex").toUpperCase()}`;
}
