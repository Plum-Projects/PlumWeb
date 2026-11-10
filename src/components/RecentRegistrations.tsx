"use client";

import { useApp } from "@/contexts/AppContext";

export default function RecentRegistrations() {
  const { settings, users } = useApp();

  if (!settings.showRecentRegistrations) return null;

  const recent = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.registeredAt || 0).getTime() - new Date(a.createdAt || a.registeredAt || 0).getTime()
    )
    .slice(0, 8);

  if (recent.length === 0) {
    return <p className="text-[var(--muted)]">Henüz kayıt bulunmuyor.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 min-[440px]:grid-cols-2 md:grid-cols-4">
      {recent.map((u) => (
        <li key={u.id} className="flex min-w-0 items-center gap-3 border-t border-white/15 px-2 py-3">
          <img
            src={`https://mc-heads.net/avatar/${encodeURIComponent(u.username)}/64`}
            alt=""
            width={44}
            height={44}
            className="w-11 h-11 bg-[var(--surface-3)] shrink-0"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="block truncate font-bold leading-tight">{u.username}</span>
            <span className="block text-xs text-[var(--muted)]">
              {new Date(u.createdAt || u.registeredAt || 0).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
