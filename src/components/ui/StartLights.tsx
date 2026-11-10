import { useCallback, useEffect, useState } from 'react';
import { lockScroll } from '../../lib/scroll';

/** Five red lights come on one by one, go out, and the page launches. Click or press any key to skip. */
export function StartLights({ onDone }: { onDone: () => void }) {
  const [lit, setLit] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const leave = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useEffect(() => {
    if (leaving) {
      const t = setTimeout(onDone, 650);
      return () => clearTimeout(t);
    }
    const t =
      lit === -1
        ? setTimeout(leave, 320)
        : lit < 5
          ? setTimeout(() => setLit((n) => n + 1), 280)
          : setTimeout(() => setLit(-1), 520); // lights out
    return () => clearTimeout(t);
  }, [lit, leaving, leave, onDone]);

  useEffect(() => {
    window.addEventListener('keydown', leave);
    return () => window.removeEventListener('keydown', leave);
  }, [leave]);

  return (
    <div
      role="status"
      aria-label="Loading"
      onClick={leave}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-carbon transition-transform duration-[650ms] ease-[cubic-bezier(0.7,0,0.2,1)] ${
        leaving ? '-translate-y-full' : ''
      }`}
    >
      <div className="flex gap-3 sm:gap-5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`size-11 rounded-full transition-all duration-150 sm:size-16 ${
              lit >= n
                ? 'bg-race shadow-[0_0_44px_8px_rgb(255_42_31/0.65)]'
                : 'bg-asphalt ring-1 ring-inset ring-chalk/10'
            }`}
          />
        ))}
      </div>
      <p className="display text-3xl sm:text-5xl" aria-hidden="true">
        {lit === -1 ? 'Lights out' : <span className="text-mute">Get ready</span>}
      </p>
      <button type="button" className="eyebrow absolute bottom-10 min-h-11 px-4 hover:text-chalk">
        Tap to skip
      </button>
    </div>
  );
}
