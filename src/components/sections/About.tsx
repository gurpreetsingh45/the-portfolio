import { profile } from '../../data/profile';
import { SectionHeading } from '../ui/SectionHeading';

export function About() {
  return (
    <section id="about" data-pose="about" aria-labelledby="about-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <div className="md:w-[52%]">
          <SectionHeading index="01" eyebrow="Driver profile" title="About" id="about-title" />

          <div data-reveal className="flex items-center gap-5">
            {/* Portrait placeholder — swap for an <img> with the same rounded-full classes */}
            <div
              className="grid size-24 shrink-0 place-items-center rounded-full bg-linear-to-br from-race to-sector-purple p-[3px] sm:size-28"
              role="img"
              aria-label="Portrait placeholder"
            >
              <span className="display grid size-full place-items-center rounded-full bg-carbon text-4xl">
                {profile.initials}
              </span>
            </div>
            <div>
              <p className="display text-3xl">
                {profile.name.first} {profile.name.last}
              </p>
              <p className="mt-1 font-mono text-sm text-mute">
                No. {profile.carNumber} · {profile.location}
              </p>
            </div>
          </div>

          <div data-reveal className="mt-8 space-y-4 text-lg leading-relaxed text-chalk/85">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl data-reveal className="mt-12 flex flex-wrap gap-x-10 gap-y-8">
            {profile.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="eyebrow mt-2">{s.label}</dt>
                <dd className="font-mono text-4xl font-medium tabular-nums sm:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
