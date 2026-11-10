"use client";

import { useApp } from "@/contexts/AppContext";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Coins,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Crown,
} from "lucide-react";
import Link from "next/link";
import type { CoinPackage } from "@/lib/types";

function MarketContent() {
  const { coinPackages, currentUser, refreshData } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSuccess = searchParams.get("payment") === "success";
  const creditedCoins = searchParams.get("coins");

  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePurchase = async (pkg: CoinPackage) => {
    setErrorMessage("");

    if (!currentUser) {
      router.push(`/login?callbackUrl=/market`);
      return;
    }

    setLoadingPkgId(pkg.id);
    try {
      const res = await fetch("/api/payment/paywant/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setErrorMessage(data.error || "Ödeme oluşturulamadı.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Ödeme sistemine bağlanılırken bir hata oluştu.");
    } finally {
      setLoadingPkgId(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-8 p-5 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/20 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Ödemeniz Başarıyla Onaylandı
            </h3>
            <p className="text-xs text-zinc-300 max-w-md mx-auto mb-3">
              Kredi bakiyeniz hesabınıza aktarıldı.
            </p>
            <button
              onClick={() => {
                refreshData();
                router.push("/market");
              }}
              className="gradient-btn px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            >
              Tamam
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-400 hover:text-white"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Plumya Mağazası
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Kredi yükleyerek oyun içi avantajlara, rütbelere ve kozmetik paketlere anında erişim sağlayın.
          </p>

          {/* User Credits Status Pill */}
          {currentUser ? (
            <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
              <span className="text-zinc-400">Mevcut Bakiyeniz:</span>
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                <Coins size={13} />
                {currentUser.credits.toLocaleString()} Kredi
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Kredi yüklemek için önce{" "}
              <Link href="/login?callbackUrl=/market" className="text-purple-400 hover:underline">
                giriş yapmalısınız
              </Link>
              .
            </p>
          )}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {coinPackages.length === 0 && (
            <div className="col-span-full py-16 text-center glass-panel rounded-xl">
              <Coins className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
              <p className="text-zinc-300 font-medium">Henüz satışta olan bir paket bulunmuyor.</p>
              <p className="text-xs text-zinc-500 mt-1">Daha sonra tekrar kontrol edebilirsiniz.</p>
            </div>
          )}
          {coinPackages.map((pkg) => {
            const isLoading = loadingPkgId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`glass-panel rounded-xl p-5 sm:p-6 flex flex-col justify-between relative transition-all ${
                  pkg.popular ? "border-purple-500/40 bg-purple-950/15" : "hover:border-white/[0.12]"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Önerilen
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400">
                      <Coins size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-zinc-300">
                          {pkg.coins.toLocaleString()} Kredi
                        </span>
                        {pkg.bonus && pkg.bonus > 0 && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            +{pkg.bonus} Bonus
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="my-5 p-3.5 rounded-lg bg-black/40 border border-white/[0.06] text-center">
                    <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                      ₺{pkg.price}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">/ tek seferlik</span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pkg.popular ? "gradient-btn" : "btn-secondary"
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <span>İşlem yapılıyor...</span>
                  ) : (
                    <>
                      <span>Hemen Yükle</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security / Payment Assurance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-white/[0.08] text-xs text-zinc-400">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="font-medium text-white">Güvenli Ödeme</p>
              <p className="text-[11px] text-zinc-400">Paywant 3D Secure ve SSL korumalı altyapı.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <CreditCard size={18} className="text-purple-400 shrink-0" />
            <div>
              <p className="font-medium text-white">Çeşitli Ödeme Yöntemleri</p>
              <p className="text-[11px] text-zinc-400">Kredi kartı, banka kartı ve mobil ödeme desteği.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <Crown size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-medium text-white">Anında Teslimat</p>
              <p className="text-[11px] text-zinc-400">Ödemeniz onaylandığı anda krediniz hesabınıza yüklenir.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xs text-zinc-400 font-mono">Yükleniyor...</div>
        </div>
      }
    >
      <MarketContent />
    </Suspense>
  );
}
