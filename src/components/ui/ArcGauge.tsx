import { useInView } from '../../hooks/useInView';

type Props = { value: number; max: number; label: string; unit: string };

const ARC = 'M26.06 93.94 A48 48 0 1 1 93.94 93.94'; // 270° sweep

/** Rev-counter style dial that sweeps up when scrolled into view. */
export function ArcGauge({ value, max, label, unit }: Props) {
  const [ref, inView] = useInView<SVGSVGElement>();
  const pct = Math.min(value / max, 1) * 100;

  return (
    <svg ref={ref} viewBox="0 0 120 120" className="w-full max-w-44" role="img" aria-label={`${label}: ${value} ${unit}`}>
      <path d={ARC} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="7" strokeLinecap="round" />
      <path d={ARC} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="12" strokeDasharray="0.6 5.65" pathLength={100} transform="translate(60 60) scale(0.8) translate(-60 -60)" />
      <path
        d={ARC}
        fill="none"
        stroke="var(--color-race)"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100 100"
        strokeDashoffset={inView ? 100 - pct : 100}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      />
      <text x="60" y="66" textAnchor="middle" className="fill-chalk font-mono text-[28px] font-medium">
        {value}
      </text>
      <text x="60" y="84" textAnchor="middle" className="fill-mute font-mono text-[8px] tracking-[0.2em] uppercase">
        {unit}
      </text>
    </svg>
  );
}
