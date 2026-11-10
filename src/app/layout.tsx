import { connection } from "next/server";
import { getSiteData } from "@/lib/site-data";
import type { Metadata } from "next";
import { Pixelify_Sans, Figtree } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const display = Pixelify_Sans({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Plumya Network • Minecraft Sunucusu",
  description: "Plumya Minecraft Network — 1.20+ Java & Bedrock destekli emek Survival ve SkyBlock topluluk sunucusu.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const initialData = await getSiteData().catch(() => undefined);
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProvider initialData={initialData}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
