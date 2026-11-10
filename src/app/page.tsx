"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Plus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import Announcement from "@/components/Announcement";
import NewsCard from "@/components/NewsCard";
import Supporters from "@/components/Supporters";
import RecentRegistrations from "@/components/RecentRegistrations";
import Reveal from "@/components/Reveal";

const FAQ = (ip: string, port: string) => [
  {
    q: "Sunucuya nasıl katılabilirim?",
    a: `Minecraft'ı 1.20 veya üstü bir sürümde açın, çok oyunculu menüsüne ${ip}${port && port !== "25565" ? ":" + port : ""} adresini ekleyin. Bedrock oyuncuları da aynı adresle bağlanabilir.`,
  },
  {
    q: "Mağaza ürünleri ne zaman teslim edilir?",
    a: "Ödeme onaylandığı anda krediniz hesabınıza yüklenir. Kredilerinizi oyun içindeki mağaza menüsünden dilediğiniz gibi harcayabilirsiniz.",
  },
  {
    q: "Yetkili alımı var mı?",
    a: "Alımlar açıldığında Discord duyurularından ve haber bölümünden haber veriyoruz. Başvurular destek sistemi üzerinden alınır.",
  },
  {
    q: "Destek sistemine nasıl ulaşırım?",
    a: "Hesabınıza giriş yaptıktan sonra Destek sayfasından yeni bir talep oluşturun. Yetkililer yanıtladığında aynı sayfada görürsünüz.",
  },
];

export default function HomePage() {
  const { settings, news, users } = useApp();
  const [copyResult, setCopyResult] = useState<"idle" | "copied" | "failed">("idle");
  const [online, setOnline] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const ip = settings.serverIp || settings.serverIP || "play.plumya.net";
  const address = settings.serverPort && settings.serverPort !== "25565" ? ip + ":" + settings.serverPort : ip;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/mc-status?server=${encodeURIComponent(ip)}`);
        if (!res.ok) return;
        const d = await res.json();
        if (alive && d.online) setOnline(d.playersOnline);
      } catch {
        /* fall back to settings */
      }
    };
    load();
    const t = setInterval(load, 45000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [ip]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyResult("copied");
    } catch {
      setCopyResult("failed");
    }
  };

  useEffect(() => {
    if (copyResult === "idle") return;
    const timeout = setTimeout(() => setCopyResult("idle"), 2500);
    return () => clearTimeout(timeout);
  }, [copyResult]);

  const players = online ?? settings.onlinePlayers ?? 0;
  const [lead, ...rest] = news;
  const restShown = showAll ? rest : rest.slice(0, 2);
  const faq = FAQ(ip, settings.serverPort);
  const siteName = settings.siteName || "Plumya Network";

  return (
    <div>
      <Announcement />

      <section className="plumya-hero">
        <div className="wrap plumya-hero-content">
          <h1 className="font-display">
            {siteName === "Plumya Network" ? (
              <>Plumya <span>Network</span></>
            ) : siteName}
          </h1>
          <div className="plumya-hero-details">
            <button type="button" onClick={copy} className="plumya-panel plumya-copy">
              <span>
                <span className="plumya-server-label" aria-live="polite">
                  {copyResult === "copied" ? "Adres kopyalandı" : copyResult === "failed" ? "Kopyalanamadı" : "Sunucu adresini kopyala"}
                </span>
                <strong>{address}</strong>
              </span>
              {copyResult === "copied" ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <span className="plumya-panel plumya-server-editions">Minecraft 1.20+ · Java ve Bedrock</span>
            <span className="plumya-panel plumya-player-count">
              <strong>{players.toLocaleString("tr-TR")} / {(settings.maxPlayers || 200).toLocaleString("tr-TR")}</strong>
              <span className="plumya-server-label">Oyuncu</span>
            </span>
          </div>
        </div>
      </section>

      {/* ---------- News ---------- */}
      {settings.showNews !== false && <section className="wrap py-12 lg:py-16">
        <Reveal className="flex items-end justify-between gap-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-none">Sunucu haberleri</h2>
          {rest.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer"
            >
              {showAll ? "Daha az göster" : "Tümünü gör"}
            </button>
          )}
        </Reveal>

        {!lead ? (
          <p className="text-[var(--muted)] py-12">Henüz yayınlanmış bir duyuru yok.</p>
        ) : (
          <div className="space-y-3">
            <Reveal>
              <NewsCard news={lead} index={0} variant="feature" />
            </Reveal>
            {restShown.length > 0 && (
              <div className={`grid gap-3 ${restShown.length > 1 ? "md:grid-cols-2" : ""}`}>
                {restShown.map((item, i) => (
                  <Reveal key={item.id} delay={i * 80}>
                    <NewsCard news={item} index={i + 1} variant="compact" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </section>}

      {/* ---------- Ranking ---------- */}
      <div>
      <section className="wrap py-16 lg:py-24">
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-none">Topluluk</h2>
          <p className="mt-4 text-lg text-[var(--muted)]">Oyuncu sıralaması, son bağışlar ve yeni kayıtlar.</p>
        </Reveal>
        <Reveal>
          {settings.showRecentCredits ? (
            <Supporters />
          ) : (
            <p className="text-[var(--muted)]">Bu bölüm şu an gizli.</p>
          )}
        </Reveal>

        {settings.showRecentRegistrations && (
        <Reveal className="mt-12 max-w-3xl lg:ml-16 plumya-panel plumya-reading-panel">
          <h3 className="text-2xl font-extrabold mb-5">
            Yeni gelenler <span className="text-[var(--muted)] font-semibold">· {users.length}</span>
          </h3>
          <RecentRegistrations />
        </Reveal>
        )}
      </section>
      </div>

      {/* ---------- FAQ ---------- */}
      <section className="wrap py-16 lg:py-24 grid lg:grid-cols-[1fr_1.35fr] gap-12">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.02]">Sık sorulan sorular</h2>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-sm">
            Aradığını bulamazsan destek ekibimiz yardımcı olmaktan memnuniyet duyar.
          </p>
          <Link href="/support" className="btn-soft mt-7 h-12 px-6 inline-flex items-center text-sm">
            Destek al
          </Link>
        </Reveal>

        <Reveal delay={80}>
          <ul className="border-t border-white/15">
            {faq.map((f) => (
              <li key={f.q}>
                <details className="plumya-panel group border-b border-white/15 px-4">
                  <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer text-lg font-semibold">
                    {f.q}
                    <Plus size={20} className="shrink-0 text-[var(--accent)] transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="pb-6 text-[var(--muted)] leading-relaxed max-w-xl">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

    </div>
  );
}
