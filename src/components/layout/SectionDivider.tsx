/** A sweeping racing line between sections (purely decorative). */
export function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none relative z-10 block h-12 w-full md:h-20 ${flip ? '-scale-x-100' : ''}`}
    >
      <path d="M-20 60 C 260 60, 380 10, 640 22 S 1040 74, 1220 20" fill="none" stroke="rgb(244 244 240 / 0.1)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d="M-20 68 C 260 68, 380 18, 640 30 S 1040 82, 1220 28" fill="none" stroke="var(--color-race)" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
