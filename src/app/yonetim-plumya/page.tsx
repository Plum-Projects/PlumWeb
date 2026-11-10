"use client";

import { useApp } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import {
  Settings,
  LayoutDashboard,
  ArrowUpRight,
  Users,
  Newspaper,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Plus,
  Save,
  Send,
  Lock,
  Sparkles,
  Server,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";
import AdminPackages from "@/components/AdminPackages";

type Tab = "overview" | "packages" | "settings" | "users" | "news" | "tickets";

export default function SecureAdminPage() {
  const {
    currentUser,
    settings,
    news,
    tickets,
    coinPackages,
    loading,
    updateSettings,
    deleteUser,
    updateUser,
    addNews,
    deleteNews,
    addTicketReply,
    updateTicketStatus,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState("");

  const loadUsers = async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/users", { signal });
    if (!response.ok) throw new Error("Kullanıcılar yüklenemedi.");
    setUsers((await response.json()).users);
    setUsersError("");
  };

  const isAdmin = currentUser?.role === "admin";
  useEffect(() => {
    if (!isAdmin || activeTab !== "users") return;
    const request = new AbortController();
    loadUsers(request.signal).catch(() => {
      if (!request.signal.aborted) setUsersError("Kullanıcılar yüklenemedi.");
    });
    return () => request.abort();
  }, [activeTab, isAdmin]);

  // Settings state
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [serverIP, setServerIP] = useState(settings.serverIp || settings.serverIP || "play.plumya.net");
  const [onlinePlayers, setOnlinePlayers] = useState(settings.onlinePlayers);
  const [maxPlayers, setMaxPlayers] = useState(settings.maxPlayers);
  const [showRecentRegistrations, setShowRecentRegistrations] = useState(settings.showRecentRegistrations);
  const [showRecentCredits, setShowRecentCredits] = useState(settings.showRecentCredits);
  const [discordServerId, setDiscordServerId] = useState(settings.discordServerId || "");
  const [discordInviteUrl, setDiscordInviteUrl] = useState(settings.discordInviteUrl || "");
  const [siteName, setSiteName] = useState("Plumya Network");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [panelOpacity, setPanelOpacity] = useState(65);
  const [showNews, setShowNews] = useState(true);
  const [serverPort, setServerPort] = useState("25565");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with current settings when loaded
  useEffect(() => {
    setSiteName(settings.siteName || "Plumya Network");
    setBackgroundImage(settings.backgroundImage || "");
    setPanelOpacity(settings.panelOpacity ?? 65);
    setShowNews(settings.showNews !== false);
    setServerPort(settings.serverPort || "25565");
    setAnnouncement(settings.announcement);
    setServerIP(settings.serverIp || settings.serverIP || "play.plumya.net");
    setOnlinePlayers(settings.onlinePlayers);
    setMaxPlayers(settings.maxPlayers);
    setShowRecentRegistrations(settings.showRecentRegistrations);
    setShowRecentCredits(settings.showRecentCredits);
    setDiscordServerId(settings.discordServerId || "");
    setDiscordInviteUrl(settings.discordInviteUrl || "");
  }, [settings]);

  // News state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");

  // Ticket reply
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  if (loading) return <p className="wrap py-12" role="status">Yönetim paneli yükleniyor…</p>;

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="glass-panel rounded-3xl p-8 md:p-10 text-center max-w-md w-full border border-red-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Yetkisiz Erişim
          </h2>
          <p className="text-xs text-purple-300/70 mb-6 leading-relaxed">
            Bu güvenli yönetim alanına yalnızca doğrulanmış Plumya yöneticileri erişebilir.
          </p>
          <Link
            href="/login"
            className="gradient-btn inline-block text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-purple-600/30"
          >
            Yönetici Girişi Yap
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
    { id: "settings", label: "Site Ayarları", icon: Settings },
    { id: "packages", label: "Mağaza", icon: Sparkles },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "news", label: "Haberler", icon: Newspaper },
    { id: "tickets", label: "Destek Talepleri", icon: MessageSquare },
  ];

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    setSettingsError("");
    setSettingsSaved(false);
    try {
      await updateSettings({
        siteName, backgroundImage, panelOpacity, showNews, serverPort,
        announcement,
        serverIp: serverIP,
        serverIP,
        onlinePlayers: Number(onlinePlayers),
        maxPlayers: Number(maxPlayers),
        showRecentRegistrations,
        showRecentCredits,
        discordServerId,
        discordInviteUrl,
      });

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      setSettingsError(e instanceof Error ? e.message : "Ayarlar kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const runAdminAction = async (action: () => void | Promise<void>) => {
    try {
      await action();
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
      return false;
    }
  };

  const handleAddNews = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;
    const date = new Date().toISOString();
    const saved = await runAdminAction(() => addNews({
      title: newsTitle.trim(), content: newsContent.trim(), author: currentUser.username, date, createdAt: date,
    }));
    if (saved) {
      setNewsTitle("");
      setNewsContent("");
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm("Bu haberi kalıcı olarak silmek istediğinizden emin misiniz?")) {
      await runAdminAction(() => deleteNews(id));
    }
  };

  const handleTicketReply = async (id: string) => {
    const text = replyTexts[id]?.trim();
    if (text && await runAdminAction(() => addTicketReply(id, text))) {
      setReplyTexts((previous) => ({ ...previous, [id]: "" }));
    }
  };

  const handleStatusChange = (id: string, status: string) => runAdminAction(() => updateTicketStatus(id, status));
  const handleUserRoleChange = (id: string, role: string) => runAdminAction(async () => { await updateUser(id, { role: role === "admin" || role === "moderator" ? role : "user" }); await loadUsers(); });
  const handleUserCreditsChange = (id: string, credits: number) => runAdminAction(async () => { await updateUser(id, { credits }); await loadUsers(); });
  const handleDeleteUser = async (id: string) => {
    if (id !== currentUser.id && confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz? Tüm verileri silinecektir.")) {
      await runAdminAction(async () => { await deleteUser(id); await loadUsers(); });
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      answered: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      closed: "bg-red-500/15 text-red-300 border-red-500/30",
    };
    const labels: Record<string, string> = {
      open: "Açık",
      answered: "Yanıtlandı",
      closed: "Kapatıldı",
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;
  const overview = [
    { tab: "tickets", label: "Açık destek talebi", value: tickets.filter((ticket) => ticket.status === "open").length },
    { tab: "news", label: "Son haberler", value: news.length },
    { tab: "packages", label: "Aktif mağaza paketi", value: coinPackages.length },
  ] as const;

  return (
    <div className="min-h-dvh bg-[var(--bg)] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="bg-[var(--surface)] border-b lg:border-b-0 lg:border-r border-white/10 lg:sticky lg:top-0 lg:h-dvh flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 lg:py-7">
          <ShieldCheck size={22} className="shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <p className="truncate font-display text-xl text-[var(--blossom)]">{settings.siteName || "Plumya Network"}</p>
            <p className="text-xs text-[var(--muted)]">Yönetim merkezi</p>
          </div>
          <Link href="/" className="ml-auto lg:hidden p-2" aria-label="Siteye dön"><ArrowUpRight size={18} /></Link>
        </div>
        <nav aria-label="Yönetim menüsü" className="flex overflow-x-auto lg:flex-col lg:overflow-visible gap-1 px-3 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-3 px-3 py-3 text-left text-sm font-semibold cursor-pointer border-l-2 ${activeTab === id ? "border-[var(--accent)] bg-[var(--surface-2)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"}`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <div className="hidden lg:block mt-auto border-t border-white/10 p-5">
          <p className="truncate text-sm font-bold">{currentUser.username}</p>
          <p className="text-xs text-[var(--muted)]">Yönetici</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline">Siteye dön <ArrowUpRight size={15} /></Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">Yönetim <span aria-hidden="true" className="mx-2">/</span> <strong className="text-[var(--ink)]">{activeLabel}</strong></p>
          <button type="button" onClick={() => { void refreshData(); if (activeTab === "users") void runAdminAction(loadUsers); }} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-sm hover:bg-[var(--surface-2)] cursor-pointer">
            <RefreshCw size={14} aria-hidden="true" /> Yenile
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <h1 className="mb-6 text-3xl sm:text-4xl text-[var(--blossom)]">{activeLabel}</h1>
          {activeTab === "overview" && (
            <>
              <p className="mb-6 text-[var(--muted)]">Hoş geldin, {currentUser.username}. Buradan sunucunun içeriğini ve oyuncu işlemlerini yönetebilirsin.</p>
              <dl className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
                {overview.map(({ tab, label, value }) => (
                  <div key={tab} className="bg-[var(--surface)] p-5">
                    <dt className="text-sm text-[var(--muted)]">{label}</dt>
                    <dd className="my-2 text-3xl font-semibold tabular-nums text-[var(--accent)]">{value}</dd>
                    <button type="button" onClick={() => setActiveTab(tab)} className="text-sm text-[var(--accent)] hover:underline cursor-pointer">Bölümü aç</button>
                  </div>
                ))}
              </dl>
              <section className="mt-8 border-t border-white/10 pt-5">
                <h2 className="text-xl mb-3 text-[var(--blossom)]">Sunucu bağlantısı</h2>
                <p className="text-[var(--muted)] break-all">{settings.serverIp}:{settings.serverPort} · {settings.maxPlayers} oyuncu kapasitesi</p>
                <button type="button" onClick={() => setActiveTab("settings")} className="mt-3 text-sm text-[var(--accent)] hover:underline cursor-pointer">Site ayarlarını aç</button>
              </section>
            </>
          )}

        {/* ── TAB 1: GENEL AYARLAR ────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="glass-panel rounded-3xl p-5 md:p-8 border border-purple-500/25">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/15">
              <div>
                <h2 className="text-lg font-bold text-white">Sunucu & Site Ayarları</h2>
                <p className="text-xs text-purple-300/60">Ana sayfadaki canlı alanları yönetin</p>
              </div>
              <Server className="text-purple-400" size={20} />
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Site başlığı
                  <input className="bg-black/40 border border-white/20 p-2" value={siteName} maxLength={80} onChange={(event) => setSiteName(event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm">
                  Arka plan görseli (HTTPS adresi)
                  <input className="bg-black/40 border border-white/20 p-2" value={backgroundImage} onChange={(event) => setBackgroundImage(event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm">
                  Panel opaklığı (%{panelOpacity})
                  <input type="range" min="0" max="100" value={panelOpacity} onChange={(event) => setPanelOpacity(Number(event.target.value))} />
                </label>
                <label className="grid gap-2 text-sm">
                  Sunucu portu
                  <input className="bg-black/40 border border-white/20 p-2" inputMode="numeric" value={serverPort} maxLength={5} onChange={(event) => setServerPort(event.target.value)} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showNews} onChange={(event) => setShowNews(event.target.checked)} />
                  Ana sayfada haberleri göster
                </label>
              </div>
              {/* Announcement */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Duyuru Bandı Metni (Boş bırakılırsa gizlenir)
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                  placeholder="Örn: Hafta sonuna özel %25 Kredi Bonusu başladı!"
                />
              </div>

              {/* Server IP */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Sunucu IP Adresi
                </label>
                <input
                  type="text"
                  value={serverIP}
                  onChange={(e) => setServerIP(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>

              {/* Discord Entegrasyonu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Discord Sunucu Kimliği (Server ID)
                  </label>
                  <input
                    type="text"
                    value={discordServerId}
                    onChange={(e) => setDiscordServerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                    placeholder="Örn: 1097230283084111882"
                  />
                  <p className="text-[10px] text-purple-300/50 mt-1">
                    Discord Sunucu Ayarları → Bileşen (Widget) bölümünden Sunucu Kimliğini kopyalayın.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Discord Davet Linki
                  </label>
                  <input
                    type="text"
                    value={discordInviteUrl}
                    onChange={(e) => setDiscordInviteUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                    placeholder="https://discord.gg/..."
                  />
                  <p className="text-[10px] text-purple-300/50 mt-1">
                    Kullanıcıların tek tıkla katılabileceği kalıcı davet linki.
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-purple-500/15 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-purple-500/15 cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <span className="text-xs font-semibold text-purple-200">
                    Ana sayfada &ldquo;Son Kayıt Olanlar&rdquo; bloğunu göster
                  </span>
                  <input
                    type="checkbox"
                    checked={showRecentRegistrations}
                    onChange={(e) => setShowRecentRegistrations(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-purple-500/15 cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <span className="text-xs font-semibold text-purple-200">
                    Ana sayfada &ldquo;Son Kredi Yüklemeleri&rdquo; bloğunu göster
                  </span>
                  <input
                    type="checkbox"
                    checked={showRecentCredits}
                    onChange={(e) => setShowRecentCredits(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSubmitting ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </button>

                {settingsError && <span role="alert" className="text-sm text-[var(--danger)]">{settingsError}</span>}
                {settingsSaved && (
                  <span className="text-xs font-semibold text-emerald-400 animate-in fade-in">
                    ✔ Ayarlar başarıyla güncellendi!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: KULLANICILAR ─────────────────────────────────────────── */}
        {activeTab === "packages" && <AdminPackages />}

        {activeTab === "users" && usersError && <p role="alert">{usersError}</p>}
        {activeTab === "users" && (
          <div className="glass-panel rounded-3xl p-6 border border-purple-500/25">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/15">
              <div>
                <h2 className="text-lg font-bold text-white">Kayıtlı Oyuncu Yönetimi</h2>
                <p className="text-xs text-purple-300/60">Oyuncuların rollerini ve kredilerini düzenleyin</p>
              </div>
              <span className="text-xs text-purple-300 font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/25">
                Toplam {users.length} Oyuncu
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-500/20 text-purple-300/60 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Oyuncu Adı</th>
                    <th className="pb-3 font-semibold">E-Posta</th>
                    <th className="pb-3 font-semibold">Yetki</th>
                    <th className="pb-3 font-semibold">Kredi</th>
                    <th className="pb-3 font-semibold">Kayıt Tarihi</th>
                    <th className="pb-3 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-700 flex items-center justify-center text-[10px] text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        {u.username}
                      </td>
                      <td className="py-3 text-purple-200/80">{u.email}</td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                          className="bg-black/50 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-purple-200 focus:outline-none cursor-pointer"
                        >
                          <option value="user">Oyuncu (Üye)</option>
                          <option value="moderator">Moderatör</option>
                          <option value="admin">Yönetici (Admin)</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          defaultValue={u.credits}
                          onBlur={(e) => handleUserCreditsChange(u.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded-lg bg-black/50 border border-purple-500/30 text-amber-300 font-bold text-xs"
                        />
                      </td>
                      <td className="py-3 text-purple-300/60">
                        {new Date(u.createdAt || u.registeredAt || Date.now()).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 text-right">
                        {u.id !== currentUser.id ? (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Kullanıcıyı Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-400/50 italic">Siz</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: HABERLER ─────────────────────────────────────────────── */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* New Article Form (5 cols) */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-purple-500/25 h-fit">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Plus size={16} className="text-purple-400" />
                Yeni Haber Ekle
              </h2>
              <p className="text-xs text-purple-300/60 mb-5">
                Eklenen haberler ana sayfada anında görünür
              </p>

              <form onSubmit={handleAddNews} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Haber Başlığı
                  </label>
                  <input
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Örn: Yeni SkyBlock Güncellemesi v2.1 Yayında!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Haber İçeriği
                  </label>
                  <textarea
                    rows={5}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Duyurunuzu ve detayları buraya yazınız..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="gradient-btn w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <Plus size={14} />
                  Haberi Yayınla
                </button>
              </form>
            </div>

            {/* Existing News List (7 cols) */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-purple-500/25">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Newspaper size={16} className="text-purple-400" />
                Mevcut Haberler ({news.length})
              </h2>
              <p className="text-xs text-purple-300/60 mb-5">
                Yayınlanmış duyuruları yönetin veya silin
              </p>

              <div className="space-y-3">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15 flex items-start justify-between gap-3 hover:border-purple-400/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-purple-200/70 line-clamp-2 leading-relaxed mb-2">
                        {item.content}
                      </p>
                      <span className="text-[10px] text-purple-300/50">
                        {item.author} • {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
                      title="Haberi Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DESTEK TALEPLERİ ─────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div className="glass-panel rounded-3xl p-6 border border-purple-500/25">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/15">
              <div>
                <h2 className="text-lg font-bold text-white">Tüm Destek Talepleri</h2>
                <p className="text-xs text-purple-300/60">Oyuncuların taleplerini yanıtlayın ve durumlarını güncelleyin</p>
              </div>
              <span className="text-xs text-purple-300 font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/25">
                Toplam {tickets.length} Talep
              </span>
            </div>

            {tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-purple-300/50">
                Şu anda açık bir destek talebi bulunmamaktadır.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-purple-500/15 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/15">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">
                            {ticket.subject}
                          </h3>
                          {statusBadge(ticket.status)}
                        </div>
                        <p className="text-xs text-purple-300/60">
                          Oyuncu: <strong className="text-purple-200">{ticket.username}</strong> • {new Date(ticket.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-1.5">
                        {(["open", "answered", "closed"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(ticket.id, s)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                              ticket.status === s
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white/[0.04] text-purple-300/60 hover:text-white"
                            }`}
                          >
                            {s === "open" ? "Açık" : s === "answered" ? "Yanıtlandı" : "Kapat"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Original message */}
                    <div className="p-3.5 rounded-xl bg-black/40 text-xs text-purple-100 leading-relaxed whitespace-pre-line border border-purple-500/15">
                      {ticket.message}
                    </div>

                    {/* Previous replies */}
                    {ticket.replies.length > 0 && (
                      <div className="space-y-2 pl-3 border-l-2 border-purple-500/30">
                        {ticket.replies.map((reply) => (
                          <div key={reply.id} className="text-xs p-2.5 rounded-lg bg-black/30 border border-purple-500/10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{reply.username}</span>
                              {reply.isAdmin && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300">
                                  Yönetici
                                </span>
                              )}
                              <span className="text-[10px] text-purple-300/50">
                                {new Date(reply.date || reply.createdAt || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-purple-200/90">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Admin Reply box */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Yönetici olarak yanıtınızı yazın..."
                        value={replyTexts[ticket.id] || ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTicketReply(ticket.id);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-purple-500/25 focus:border-purple-400 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-purple-300/30"
                      />
                      <button
                        onClick={() => handleTicketReply(ticket.id)}
                        className="gradient-btn px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                      >
                        <Send size={13} />
                        Cevapla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
