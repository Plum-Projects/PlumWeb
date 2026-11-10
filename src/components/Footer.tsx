"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const quickLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/market", label: "Market" },
  { href: "/support", label: "Destek" },
  { href: "/about", label: "Hakkımızda" },
];

export default function Footer() {
  const { settings } = useApp();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const ip = settings.serverIp || settings.serverIP || "play.plumya.net";
  const siteName = settings.siteName || "Plumya Network";
  const invite = settings.discordInviteUrl || "https://discord.gg";

  const copy = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const head = "font-display text-xl font-semibold mb-4";
  const link = "text-[var(--muted)] hover:text-[var(--ink)] transition-colors";

  if (pathname === "/yonetim-plumya") return null;

  return (
    <footer className="bg-[var(--surface)] overflow-hidden">
      <div className="wrap pt-12 grid gap-8 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <div>
          <h2 className={head}>{siteName}</h2>
          <p className="text-[var(--muted)] leading-relaxed max-w-sm">
            Java &amp; Bedrock destekli Minecraft topluluk sunucusu. Emek veren oyuncunun karşılığını alması için dengeli
            ekonomi, hilesiz oyun ve ilgili bir yetkili ekibi.
          </p>
        </div>

        <div>
          <h2 className={head}>Hızlı menü</h2>
          <ul className="space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={head}>Topluluk</h2>
          <ul className="space-y-2.5">
            <li>
              <a href={invite} target="_blank" rel="noreferrer" className={link}>
                Discord
              </a>
            </li>
            <li>
              <button onClick={copy} className={`${link} flex items-center gap-2 cursor-pointer`}>
                {ip}
                {copied ? <Check size={14} className="text-[var(--grass)]" /> : <Copy size={14} />}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={head}>Bağlantılar</h2>
          <ul className="space-y-2.5">
            <li>
              <Link href="/kvkk" className={link}>
                KVKK &amp; Sözleşme
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[var(--muted)]">
        <p>© 2026 {siteName}. Tüm hakları saklıdır.</p>
        <p>Mojang AB veya Microsoft ile resmi bir bağlantısı yoktur.</p>
      </div>

      <p
        aria-hidden="true"
        className="font-display text-center font-semibold leading-none text-[var(--surface-3)] select-none mt-6 pb-4"
        style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
      >
        plumya
      </p>
    </footer>
  );
}
