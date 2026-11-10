"use client";

/**
 * Hero picture, drawn in code: an erik (plum) tree in blossom beside a lantern path,
 * under a night sky. Plumya means "plum"; this is its place, built from square blocks.
 * Flat colour bands only. Petals fall slowly and the lanterns flicker.
 */

const W = 120;
const H = 100;
const GROUND = 78;

const SKY = ["#0d0712", "#140a1a", "#1c0f26", "#281632", "#38203f", "#4a2a4d"];
const PINKS = ["#ff6b8f", "#ff8fab", "#ffb3c7", "#e04e74", "#ff9db6"];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r = rng(41);

const blobs = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2;
  const rad = 8 + r() * 14;
  return {
    x: Math.round(78 + Math.cos(a) * rad * 1.5 - 6 + (r() - 0.5) * 6),
    y: Math.round(34 + Math.sin(a) * rad * 0.7 + (r() - 0.5) * 4),
    w: 8 + Math.floor(r() * 9),
    h: 3 + Math.floor(r() * 4),
    c: PINKS[Math.floor(r() * PINKS.length)],
  };
});

const stars = Array.from({ length: 22 }, () => ({
  x: Math.floor(r() * W),
  y: Math.floor(r() * 36),
  o: 0.4 + r() * 0.6,
}));

const petals = Array.from({ length: 16 }, (_, i) => ({
  x: 58 + Math.floor(r() * 46),
  y: 36 + Math.floor(r() * 12),
  d: -(r() * 9).toFixed(1),
  c: PINKS[i % PINKS.length],
}));

function hills(base: number, amp: number, phase: number, freq: number) {
  const out: { x: number; w: number; y: number }[] = [];
  for (let x = 0; x < W; x++) {
    const y = Math.round(base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.1 + phase * 1.6) * amp * 0.4);
    const last = out[out.length - 1];
    if (last && last.y === y) last.w += 1;
    else out.push({ x, w: 1, y });
  }
  return out;
}

const far = hills(60, 3.5, 1.2, 0.08);
const mid = hills(68, 2.6, 4.1, 0.12);

export default function PixelBlossom({ className = "" }: { className?: string }) {
  const bandH = GROUND / SKY.length;
  return (
    <svg
      className={`px-scene ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Gece, fener yolu kenarında çiçek açmış bir erik ağacı"
    >
      {SKY.map((c, i) => (
        <rect key={i} x={0} y={i * bandH} width={W} height={bandH + 0.5} fill={c} />
      ))}

      {stars.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={1} height={1} fill="#f6edf3" opacity={s.o} />
      ))}

      {/* moon */}
      <rect x={36} y={10} width={8} height={8} fill="#f6edf3" />
      <rect x={34} y={12} width={2} height={4} fill="#f6edf3" />
      <rect x={44} y={12} width={2} height={4} fill="#f6edf3" />
      <rect x={40} y={10} width={4} height={4} fill="#1c0f26" />

      {/* hills */}
      {far.map((h, i) => (
        <rect key={i} x={h.x} y={h.y} width={h.w} height={H - h.y} fill="#2d1a38" />
      ))}
      {mid.map((h, i) => (
        <rect key={i} x={h.x} y={h.y} width={h.w} height={H - h.y} fill="#1f1229" />
      ))}

      {/* ground */}
      <rect x={0} y={GROUND} width={W} height={H - GROUND} fill="#170e1d" />
      <rect x={0} y={GROUND} width={W} height={1} fill="#2f4a33" />

      {/* path: stepped stones leading to the tree */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={44 + i * 3} y={GROUND + 3 + i * 4} width={14 - i} height={2} fill="#3a2a46" />
      ))}

      {/* tree */}
      <rect x={76} y={40} width={4} height={GROUND - 40} fill="#4a2f2a" />
      <rect x={74} y={GROUND - 6} width={8} height={6} fill="#4a2f2a" />
      <rect x={70} y={48} width={6} height={2} fill="#4a2f2a" />
      <rect x={80} y={44} width={8} height={2} fill="#4a2f2a" />
      <rect x={66} y={44} width={4} height={2} fill="#4a2f2a" />
      {blobs.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} />
      ))}

      {petals.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.c} className="petal" style={{ animationDelay: `${p.d}s` }} />
      ))}

      {/* lanterns on stone posts */}
      {[34, 58].map((x, i) => (
        <g key={x}>
          <rect x={x} y={GROUND - 9} width={2} height={9} fill="#3a2a46" />
          <rect x={x - 1} y={GROUND - 13} width={4} height={4} fill="#ffc15e" className="flicker" style={{ animationDelay: `${i * 0.9}s` }} />
          <rect x={x - 2} y={GROUND - 14} width={6} height={1} fill="#3a2a46" />
        </g>
      ))}

      <rect x={0} y={H - 10} width={W} height={10} fill="#130c17" />
    </svg>
  );
}
