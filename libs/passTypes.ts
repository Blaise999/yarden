export type Gender = "male" | "female";

export interface YardPass {
  id: string;
  anonId: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  title: "YARDEN'S ANGEL" | "YARDEN'S DESCENDANT";
  status: "Angel Certified" | "Descendant Certified";
  yearJoined: number;
  createdAt: string;
  pngDataUrl: string;
  ip: string;
  userAgent: string;
}

export interface PassFormData {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  photoDataUrl?: string;
}
