import { useEffect, useRef, useState } from 'react';
import { sections } from '../../data/profile';
import { LAP } from '../three/choreography';
import { minimapPath, minimapPoint } from '../three/track/layout';
import { lapSections, readLap } from '../../lib/lap';
import { scrollToId } from '../../lib/scroll';

const CIRCUIT = minimapPath();

const BIG = 176;
const BIG_PAD = 14;
const BIG_CIRCUIT = minimapPath(BIG, BIG_PAD);

/** Each stretch of the circuit and the page section it stands for. */
const SECTORS = [{ id: 'top', label: 'Start' }, ...sections].map((s, i, all) => {
  const from = i === 0 ? 0 : LAP[s.id];
  const to = i + 1 < all.length ? LAP[all[i + 1].id] : 1;
  return { ...s, index: i, d: minimapPath(BIG, BIG_PAD, from, to) };
});

/**
 * Scroll progress as a lap of the circuit: the same shape, and the same position, as the 3D car.
 * On desktop, hovering it opens a larger map where each sector jumps to its section.
 * (That map is a mouse shortcut only; keyboard and screen-reader users have the nav links.)
 */
export function LapProgress() {
  const path = useRef<SVGPathElement>(null);
  const done = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const bigDot = useRef<SVGCircleElement>(null);
  const [hover, setHover] = useState<(typeof SECTORS)[number] | null>(null);

  useEffect(() => {
    let raf = 0;
    const total = path.current!.getTotalLength();
    const els = lapSections();
    const update = () => {
      raf = 0;
      const lap = readLap(els);
      const pt = minimapPoint(lap);
      dot.current!.setAttribute('cx', String(pt.x));
      dot.current!.setAttribute('cy', String(pt.y));
      const big = minimapPoint(lap, BIG, BIG_PAD);
      bigDot.current!.setAttribute('cx', String(big.x));
      bigDot.current!.setAttribute('cy', String(big.y));
      done.current!.style.strokeDasharray = `${Math.min(lap, 1) * total} ${total}`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="group relative" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="size-10">
        <path ref={path} d={CIRCUIT} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" strokeLinejoin="round" />
        <path ref={done} d={CIRCUIT} fill="none" stroke="var(--color-race)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={dot} r="3.5" fill="var(--color-chalk)" />
      </svg>

      <div className="invisible absolute top-full right-0 hidden pt-2 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 md:block">
        <div className="rounded-3xl bg-asphalt/95 p-4 shadow-2xl ring-1 ring-chalk/10 backdrop-blur-md">
          <svg viewBox={`0 0 ${BIG} ${BIG}`} className="size-44" onPointerLeave={() => setHover(null)}>
            <path d={BIG_CIRCUIT} fill="none" stroke="var(--color-chalk)" strokeOpacity="0.12" strokeWidth="9" strokeLinejoin="round" />
            {SECTORS.map((s) => (
              <path
                key={s.id}
                d={s.d}
                fill="none"
                strokeWidth="5"
                strokeLinecap="butt"
                strokeLinejoin="round"
                pointerEvents="stroke"
                onPointerEnter={() => setHover(s)}
                onClick={() => scrollToId(s.id)}
                className={`cursor-pointer transition-colors ${hover?.id === s.id ? 'stroke-race' : s.index % 2 ? 'stroke-chalk/70' : 'stroke-chalk/35'}`}
              >
                <title>{s.label}</title>
              </path>
            ))}
            <circle ref={bigDot} r="5" fill="var(--color-race)" stroke="var(--color-chalk)" strokeWidth="2" pointerEvents="none" />
          </svg>
          <p className="eyebrow mt-2 text-center whitespace-nowrap">
            {hover ? (
              <>
                Sector {String(hover.index).padStart(2, '0')} · <span className="text-chalk">{hover.label}</span>
              </>
            ) : (
              'Click a sector to jump'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
