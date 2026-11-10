import { profile } from '../../data/profile';
import { DEFAULT_ACCENT, scene } from '../../lib/sceneStore';
import { SectionHeading } from '../ui/SectionHeading';

// Organic silhouettes for the project visuals — no rectangles
const BLOBS = [
  '62% 38% 54% 46% / 48% 58% 42% 52%',
  '40% 60% 44% 56% / 58% 42% 58% 42%',
  '55% 45% 38% 62% / 44% 56% 44% 56%',
  '46% 54% 60% 40% / 56% 46% 54% 44%',
];

export function Projects() {
  return (
    <section id="projects" data-pose="projects" aria-labelledby="projects-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <SectionHeading index="03" eyebrow="Race calendar" title="Projects" id="projects-title" />

        <ol className="flex flex-col gap-24 md:gap-32">
          {profile.projects.map((p, i) => {
            const round = String(i + 1).padStart(2, '0');
            const tint = () => (scene.accent = p.color);
            const untint = () => (scene.accent = DEFAULT_ACCENT);
            return (
              <li key={p.title}>
                <article
                  data-reveal
                  onPointerEnter={tint}
                  onPointerLeave={untint}
                  onFocus={tint}
                  onBlur={untint}
                  className={`group flex flex-col gap-8 md:items-center md:gap-14 ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                  style={{ '--tint': p.color } as React.CSSProperties}
                >
                  {/* Visual placeholder — put a screenshot <img> inside and keep the border-radius */}
                  <div
                    aria-hidden="true"
                    className="relative grid aspect-[5/4] w-full max-w-md shrink-0 place-items-center overflow-hidden transition-[border-radius,transform] duration-700 ease-out group-hover:scale-[1.03] md:w-[42%]"
                    style={{
                      borderRadius: BLOBS[i % BLOBS.length],
                      background: `radial-gradient(120% 120% at 20% 15%, color-mix(in oklab, ${p.color} 85%, white) 0%, ${p.color} 35%, #16161d 100%)`,
                    }}
                  >
                    <svg viewBox="0 0 200 160" className="absolute inset-0 size-full opacity-40">
                      <path d="M-10 120 C 40 60, 80 150, 120 80 S 180 40, 215 70" fill="none" stroke="#0b0b0f" strokeWidth="10" strokeLinecap="round" />
                      <path d="M-10 120 C 40 60, 80 150, 120 80 S 180 40, 215 70" fill="none" stroke="#f4f4f0" strokeWidth="1.5" strokeDasharray="6 8" />
                    </svg>
                    <span className="display relative text-[7rem] text-carbon/85">R{round}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">
                      <span style={{ color: p.color }}>Round {round}</span> · {p.stack.join(' · ')}
                    </p>
                    <h3 className="display mt-3 text-5xl md:text-6xl">{p.title}</h3>
                    <p className="mt-3 text-lg text-chalk/85">{p.tagline}</p>

                    <dl className="mt-6 space-y-3">
                      {(
                        [
                          ['Problem', p.problem],
                          ['Build', p.build],
                          ['Result', p.result],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k} className="flex gap-4">
                          <dt className="eyebrow w-20 shrink-0 pt-1">{k}</dt>
                          <dd className="text-chalk/80">{v}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-x-6">
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 font-medium underline decoration-[var(--tint)] decoration-2 underline-offset-8 hover:text-[var(--tint)]">
                          Source code <span aria-hidden="true">↗</span>
                          <span className="sr-only"> for {p.title}</span>
                        </a>
                      )}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 font-medium underline decoration-[var(--tint)] decoration-2 underline-offset-8 hover:text-[var(--tint)]">
                          Live demo <span aria-hidden="true">↗</span>
                          <span className="sr-only"> of {p.title}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
