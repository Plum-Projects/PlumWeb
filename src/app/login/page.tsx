"use client";

import { useApp } from "@/contexts/AppContext";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, User, Lock } from "lucide-react";

function LoginForm() {
  const { login } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Lütfen kullanıcı adı ve şifrenizi giriniz.");
      return;
    }

    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (username.toLowerCase() === "plumyaadmin") {
          router.push("/yonetim-plumya");
        } else {
          router.push("/");
        }
      } else {
        setError("Kullanıcı adı veya şifre hatalı. Kayıtlı değilseniz önce kayıt olun.");
      }
    } catch {
      setError("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Hesaba Giriş Yap
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Plumya sunucu hesabınıza bağlanın</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3.5 py-2.5 mb-5 text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Minecraft Kullanıcı Adı
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-btn w-full py-2.5 rounded-lg text-white font-medium text-xs flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          <LogIn size={14} />
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-400 mt-5">
        Hesabınız yok mu?{" "}
        <Link
          href="/register"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-zinc-400 text-xs font-mono">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
