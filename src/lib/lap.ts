import { END_SECTION, LAP, LAP_END } from '../components/three/choreography';

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** Every element that takes part in the lap, in page order. */
export function lapSections() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-pose]'));
}

/**
 * How far round the lap the page has scrolled (0 = grid, LAP_END = past the flag).
 * Each section drives the car from its own LAP stop to the next one while it crosses
 * the middle of the viewport. Shared by the 3D car and the nav minimap.
 */
export function readLap(els: HTMLElement[]) {
  const vh = window.innerHeight;
  const mid = vh * 0.5;
  let u = 0;
  els.forEach((el, i) => {
    const from = LAP[el.dataset.pose!];
    if (from === undefined) return;
    const next = els[i + 1];
    const to = (next && LAP[next.dataset.pose!]) ?? LAP_END;
    const rect = el.getBoundingClientRect();
    // a section that wraps the next stop (Contact wraps the finish spacer) ends where that stop begins
    const height = Math.max(next && el.contains(next) ? next.getBoundingClientRect().top - rect.top : rect.height, 1);
    const t =
      i === 0
        ? -rect.top / Math.max(height - mid, 1)
        : el.dataset.pose === END_SECTION
          ? (vh - rect.top) / (height * 0.8)
          : (mid - rect.top) / height;
    if (i === 0) u = from;
    u += (to - from) * clamp01(t);
  });
  return u;
}
