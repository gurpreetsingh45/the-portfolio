import { useCallback, useEffect, useState } from 'react';
import { profile, sections } from '../../data/profile';
import { LapProgress } from './LapProgress';
import { MobileMenu } from './MobileMenu';

/** Which section currently crosses the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    document.querySelectorAll('main > section[id]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Nav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-linear-to-b from-carbon via-carbon/75 to-transparent pt-[env(safe-area-inset-top)] pb-6">
        <div className="wrap flex h-20 items-center justify-between">
          <a href="#top" className="display flex min-h-11 items-center gap-2 text-2xl" aria-label={`${profile.name.first} ${profile.name.last} — back to top`}>
            {profile.initials}
            <span className="text-race">{profile.carNumber}</span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full bg-carbon/60 px-2 py-1 backdrop-blur-md">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'true' : undefined}
                    className="flex min-h-10 items-center rounded-full px-4 text-sm text-mute transition-colors hover:text-chalk aria-[current]:bg-chalk/10 aria-[current]:text-chalk"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LapProgress />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="flex h-11 items-center gap-2 rounded-full bg-chalk px-5 font-display text-base font-semibold tracking-wide text-carbon uppercase italic md:hidden"
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} active={active} />
    </>
  );
}
