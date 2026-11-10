"use client";

import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const { register } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Lütfen tüm alanları doldurunuz.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Girdiğiniz şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (!kvkkAccepted) {
      setError("Lütfen KVKK Aydınlatma Metni ve Kullanıcı Sözleşmesini onaylayınız.");
      return;
    }

    setLoading(true);
    try {
      const success = await register(username.trim(), email.trim(), password);
      if (success) {
        router.push("/");
      } else {
        setError("Bu kullanıcı adı veya e-posta zaten kayıtlı.");
      }
    } catch {
      setError("Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="glass-panel rounded-xl p-6 sm:p-8 w-full max-w-sm border border-white/[0.08] relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
            <img
              src="/plumya-logo.svg"
              alt="Plumya Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Hesap Oluştur
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Plumya sunucu ağına ücretsiz katılın</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3.5 py-2.5 mb-5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Minecraft Kullanıcı Adı
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Örn: SteveCraft"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              E-Posta Adresi
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Şifre Tekrarı
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          {/* KVKK Checkbox */}
          <div className="pt-1.5">
            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-zinc-400 select-none">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-white/[0.2] bg-black/40 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer shrink-0"
                required
              />
              <span className="leading-tight">
                <Link
                  href="/kvkk"
                  target="_blank"
                  className="text-purple-400 hover:underline"
                >
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni ve{" "}
                <Link
                  href="/kvkk"
                  target="_blank"
                  className="text-purple-400 hover:underline"
                >
                  Kullanıcı Sözleşmesi
                </Link>
                &apos;ni okudum, kabul ediyorum.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full py-2.5 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
          >
            <UserPlus size={14} />
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
