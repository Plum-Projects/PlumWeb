"use client";

import { useMemo, useSyncExternalStore } from "react";

export type Mood = "day" | "dusk" | "night";

interface Props {
  seed?: number;
  /** "auto" follows the visitor's own clock */
  mood?: Mood | "auto";
  cols?: number;
  rows?: number;
  className?: string;
  /** hide the tower and trees for small thumbnails */
  simple?: boolean;
}

const SKY: Record<Mood, string[]> = {
  day: ["#7fb9e4", "#97c8ea", "#afd6ef", "#c6e3f4"],
  dusk: ["#2c1d36", "#4b2849", "#7a3b57", "#b04f62", "#da7f68"],
  night: ["#0c0a16", "#130f23", "#1b1530", "#261c3c"],
};

const GROUND: Record<Mood, { far: string; mid: string; near: string; grass: string; dirt: string }> = {
  day: { far: "#7fa0b6", mid: "#5c9a52", near: "#4c8c3f", grass: "#6bb24a", dirt: "#7a5638" },
  dusk: { far: "#5a3a5a", mid: "#3d4a3a", near: "#34502f", grass: "#4f7a3a", dirt: "#4a3326" },
  night: { far: "#241c3a", mid: "#1d3034", near: "#1a3a2b", grass: "#2f5a36", dirt: "#2a2019" },
};

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hourToMood(h: number): Mood {
  if (h >= 7 && h < 17) return "day";
  if (h >= 17 && h < 21) return "dusk";
  return "night";
}

type Run = { x: number; w: number; h: number };

function heights(cols: number, base: number, amp: number, phase: number, freq: number): number[] {
  const out: number[] = [];
  for (let x = 0; x < cols; x++) {
    const v = Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * (amp * 0.45);
    out.push(Math.round(base + v));
  }
  return out;
}

function toRuns(hs: number[]): Run[] {
  const runs: Run[] = [];
  for (let x = 0; x < hs.length; x++) {
    const last = runs[runs.length - 1];
    if (last && last.h === hs[x]) last.w += 1;
    else runs.push({ x, w: 1, h: hs[x] });
  }
  return runs;
}

export default function PixelScene({
  seed = 7,
  mood = "auto",
  cols = 96,
  rows = 36,
  className = "",
  simple = false,
}: Props) {
  // follows the visitor's own clock; server render and first paint use "dusk"
  const autoMood = useSyncExternalStore<Mood>(
    () => () => {},
    () => hourToMood(new Date().getHours()),
    () => "dusk"
  );

  const m: Mood = mood === "auto" ? autoMood : mood;

  const scene = useMemo(() => {
    const r = rng(seed * 9973 + 13);
    const far = heights(cols, rows * 0.52, 3.2, r() * 6, 0.09);
    const mid = heights(cols, rows * 0.66, 2.6, r() * 6, 0.13);
    const near = heights(cols, rows * 0.82, 1.8, r() * 6, 0.19);

    const stars = Array.from({ length: 26 }, () => ({
      x: Math.floor(r() * cols),
      y: Math.floor(r() * rows * 0.42),
    }));
    const clouds = Array.from({ length: 3 }, () => ({
      x: Math.floor(r() * (cols - 14)),
      y: 3 + Math.floor(r() * rows * 0.22),
      w: 8 + Math.floor(r() * 7),
    }));
    const sunX = 8 + Math.floor(r() * (cols - 22));
    const sunY = 3 + Math.floor(r() * 5);

    const trees: { x: number; y: number; tall: number }[] = [];
    let x = 3 + Math.floor(r() * 6);
    while (x < cols - 3) {
      trees.push({ x, y: near[x], tall: 3 + Math.floor(r() * 3) });
      x += 7 + Math.floor(r() * 12);
    }
    const towerX = 10 + Math.floor(r() * (cols - 28));
    const lit = [r() > 0.3, r() > 0.45, r() > 0.6];

    return { far, mid, near, stars, clouds, sunX, sunY, trees, towerX, lit };
  }, [seed, cols, rows]);

  const sky = SKY[m];
  const g = GROUND[m];
  const bandH = rows / sky.length;

  const layer = (hs: number[], body: string, top?: string) =>
    toRuns(hs).map((run, i) => (
      <g key={i}>
        <rect x={run.x} y={run.h} width={run.w} height={rows - run.h} fill={body} />
        {top && <rect x={run.x} y={run.h} width={run.w} height={1} fill={top} />}
      </g>
    ));

  const towerBaseY = scene.mid[scene.towerX + 1];
  const celestial = m === "night" ? "#ece6d4" : m === "dusk" ? "#f3c870" : "#fbe58a";

  return (
    <svg
      className={`px-scene ${className}`}
      viewBox={`0 0 ${cols} ${rows}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Plumya dünyasından piksel manzara"
    >
      {sky.map((c, i) => (
        <rect key={i} x={0} y={i * bandH} width={cols} height={bandH + 0.5} fill={c} />
      ))}

      {m === "night" &&
        scene.stars.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={1} height={1} fill="#f3eee6" opacity={i % 3 === 0 ? 1 : 0.55} />
        ))}

      <rect x={scene.sunX} y={scene.sunY} width={4} height={4} fill={celestial} />
      {m === "night" && <rect x={scene.sunX + 2} y={scene.sunY} width={2} height={2} fill={SKY.night[2]} />}

      {m !== "night" && (
        <g className="drift" fill={m === "day" ? "#f4f9fc" : "#e9b0a0"} opacity={m === "day" ? 0.95 : 0.7}>
          {scene.clouds.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={c.y} width={c.w} height={2} />
              <rect x={c.x + 2} y={c.y - 1} width={c.w - 5} height={1} />
            </g>
          ))}
        </g>
      )}

      {layer(scene.far, g.far)}
      {layer(scene.mid, g.mid, g.grass)}

      {!simple && (
        <g>
          <rect x={scene.towerX} y={towerBaseY - 9} width={4} height={9} fill={m === "day" ? "#8c8793" : "#4a4352"} />
          <rect x={scene.towerX - 1} y={towerBaseY - 10} width={6} height={1} fill={m === "day" ? "#a29da8" : "#5c5466"} />
          {scene.lit.map((on, i) => (
            <rect
              key={i}
              x={scene.towerX + 1}
              y={towerBaseY - 8 + i * 3}
              width={2}
              height={1}
              fill={on || m !== "day" ? "#f3c870" : "#6b6672"}
              className={on && m !== "day" ? "blink" : undefined}
            />
          ))}
        </g>
      )}

      {layer(scene.near, g.dirt, g.grass)}

      {!simple &&
        scene.trees.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={t.y - t.tall} width={1} height={t.tall} fill="#5a3b25" />
            <rect x={t.x - 2} y={t.y - t.tall - 3} width={5} height={3} fill={m === "night" ? "#1f4a2c" : "#2e7a35"} />
            <rect x={t.x - 1} y={t.y - t.tall - 4} width={3} height={1} fill={m === "night" ? "#245733" : "#3b9142"} />
          </g>
        ))}
    </svg>
  );
}
