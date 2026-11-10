"use client";

import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import {
  Mail,
  Coins,
  Calendar,
  LogIn,
  Save,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { currentUser, creditLoads, updateUser } = useApp();
  const [email, setEmail] = useState(currentUser?.email || "");
  const [saved, setSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="glass-panel rounded-xl p-8 text-center max-w-sm w-full border border-white/[0.08]">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mx-auto mb-3">
            <LogIn size={20} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Giriş Yapmalısınız
          </h2>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
            Profilinizi ve hesap hareketlerinizi görüntülemek için lütfen giriş yapın.
          </p>
          <Link
            href="/login?callbackUrl=/profile"
            className="gradient-btn inline-block text-white font-medium text-xs rounded-lg px-6 py-2"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const userCredits = creditLoads.filter(
    (c) => c.username === currentUser.username
  );

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    updateUser(currentUser.id, { email: email.trim() });
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-500/15 text-red-300 border-red-500/30",
      moderator: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      user: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    };
    const labels: Record<string, string> = {
      admin: "Yönetici",
      moderator: "Moderatör",
      user: "Oyuncu",
    };
    return (
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${styles[role] || styles.user}`}
      >
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="glass-panel rounded-xl p-6 sm:p-7 border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={`https://mc-heads.net/avatar/${encodeURIComponent(currentUser.username)}/72`}
              alt={currentUser.username}
              className="w-16 h-16 rounded-lg bg-zinc-800 object-cover border border-white/[0.1]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {currentUser.username}
                </h1>
                {roleBadge(currentUser.role)}
              </div>
              <p className="text-xs text-zinc-400 mb-2 truncate">
                {currentUser.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 font-sans">
                  <Calendar size={13} className="text-zinc-500" />
                  Kayıt:{" "}
                  {new Date(currentUser.createdAt || currentUser.registeredAt || Date.now()).toLocaleDateString("tr-TR")}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <Coins size={13} />
                  {currentUser.credits.toLocaleString()} Kredi
                </span>
              </div>
            </div>

            <Link
              href="/market"
              className="gradient-btn px-4 py-2 rounded-lg text-white font-medium text-xs shrink-0"
            >
              + Kredi Yükle
            </Link>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Edit Email */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Mail size={15} className="text-purple-400" />
              Hesap İletişim Bilgileri
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Bildirim ve fatura için geçerli e-posta adresiniz.
            </p>

            <form onSubmit={handleSaveEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                  required
                />
              </div>

              {saved && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                  <CheckCircle size={13} />
                  <span>Bilgileriniz kaydedildi.</span>
                </div>
              )}

              <button
                type="submit"
                className="gradient-btn px-4 py-2 rounded-lg text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                Kaydet
              </button>
            </form>
          </div>

          {/* Load History */}
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Coins size={15} className="text-amber-400" />
              Kredi Yükleme Geçmişi
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Hesabınıza ait geçmiş yüklemeler.
            </p>

            {userCredits.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Henüz kayıtlı bir kredi yüklemeniz bulunmuyor.
              </div>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userCredits.map((credit) => (
                  <li
                    key={credit.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs"
                  >
                    <div>
                      <p className="font-semibold text-emerald-400 font-mono">
                        +{credit.amount} Kredi
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {new Date(credit.date || credit.createdAt || Date.now()).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Onaylandı
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
