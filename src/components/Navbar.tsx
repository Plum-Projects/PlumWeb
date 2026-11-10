"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, Coins, LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import Logo from "./Logo";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/market", label: "Market" },
  { href: "/support", label: "Destek" },
  { href: "/about", label: "Hakkımızda" },
];

export default function Navbar() {
  const { currentUser, logout, settings } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  if (pathname === "/yonetim-plumya") return null;

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]">
      <nav className="wrap flex items-center justify-between h-[68px] gap-6" aria-label="Ana menü">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Plumya ana sayfa">
          <Logo size={32} />
          <span className="font-display text-2xl font-semibold truncate max-w-[120px] lg:max-w-[220px]">{settings.siteName && settings.siteName !== "Plumya Network" ? settings.siteName : "Plumya"}</span>
        </Link>

        <ul className="hidden md:flex items-stretch h-full">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center px-5 text-[15px] font-semibold transition-colors ${
                    active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}
                  {active && <span className="absolute left-5 right-5 bottom-0 h-[3px] bg-[var(--accent)]" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Link href="/market" className="hidden sm:flex items-center gap-1.5 px-3 h-10 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors text-sm font-bold">
                <Coins size={15} className="text-[var(--lantern)]" />
                <span className="tabular-nums">{currentUser.credits.toLocaleString("tr-TR")}</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 px-2 h-10 hover:bg-[var(--surface-2)] transition-colors">
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(currentUser.username)}/64`}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 bg-[var(--surface-3)]"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="hidden sm:block text-sm font-bold max-w-[110px] truncate">{currentUser.username}</span>
              </Link>
              {currentUser.role === "admin" && (
                <Link href="/yonetim-plumya" className="btn-accent h-10 px-3.5 flex items-center gap-1.5 text-sm">
                  <Shield size={15} />
                  <span className="hidden sm:inline">Yönetim</span>
                </Link>
              )}
              <button
                onClick={logout}
                title="Çıkış yap"
                aria-label="Çıkış yap"
                className="w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-soft h-10 px-4 hidden sm:flex items-center text-sm">
                Giriş yap
              </Link>
              <Link href="/register" className="btn-accent h-10 px-4 flex items-center text-sm">
                Kayıt ol
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
            aria-label="Menüyü aç/kapat"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="md:hidden bg-[var(--surface)] px-5 py-2">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block py-3.5 text-lg font-semibold ${isActive(href) ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}
              >
                {label}
              </Link>
            </li>
          ))}
          {!currentUser && (
            <li>
              <Link href="/login" onClick={() => setOpen(false)} className="block py-3.5 text-lg font-semibold text-[var(--muted)]">
                Giriş yap
              </Link>
            </li>
          )}
        </ul>
      )}
    </header>
  );
}
