import { profile } from '../../data/profile';
import { DEFAULT_ACCENT, scene } from '../../lib/sceneStore';
import { SectionHeading } from '../ui/SectionHeading';

// Project visuals sit in a slanted panel with two cut corners, like a timing-board tile.
// Odd rows mirror it so the cut corners follow the alternating layout.
const PANEL = 'polygon(9% 0, 100% 0, 100% 82%, 91% 100%, 0 100%, 0 18%)';
const PANEL_FLIP = 'polygon(0 0, 91% 0, 100% 18%, 100% 100%, 9% 100%, 0 82%)';

export function Projects() {
  return (
    <section id="projects" data-pose="projects" aria-labelledby="projects-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <SectionHeading index="03" eyebrow="Race calendar" title="Projects" id="projects-title" />

        <ol className="flex flex-col gap-24 md:gap-32">
          {profile.projects.map((p, i) => {
            const sector = String(i + 1).padStart(2, '0');
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
                  {/* Visual placeholder — put a screenshot <img> inside; the clip-path crops it to the panel shape */}
                  <div
                    aria-hidden="true"
                    className="relative grid aspect-[5/4] w-full max-w-md shrink-0 place-items-center transition-transform duration-700 ease-out group-hover:scale-[1.03] md:w-[42%]"
                    style={{
                      clipPath: i % 2 ? PANEL_FLIP : PANEL,
                      background: `radial-gradient(120% 120% at 20% 15%, color-mix(in oklab, ${p.color} 85%, white) 0%, ${p.color} 35%, #16161d 100%)`,
                    }}
                  >
                    <svg viewBox="0 0 200 160" className="absolute inset-0 size-full opacity-40">
                      <path d="M-10 120 C 40 60, 80 150, 120 80 S 180 40, 215 70" fill="none" stroke="#0b0b0f" strokeWidth="10" strokeLinecap="round" />
                      <path d="M-10 120 C 40 60, 80 150, 120 80 S 180 40, 215 70" fill="none" stroke="#f4f4f0" strokeWidth="1.5" strokeDasharray="6 8" />
                    </svg>
                    {/* kerb stripe along the top edge */}
                    <span className="kerb absolute inset-x-0 top-0 rounded-none opacity-80" />
                    <span className="display relative text-[7rem] text-carbon/85">S{sector}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">
                      <span style={{ color: p.color }}>Sector {sector}</span> · {p.stack.join(' · ')}
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
