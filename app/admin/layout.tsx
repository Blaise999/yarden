import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Yard Pass Management",
  robots: { index: false, follow: false, noarchive: true },
  description: "Admin dashboard for managing Yard Passes",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
