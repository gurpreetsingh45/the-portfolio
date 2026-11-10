import { Fragment, lazy, Suspense, useCallback, useState } from 'react';
import { Nav } from './components/layout/Nav';
import { Footer } from './components/layout/Footer';
import { SectionDivider } from './components/layout/SectionDivider';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Timeline } from './components/sections/Timeline';
import { Achievements } from './components/sections/Achievements';
import { Contact } from './components/sections/Contact';
import { StartLights } from './components/ui/StartLights';
import { SHOW_AWARDS, SHOW_EXPERIENCE } from './data/profile';
import { useReducedMotion } from './hooks/useMediaQuery';
import { useSmoothScroll } from './hooks/useSmoothScroll';

// The 3D scene is code-split so text and layout paint first.
const Scene = lazy(() => import('./components/three/Scene'));

/** Page order. Dividers between them alternate direction automatically. */
const SECTIONS = [
  About,
  Skills,
  Projects,
  ...(SHOW_EXPERIENCE ? [Timeline] : []),
  ...(SHOW_AWARDS ? [Achievements] : []),
  Contact,
];

const INTRO_KEY = 'lights-out-seen';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return true;
  }
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [intro, setIntro] = useState(() => !introSeen());
  const use3d = webgl && !reducedMotion;

  useSmoothScroll(!reducedMotion);

  const endIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* private mode: just show it again next time */
    }
    setIntro(false);
  }, []);

  return (
    <>
      <a
        href="#about"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-chalk px-5 py-3 font-medium text-carbon focus:translate-y-0"
      >
        Skip to content
      </a>

      {intro && !reducedMotion && <StartLights onDone={endIntro} />}

      {use3d && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}

      <Nav />
      <main>
        <Hero use3d={use3d} />
        {SECTIONS.map((Section, i) => (
          <Fragment key={i}>
            <SectionDivider flip={i % 2 === 1} />
            <Section />
          </Fragment>
        ))}
      </main>
      <Footer />
    </>
  );
}
