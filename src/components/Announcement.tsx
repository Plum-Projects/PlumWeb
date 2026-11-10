"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Announcement() {
  const { settings } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.announcement || dismissed) return null;

  return (
    <aside aria-label="Sunucu duyurusu" className="bg-[var(--surface-2)] text-[var(--ink)]">
      <div className="wrap flex items-center justify-between gap-3 py-2 text-sm">
        <p className="truncate font-medium">{settings.announcement}</p>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/15 transition-colors shrink-0 cursor-pointer"
          aria-label="Duyuruyu kapat"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
