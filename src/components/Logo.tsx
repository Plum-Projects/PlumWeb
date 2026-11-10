/** Plumya mark: a pixel plum with a leaf. Drawn in code, no image file needed. */
export default function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" className={className} role="img" aria-label="Plumya">
      <rect x="5" y="0" width="3" height="1" fill="#8fd16a" />
      <rect x="4" y="1" width="3" height="1" fill="#5f9a36" />
      <rect x="4" y="2" width="1" height="1" fill="#5a3b25" />
      <rect x="2" y="3" width="6" height="1" fill="#ff6b8f" />
      <rect x="1" y="4" width="8" height="4" fill="#ff6b8f" />
      <rect x="2" y="8" width="6" height="1" fill="#e04e74" />
      <rect x="3" y="9" width="4" height="1" fill="#b83a5c" />
      <rect x="2" y="4" width="2" height="1" fill="#ffb3c7" />
      <rect x="2" y="5" width="1" height="1" fill="#ffb3c7" />
      <rect x="6" y="7" width="2" height="1" fill="#e04e74" />
    </svg>
  );
}
