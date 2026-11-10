/** Static stand-in for the 3D car (reduced motion, or no WebGL). */
export function CarSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 160" className={className} role="img" aria-label="Illustration of a racing car">
      <ellipse cx="280" cy="140" rx="250" ry="10" fill="#000" opacity="0.5" />
      {/* rear wing */}
      <path d="M22 38 Q20 80 44 108 L70 108 L64 40 Z" fill="#ff2a1f" />
      <path d="M18 30 Q50 26 86 44 L86 52 Q50 38 18 40 Z" fill="#111116" stroke="#f4f4f0" strokeOpacity=".25" />
      {/* body */}
      <path
        d="M60 112 Q80 70 170 62 Q215 40 262 58 Q330 66 420 96 Q480 104 536 118 Q540 124 532 126 L70 126 Q56 124 60 112 Z"
        fill="#ff2a1f"
      />
      {/* halo + helmet */}
      <circle cx="252" cy="58" r="13" fill="#ffd23f" />
      <path d="M232 52 Q262 38 296 66" fill="none" stroke="#111116" strokeWidth="6" strokeLinecap="round" />
      {/* front wing */}
      <path d="M486 122 Q520 118 552 128 Q554 134 546 134 L490 134 Z" fill="#f4f4f0" />
      {/* wheels */}
      {[118, 440].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="104" r="36" fill="#09090b" />
          <circle cx={cx} cy="104" r="27" fill="none" stroke="#ff2a1f" strokeWidth="2.5" />
          <circle cx={cx} cy="104" r="15" fill="#34343c" />
        </g>
      ))}
    </svg>
  );
}
