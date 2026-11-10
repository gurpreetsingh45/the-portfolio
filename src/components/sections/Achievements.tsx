import { profile, sectionNumber } from '../../data/profile';
import { SectionHeading } from '../ui/SectionHeading';

const STROKES = ['var(--color-sector-yellow)', 'rgb(244 244 240 / 0.8)', 'var(--color-race)'];

export function Achievements() {
  return (
    <section id="awards" data-pose="awards" aria-labelledby="awards-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <div className="md:ml-auto md:w-[52%]">
          <SectionHeading index={sectionNumber('awards')} eyebrow="Podium" title="Awards" id="awards-title" />

          <ol>
            {profile.achievements.map((a, i) => (
              <li key={a.title} data-reveal className="flex items-center gap-5 border-b border-chalk/10 py-7 first:pt-0 last:border-0 sm:gap-8">
                <span
                  aria-hidden="true"
                  className="display outline-text w-20 shrink-0 text-7xl sm:w-28 sm:text-8xl"
                  style={{ '--stroke': STROKES[i % STROKES.length] } as React.CSSProperties}
                >
                  P{i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <p className="mt-1 text-chalk/75">{a.detail}</p>
                  <p className="mt-2 font-mono text-sm text-mute">{a.year}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
