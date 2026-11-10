/**
 * How the lap is filmed. Sections opt in with `data-pose="<key>"`.
 *
 * LAP says where on the circuit the car is when a section starts (0 = grid, 1 = one full
 * lap). The car drives continuously from one stop to the next as that section scrolls by.
 *
 * DESKTOP / MOBILE say where the camera sits while a section is on screen:
 *   az   angle around the car (0 = head-on, PI/2 = side-on with the nose pointing right, PI = behind)
 *   d/h  distance from the car and height above the track, in metres
 *   lf/lh  look-at point: metres ahead of the car / above the track
 *   sx/sy  shift the car on screen, as a fraction of the viewport (+x right, +y down)
 *   map  0 = follow the car, 1 = overhead view of the whole circuit
 *   o    canvas opacity (keep it low behind dense text)
 *
 * This file must stay free of three.js imports: the nav minimap reads LAP from the main bundle.
 */
export type Pose = {
  az: number;
  d: number;
  h: number;
  lf: number;
  lh: number;
  sx: number;
  sy: number;
  map: number;
  o: number;
};

const TAU = Math.PI * 2;

export const LAP: Record<string, number> = {
  hero: 0, // on the grid
  about: 0.1, // through turn 1
  skills: 0.24, // esses, seen from above
  projects: 0.34,
  experience: 0.46, // the back straight
  awards: 0.68, // final complex
  contact: 0.9,
  finish: 0.97, // runs to LAP_END: across the line
};
export const LAP_END = 1.045;
/** Where the start/finish line is painted. */
export const LINE_AT = 0.03;

export const DESKTOP: Record<string, Pose> = {
  hero: { az: 0.87, d: 9.5, h: 1.5, lf: 0, lh: 0.5, sx: 0.17, sy: 0, map: 0, o: 1 },
  about: { az: 1.45, d: 12, h: 1.7, lf: 0, lh: 0.5, sx: 0.22, sy: 0, map: 0, o: 0.9 },
  skills: { az: 1.9, d: 14, h: 4, lf: 0, lh: 0.5, sx: 0, sy: 0, map: 1, o: 0.3 },
  projects: { az: 2.4, d: 8, h: 1.9, lf: 0, lh: 0.5, sx: 0, sy: 0.08, map: 0, o: 0.16 }, // + one full orbit while scrolling
  experience: { az: TAU + 2.0, d: 15, h: 2.4, lf: 3, lh: 0.5, sx: 0.26, sy: 0.1, map: 0, o: 0.45 },
  awards: { az: TAU + 2.55, d: 9.5, h: 1.1, lf: 0, lh: 0.6, sx: -0.2, sy: 0, map: 0, o: 0.75 },
  contact: { az: TAU, d: 13, h: 2.2, lf: 0, lh: 0.5, sx: 0, sy: 0.1, map: 0, o: 0.1 }, // ghost behind the form
  finish: { az: TAU, d: 10, h: 1.3, lf: 0, lh: 0.5, sx: 0, sy: 0.06, map: 0, o: 0.9 }, // head-on at the line
};

export const MOBILE: Record<string, Pose> = {
  hero: { az: 0.85, d: 19, h: 2.6, lf: 0, lh: 0.5, sx: 0, sy: 0.27, map: 0, o: 1 },
  about: { az: 1.4, d: 22, h: 2.8, lf: 0, lh: 0.5, sx: 0, sy: 0.33, map: 0, o: 0.28 },
  skills: { az: 1.9, d: 18, h: 4, lf: 0, lh: 0.5, sx: 0, sy: 0, map: 1, o: 0.22 },
  projects: { az: 2.4, d: 15, h: 2.6, lf: 0, lh: 0.5, sx: 0, sy: 0.1, map: 0, o: 0.14 },
  experience: { az: TAU + 2.0, d: 25, h: 3.4, lf: 0, lh: 0.5, sx: 0, sy: 0.2, map: 0, o: 0.3 },
  awards: { az: TAU + 2.55, d: 18, h: 2, lf: 0, lh: 0.5, sx: 0, sy: 0.33, map: 0, o: 0.25 },
  contact: { az: TAU, d: 18, h: 3, lf: 0, lh: 0.5, sx: 0, sy: 0.2, map: 0, o: 0.1 },
  finish: { az: TAU, d: 17, h: 2.2, lf: 0, lh: 0.5, sx: 0, sy: 0.15, map: 0, o: 0.9 },
};

/** The spacer at the very bottom: its pose completes as it scrolls into view. */
export const END_SECTION = 'finish';
export const SPIN_SECTION = 'projects';
export const SPIN_AMOUNT = TAU;
