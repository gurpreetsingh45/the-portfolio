import { useRef, type PointerEvent } from 'react';
import { profile } from '../../data/profile';
import { scene } from '../../lib/sceneStore';
import { PillButton } from '../ui/PillButton';
import { CarSilhouette } from '../three/CarSilhouette';

/** Invisible area over the car: drag sideways to spin it (vertical swipes still scroll). */
function DragZone() {
  const lastX = useRef(0);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastX.current = e.clientX;
    scene.dragging = true;
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!scene.dragging) return;
    scene.drag += (e.clientX - lastX.current) * 0.012;
    lastX.current = e.clientX;
  };
  const up = () => {
    scene.dragging = false;
  };

  return (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute inset-x-0 bottom-0 flex h-[44%] cursor-grab touch-pan-y items-end justify-center pb-8 select-none active:cursor-grabbing md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[55%] md:pb-14"
    >
      <p className="eyebrow flex items-center gap-3" aria-hidden="true">
        <span>←</span> Drag to rotate <span>→</span>
      </p>
    </div>
  );
}

export function Hero({ use3d }: { use3d: boolean }) {
  return (
    <section id="top" data-pose="hero" aria-label="Introduction" className="relative z-10 flex min-h-svh items-start pt-28 md:items-center md:pt-0">
      {use3d ? (
        <DragZone />
      ) : (
        <div className="absolute inset-x-4 bottom-10 md:inset-x-auto md:right-8 md:bottom-auto md:w-1/2">
          <CarSilhouette className="w-full" />
        </div>
      )}

      <div className="wrap pointer-events-none relative">
        <div className="pointer-events-auto max-w-xl">
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-2 text-sector-green">
              <span className="size-2 rounded-full bg-sector-green" aria-hidden="true" />
              {profile.status}
            </span>
          </p>
          <h1 className="display mt-4 text-[clamp(4rem,17vw,10.5rem)]">
            {profile.name.first}
            <br />
            <span className="outline-text">{profile.name.last}</span>
          </h1>
          <p className="mt-5 font-mono text-sm tracking-wide text-race uppercase">{profile.role}</p>
          <p className="mt-4 max-w-md text-lg text-chalk/80">{profile.pitch}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton href="#projects">View projects</PillButton>
            <PillButton href={profile.links.resume} variant="ghost" target="_blank" rel="noreferrer">
              Résumé <span aria-hidden="true">↓</span>
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
