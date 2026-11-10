import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '../lib/scroll';
import { SHOW_EXPERIENCE } from '../data/profile';

gsap.registerPlugin(ScrollTrigger);

/** Smooth scrolling + scroll-triggered reveals. Disabled entirely for reduced motion. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({ anchors: true, lerp: 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          skewY: 2,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      // Season History: racing line traces itself as you scroll
      if (SHOW_EXPERIENCE) gsap.utils.toArray<HTMLElement>('[data-trace]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 65%',
          onUpdate: (self) => el.style.setProperty('--p', String(self.progress)),
          onRefresh: (self) => el.style.setProperty('--p', String(self.progress)),
        });
      });
    });

    // Web fonts change text heights, so re-measure trigger positions once they load
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [enabled]);
}
