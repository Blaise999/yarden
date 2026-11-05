export type Gender = "male" | "female";
export interface YardPass {
  id: string;
  anonId: string; // internal, never shared in public API
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  title: "YARDEN'S ANGEL" | "YARDEN'S DESCENDANT";
  status: "Angel Certified" | "Descendant Certified";
  yearJoined: number;
  createdAt: string;
  // Never persist images or raw IP addresses in the member DB.
}
export type PublicPass = Omit<YardPass, "anonId">;
export const publicPass = (p: YardPass): PublicPass => ({
  id: p.id, name: p.name, email: p.email, phone: p.phone, gender: p.gender,
  title: p.title, status: p.status, yearJoined: p.yearJoined, createdAt: p.createdAt,
});
