import { createHash, randomBytes } from "node:crypto";
import { readRecord, createRecord, readSet, addToSet, removeFromSet, saveRecord } from "./persistence";
export type Subscriber = { email: string; createdAt: string; consent: boolean; source: "website"; unsubscribedAt?: string };
const index = "yarden:newsletter:emails";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
function key(email: string) { return `yarden:newsletter:email:${hash(email)}`; }
function tokenKey(token: string) { return `yarden:newsletter:unsub:${hash(token)}`; }
export async function subscribe(email: string): Promise<boolean> {
  const existing = await readRecord<Subscriber>(key(email));
  if (existing?.consent) return false;
  const item: Subscriber = { email, createdAt: new Date().toISOString(), consent: true, source: "website" };
  if (existing) await saveRecord(key(email), item);
  else await createRecord(key(email), item);
  await addToSet(index, email);
  return true;
}
export async function subscribers(): Promise<Subscriber[]> {
  const emails = await readSet(index);
  const result = await Promise.all(emails.map(email => readRecord<Subscriber>(key(email))));
  return result.filter((s): s is Subscriber => Boolean(s && s.consent)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}
export async function newUnsubscribeToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await saveRecord(tokenKey(token), email);
  return token;
}
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const email = await readRecord<string>(tokenKey(token));
  if (!email) return false;
  const record = await readRecord<Subscriber>(key(email));
  if (record?.consent) {
    await saveRecord(key(email), { ...record, consent: false, unsubscribedAt: new Date().toISOString() });
    await removeFromSet(index, email);
  }
  return true;
}
