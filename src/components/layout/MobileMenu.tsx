import { useEffect } from 'react';
import { profile, sections } from '../../data/profile';
import { lockScroll } from '../../lib/scroll';

type Props = { open: boolean; onClose: () => void; active: string };

/** Full-screen menu that opens as a circle growing from the menu button. */
export function MobileMenu({ open, onClose, active }: Props) {
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      inert={!open}
      className="fixed inset-0 z-30 flex flex-col justify-center bg-carbon/97 backdrop-blur-md transition-[clip-path] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] md:hidden"
      style={{ clipPath: open ? 'circle(150% at calc(100% - 3rem) 2.5rem)' : 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
    >
      <nav aria-label="Mobile" className="wrap">
        <ul className="flex flex-col gap-1">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => {
                  lockScroll(false); // unlock before the smooth-scroll handler runs
                  onClose();
                }}
                aria-current={active === s.id ? 'true' : undefined}
                className="display flex min-h-14 items-baseline gap-4 text-5xl aria-[current]:text-race"
              >
                <span className="eyebrow w-6 not-italic">0{i + 1}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="kerb mt-8 w-24" aria-hidden="true" />
        <a href={`mailto:${profile.email}`} onClick={onClose} className="mt-6 inline-flex min-h-11 items-center font-mono text-sm text-mute">
          {profile.email}
        </a>
      </nav>
    </div>
  );
}
