"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

const Avatar = ({ name }: { name: string }) => (
  <img
    src={`https://mc-heads.net/avatar/${encodeURIComponent(name)}/64`}
    alt=""
    width={36}
    height={36}
    className="w-9 h-9 bg-[var(--surface-3)] shrink-0"
    onError={(e) => {
      e.currentTarget.style.visibility = "hidden";
    }}
  />
);

export default function Supporters() {
  const { creditLoads, coinPackages, topSupporters } = useApp();

  const recent = [...creditLoads]
    .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime())
    .slice(0, 5);

  const packs = coinPackages.slice(0, 5);

  const empty = "text-[var(--muted)] py-3";
  const row = "flex items-center gap-3 py-2.5";

  return (
    <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
      <section className="plumya-panel plumya-reading-panel min-w-0 self-start lg:col-span-6">
        <h3 className="text-2xl mb-4">En çok destek verenler</h3>
        {topSupporters.length === 0 ? (
          <p className={empty}>Henüz kimse destek vermedi.</p>
        ) : (
          <ol className="divide-y divide-white/12">
            {topSupporters.map(({ username: name, amount: total }, i) => (
              <li key={name} className={`${row} ${i === 0 ? "bg-[var(--accent)]/10 px-2" : "px-2"}`}>
                <span className="w-6 font-display text-3xl font-semibold text-[var(--accent)] tabular-nums">{i + 1}</span>
                <Avatar name={name} />
                <span className="flex-1 min-w-0 font-bold truncate">{name}</span>
                <span className="text-sm font-bold tabular-nums">{total.toLocaleString("tr-TR")}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="plumya-panel plumya-reading-panel min-w-0 self-start lg:col-span-4 lg:col-start-9 lg:mt-20">
        <h3 className="text-xl mb-2">Son bağışlar</h3>
        {recent.length === 0 ? (
          <p className={empty}>Henüz bağış yok.</p>
        ) : (
          <ul>
            {recent.map((l) => (
              <li key={l.id} className={row}>
                <Avatar name={l.username} />
                <span className="flex-1 min-w-0">
                  <span className="block font-bold truncate">{l.username}</span>
                  <span className="block text-xs text-[var(--muted)]">
                    {new Date(l.date || l.createdAt || 0).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </span>
                </span>
                <span className="text-sm font-bold text-[var(--accent)] tabular-nums">+{l.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="plumya-panel plumya-reading-panel min-w-0 self-start lg:col-span-8 lg:col-start-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-xl">Mağaza paketleri</h3>
          <Link href="/market" className="py-2 text-sm font-bold text-[var(--accent)] hover:underline">Markete git</Link>
        </div>
        {packs.length === 0 ? (
          <p className={empty}>Mağazada ürün yok.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-5">
            {packs.map((p) => (
              <li key={p.id} className={`${row} border-t border-white/25`}>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold truncate">{p.name}</span>
                  <span className="block text-xs text-[var(--muted)]">{p.coins.toLocaleString("tr-TR")} kredi</span>
                </span>
                <span className="text-sm font-bold tabular-nums">{p.price} ₺</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
