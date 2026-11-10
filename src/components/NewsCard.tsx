"use client";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import type { News } from "@/lib/types";
import PixelScene, { type Mood } from "./PixelScene";

interface NewsCardProps {
  news: News;
  index?: number;
  variant?: "feature" | "compact";
}

const MOODS: Mood[] = ["dusk", "day", "night"];

function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function NewsCard({ news, index = 0, variant = "compact" }: NewsCardProps) {
  const [open, setOpen] = useState(false);

  const date = new Date(news.date || news.createdAt || 0).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const seed = hash(news.id || news.title);
  const mood = MOODS[(index + seed) % 3];
  const feature = variant === "feature";
  const limit = feature ? 220 : 110;
  const preview = news.content.length > limit ? news.content.slice(0, limit).trimEnd() + "…" : news.content;

  const picture = (cols: number, rows: number) =>
    news.image ? (
      <img src={news.image} alt="" className="w-full h-full object-cover" />
    ) : (
      <PixelScene seed={seed % 97} mood={mood} cols={cols} rows={rows} />
    );

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className={`plumya-panel group cursor-pointer overflow-hidden ${
          feature ? "grid md:grid-cols-[1.25fr_1fr]" : "grid grid-cols-[132px_1fr] sm:grid-cols-[180px_1fr]"
        }`}
      >
        <div className={`overflow-hidden bg-[var(--surface-3)] ${feature ? "aspect-[16/10] md:aspect-auto md:min-h-[360px]" : ""}`}>
          <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
            {feature ? picture(100, 62) : picture(40, 40)}
          </div>
        </div>

        <div className={`flex flex-col ${feature ? "p-6 sm:p-9" : "p-4 sm:p-5"}`}>
          <p className="text-sm font-semibold text-[var(--accent)]">{date}</p>
          <h3
            className={`font-extrabold leading-tight mt-1.5 ${
              feature ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl"
            }`}
          >
            {news.title}
          </h3>
          <p className={`text-[var(--muted)] leading-relaxed mt-3 whitespace-pre-line ${feature ? "text-base" : "text-sm line-clamp-2"}`}>
            {preview}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className={`mt-auto pt-5 self-start flex items-center gap-2 text-sm font-bold text-[var(--ink)] cursor-pointer ${feature ? "" : "hidden sm:flex"}`}
          >
            Haberi oku
            <ArrowRight size={15} className="text-[var(--accent)] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </article>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={news.title}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative bg-[var(--surface)] max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="h-44 overflow-hidden">{picture(120, 40)}</div>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-[var(--bg)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
            <div className="p-6 sm:p-9">
              <p className="text-sm text-[var(--muted)]">
                {date} · {news.author}
              </p>
              <h2 className="text-3xl font-extrabold mt-1 mb-5 leading-tight">{news.title}</h2>
              <div className="text-base leading-relaxed whitespace-pre-line">{news.content}</div>
              <button onClick={() => setOpen(false)} className="btn-soft mt-8 px-5 h-11 text-sm cursor-pointer">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
