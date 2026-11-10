"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import type { CoinPackage } from "@/lib/types";

type Package = CoinPackage & { active: boolean };
const empty: Package = { id: "", name: "", coins: 0, price: 0, bonus: 0, active: true, popular: false, icon: "Coins" };

async function loadPackages(signal?: AbortSignal): Promise<Package[]> {
  const response = await fetch("/api/admin/packages", { signal });
  if (!response.ok) throw new Error("Paketler yüklenemedi.");
  return (await response.json()).packages;
}

export default function AdminPackages() {
  const { refreshData } = useApp();
  const [packages, setPackages] = useState<Package[]>([]);
  const [draft, setDraft] = useState(empty);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    loadPackages(request.signal).then(setPackages).catch(() => {
      if (!request.signal.aborted) setMessage("Paketler yüklenemedi.");
    });
    return () => request.abort();
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, bonus: draft.bonus ?? 0, popular: Boolean(draft.popular) }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Paket kaydedilemedi.");
      setDraft(empty);
      setMessage("Paket kaydedildi.");
      const [updated] = await Promise.all([loadPackages(), refreshData()]);
      setPackages(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Paket kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel p-6 max-w-3xl">
      <h2 className="text-2xl mb-4">Mağaza paketleri</h2>
      <div className="divide-y divide-white/15">
        {packages.map((item) => (
          <button type="button" key={item.id} onClick={() => { setDraft(item); setMessage(""); }} className="flex w-full justify-between gap-4 py-3 text-left hover:text-[var(--accent)]">
            <span>{item.name} {item.active ? "" : "(Gizli)"}</span>
            <span>{item.price} ₺ · Düzenle</span>
          </button>
        ))}
      </div>
      <form onSubmit={save} className="grid gap-4 pt-6 sm:grid-cols-2">
        <h3 className="text-lg sm:col-span-2">{draft.id ? "Paketi düzenle" : "Yeni paket"}</h3>
        <label className="grid gap-1 text-sm">
          Paket adı
          <input required maxLength={80} className="bg-black/40 p-2" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        {([["coins", "Kredi"], ["bonus", "Bonus"], ["price", "Fiyat (₺)"]] as const).map(([field, label]) => (
          <label key={field} className="grid gap-1 text-sm">
            {label}
            <input required type="number" min={field === "bonus" ? 0 : field === "price" ? 0.01 : 1} step={field === "price" ? "0.01" : "1"} className="bg-black/40 p-2" value={draft[field] ?? 0} onChange={(event) => setDraft({ ...draft, [field]: Number(event.target.value) })} />
          </label>
        ))}
        <label className="flex gap-2 items-center"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Mağazada göster</label>
        <label className="flex gap-2 items-center"><input type="checkbox" checked={Boolean(draft.popular)} onChange={(event) => setDraft({ ...draft, popular: event.target.checked })} /> Öne çıkar</label>
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-accent px-4 py-2">{saving ? "Kaydediliyor…" : "Paketi kaydet"}</button>
          {draft.id && <button type="button" onClick={() => setDraft(empty)}>Yeni paket</button>}
        </div>
        {message && <p role="status" className="sm:col-span-2">{message}</p>}
      </form>
    </section>
  );
}
