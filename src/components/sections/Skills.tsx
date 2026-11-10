import { profile, type SkillLevel } from '../../data/profile';
import { SectionHeading } from '../ui/SectionHeading';
import { ArcGauge } from '../ui/ArcGauge';

// Timing-screen colours: purple = personal best, green = improving, yellow = on an out-lap
const LEVELS: Record<SkillLevel, { dot: string; label: string }> = {
  purple: { dot: 'bg-sector-purple', label: 'Strongest' },
  green: { dot: 'bg-sector-green', label: 'Comfortable' },
  yellow: { dot: 'bg-sector-yellow', label: 'Learning' },
};

export function Skills() {
  const maxSeasons = Math.max(...profile.skills.map((s) => s.seasons)) + 1;

  return (
    <section id="skills" data-pose="skills" aria-labelledby="skills-title" className="relative z-10 py-24 md:py-36">
      <div className="wrap">
        <SectionHeading index="02" eyebrow="Telemetry" title="Skills" id="skills-title" />

        <ul data-reveal className="mb-12 flex flex-wrap gap-x-6 gap-y-2" aria-label="Legend">
          {Object.values(LEVELS).map((l) => (
            <li key={l.label} className="flex items-center gap-2 text-sm text-mute">
              <span className={`size-2.5 rounded-full ${l.dot}`} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {profile.skills.map((group) => (
            <div key={group.group} data-reveal className="flex flex-col items-center text-center">
              <ArcGauge value={group.seasons} max={maxSeasons} label={group.group} unit={group.seasons === 1 ? 'season' : 'seasons'} />
              <h3 className="display -mt-2 text-3xl">{group.group}</h3>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center gap-2 rounded-full bg-chalk/[0.07] px-3.5 py-1.5 text-sm"
                  >
                    <span className={`size-2 rounded-full ${LEVELS[item.level].dot}`} aria-hidden="true" />
                    {item.name}
                    <span className="sr-only"> — {LEVELS[item.level].label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
