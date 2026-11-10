import { profile, sectionNumber } from '../../data/profile';
import { SectionHeading } from '../ui/SectionHeading';

/** A winding circuit: one corner per milestone, alternating left (20) and right (80). */
function circuitPath(count: number) {
  let d = 'M50 0';
  let px = 50;
  let py = 0;
  for (let i = 0; i < count; i++) {
    const cx = i % 2 ? 80 : 20;
    const cy = i * 100 + 50;
    d += ` C${px} ${py + 34} ${cx} ${cy - 34} ${cx} ${cy}`;
    px = cx;
    py = cy;
  }
  return `${d} C${px} ${py + 34} 50 ${count * 100 - 30} 50 ${count * 100}`;
}

export function Timeline() {
  const items = profile.timeline;
  const d = circuitPath(items.length);
  const svg = { viewBox: `0 0 100 ${items.length * 100}`, preserveAspectRatio: 'none', className: 'absolute inset-0 size-full' };

  return (
    <section id="experience" data-pose="experience" aria-labelledby="experience-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <SectionHeading index={sectionNumber('experience')} eyebrow="Season history" title="Experience" id="experience-title" className="md:text-center md:[&_.kerb]:mx-auto" />

        <div className="relative">
          {/* The track: narrow gutter on phones, centre lane on desktop */}
          <div data-trace aria-hidden="true" className="absolute inset-y-0 left-0 w-14 md:left-1/2 md:w-40 md:-translate-x-1/2">
            <svg {...svg}>
              <path d={d} fill="none" stroke="#22222b" strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={d} fill="none" stroke="rgb(244 244 240 / 0.25)" strokeWidth="1" strokeDasharray="6 10" vectorEffect="non-scaling-stroke" />
            </svg>
            <svg {...svg} style={{ clipPath: 'inset(0 0 calc((1 - var(--p, 1)) * 100%) 0)' }}>
              <path d={d} fill="none" stroke="var(--color-race)" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <ol className="relative grid auto-rows-fr [--dot-l:0.7rem] [--dot-r:2.8rem] md:[--dot-l:calc(50%-3rem)] md:[--dot-r:calc(50%+3rem)]">
            {items.map((item, i) => {
              const right = i % 2 === 1;
              return (
                <li key={item.title} className="relative grid min-h-52 grid-cols-[3.5rem_1fr] items-center md:grid-cols-[1fr_10rem_1fr]">
                  {/* corner marker */}
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chalk ring-4 ring-carbon"
                    style={{ left: `var(--dot-${right ? 'r' : 'l'})` }}
                  />
                  <div
                    data-reveal
                    className={`col-start-2 py-6 pl-5 md:pl-0 ${
                      right ? 'md:col-start-3 md:pl-8' : 'md:col-start-1 md:pr-8 md:text-right'
                    }`}
                  >
                    <p className="font-mono text-sm text-race">{item.period}</p>
                    <h3 className="display mt-2 text-4xl">{item.title}</h3>
                    <p className="mt-1 font-medium text-chalk/90">{item.place}</p>
                    <p className="mt-3 text-chalk/75">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
