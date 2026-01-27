import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Yard Pass Management",
  description: "Admin dashboard for managing Yard Passes",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
