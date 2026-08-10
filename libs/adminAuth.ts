import { cookies } from "next/headers";

export async function isAdmin() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("yard_admin_token")?.value);
}
