import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "The Yard — Yarden",
  description: "Generate your Yard Pass and get exclusive updates.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="siteHeader">
          <Header />
        </div>

        <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-10">{children}</main>
      </body>
    </html>
  );
}
