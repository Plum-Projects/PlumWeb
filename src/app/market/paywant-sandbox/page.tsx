"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

function PaywantSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshData } = useApp();

  const orderId = searchParams.get("orderId") || "PW-TEST";
  const rawExtra = searchParams.get("extraData");

  let parsed: {
    userId: string;
    username: string;
    coins: number;
    amount: number;
    packageId: string;
  } = {
    userId: "user-1",
    username: "Oyuncu",
    coins: 500,
    amount: 40,
    packageId: "pkg-3",
  };

  if (rawExtra) {
    try {
      parsed = JSON.parse(rawExtra);
    } catch {
      // ignore
    }
  }

  const [method, setMethod] = useState<"card" | "mobile" | "bank">("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/paywant/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SiparisID: orderId,
          ExtraData: JSON.stringify(parsed),
          UserIP: "127.0.0.1",
          Status: "100", // Success
          OdemeKanali: method === "card" ? "1" : method === "mobile" ? "2" : "3",
          Hash: "test_mode_bypass",
        }),
      });

      if (res.ok) {
        setSuccess(true);
        refreshData();
        setTimeout(() => {
          router.push(`/market?payment=success&coins=${parsed.coins}`);
        }, 1800);
      } else {
        alert("Ödeme simülasyonu başarısız oldu.");
      }
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-panel rounded-3xl p-7 md:p-9 border border-purple-500/30 shadow-2xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Lock size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              Paywant <span className="text-purple-300 font-bold text-xs uppercase tracking-wider bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">Güvenli Ödeme</span>
            </h1>
            <p className="text-[11px] text-purple-300/60">Güvenli Ödeme Ekranı</p>
          </div>
        </div>
        <span className="text-xs font-mono text-purple-300/50">{orderId}</span>
      </div>

      {success ? (
        <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white">Ödeme Onaylandı!</h2>
          <p className="text-xs text-purple-200/80 max-w-sm mx-auto">
            <strong className="text-emerald-300">+{parsed.coins} Kredi</strong> hesabınıza tanımlandı. Yönlendiriliyorsunuz...
          </p>
        </div>
      ) : (
        <>
          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-300/70">Satın Alınan Kredi</p>
              <p className="text-xl font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <span>🍇 {parsed.coins.toLocaleString()} Kredi</span>
              </p>
              <p className="text-[11px] text-purple-400">Oyuncu: {parsed.username}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-300/70">Ödenecek Tutar</p>
              <p className="text-2xl font-black text-amber-400">{parsed.amount} ₺</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-purple-200 mb-2">
              Ödeme Yöntemi Seçiniz
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  method === "card"
                    ? "bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-600/20"
                    : "bg-white/[0.02] border-purple-500/20 text-purple-300 hover:bg-white/[0.05]"
                }`}
              >
                <CreditCard size={20} className="mx-auto mb-1.5 text-purple-300" />
                <span className="text-[11px] font-bold block">Kredi / Banka Kartı</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("mobile")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  method === "mobile"
                    ? "bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-600/20"
                    : "bg-white/[0.02] border-purple-500/20 text-purple-300 hover:bg-white/[0.05]"
                }`}
              >
                <Smartphone size={20} className="mx-auto mb-1.5 text-purple-300" />
                <span className="text-[11px] font-bold block">Mobil Ödeme</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  method === "bank"
                    ? "bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-600/20"
                    : "bg-white/[0.02] border-purple-500/20 text-purple-300 hover:bg-white/[0.05]"
                }`}
              >
                <Building size={20} className="mx-auto mb-1.5 text-purple-300" />
                <span className="text-[11px] font-bold block">Havale / EFT</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSimulatePayment}
              disabled={loading}
              className="gradient-btn w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Ödeme İşleniyor..." : `Paywant ile ${parsed.amount} ₺ Öde`}
            </button>

            <button
              onClick={() => router.push("/market")}
              className="w-full py-2.5 rounded-xl text-purple-300/70 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} /> İptal Et ve Markete Dön
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaywantSandboxPage() {
  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Background ambient orbs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <Suspense fallback={<div className="text-purple-300 text-xs">Yükleniyor...</div>}>
        <PaywantSandboxContent />
      </Suspense>
    </div>
  );
}
