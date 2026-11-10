/**
 * The circuit, as plain data. Both the 3D track and the nav minimap are generated from
 * this file, so they always show the same shape. No three.js imports here: the minimap
 * lives in the main bundle and the 3D scene is code-split.
 *
 * Top view, in metres: +x is right, +z is towards the bottom of the map. The lap runs
 * clockwise and starts at the first point, heading +x along the start/finish straight.
 * To reshape the circuit, edit POINTS; everything else follows.
 */
const POINTS: [number, number][] = [
  [-10, -40], // grid
  [20, -40],
  [44, -40],
  [62, -35], // turn 1
  [72, -22],
  [68, -7],
  [54, 0],
  [43, 10], // esses
  [42, 23],
  [49, 33],
  [61, 39],
  [69, 48],
  [67, 59],
  [55, 64],
  [38, 64], // back straight
  [18, 64],
  [-10, 64],
  [-38, 64],
  [-59, 60],
  [-73, 46], // final complex
  [-78, 29],
  [-70, 11],
  [-62, -2],
  [-63, -17],
  [-58, -31],
  [-45, -39],
  [-28, -40],
];

/** Full width of the racing surface. */
export const TRACK_WIDTH = 10;
/** Number of evenly spaced centreline samples. */
export const N = 900;

function catmullRom(a: number, b: number, c: number, d: number, t: number) {
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
}

function build() {
  // 1. Dense closed spline through the control points
  const STEPS = 48;
  const count = POINTS.length;
  const dense: number[] = [];
  for (let i = 0; i < count; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((o) => POINTS[(i + o + count) % count]);
    for (let s = 0; s < STEPS; s++) {
      const t = s / STEPS;
      dense.push(catmullRom(p0[0], p1[0], p2[0], p3[0], t), catmullRom(p0[1], p1[1], p2[1], p3[1], t));
    }
  }
  // 2. Cumulative distance around the loop
  const m = dense.length / 2;
  const dist = [0];
  for (let i = 1; i <= m; i++) {
    const a = (i - 1) * 2;
    const b = (i % m) * 2;
    dist.push(dist[i - 1] + Math.hypot(dense[b] - dense[a], dense[b + 1] - dense[a + 1]));
  }
  const length = dist[m];
  // 3. Resample so that equal steps in `u` are equal distances on track
  const samples = new Float32Array(N * 2);
  let j = 0;
  for (let i = 0; i < N; i++) {
    const target = (i / N) * length;
    while (dist[j + 1] < target) j++;
    const f = (target - dist[j]) / (dist[j + 1] - dist[j]);
    const a = j * 2;
    const b = ((j + 1) % m) * 2;
    samples[i * 2] = dense[a] + (dense[b] - dense[a]) * f;
    samples[i * 2 + 1] = dense[a + 1] + (dense[b + 1] - dense[a + 1]) * f;
  }
  return { samples, length };
}

const built = build();

/** Centreline as [x0, z0, x1, z1, ...], evenly spaced by distance. */
export const SAMPLES = built.samples;
/** Lap length in metres. */
export const LENGTH = built.length;

const wrap = (i: number) => ((i % N) + N) % N;

export type TrackFrame = { x: number; z: number; tx: number; tz: number };

/**
 * Position and unit heading at lap fraction `u` (any real number; it wraps).
 * Writes into `out` so it can be called every frame without allocating.
 */
export function trackFrame(u: number, out: TrackFrame): TrackFrame {
  const f = (u - Math.floor(u)) * N;
  const i0 = Math.floor(f) % N;
  const i1 = wrap(i0 + 1);
  const k = f - Math.floor(f);
  const S = SAMPLES;
  out.x = S[i0 * 2] + (S[i1 * 2] - S[i0 * 2]) * k;
  out.z = S[i0 * 2 + 1] + (S[i1 * 2 + 1] - S[i0 * 2 + 1]) * k;
  // heading: blend the central-difference tangents of the two neighbouring samples
  const a = wrap(i0 - 1);
  const b = wrap(i1 + 1);
  const tx = (S[i1 * 2] - S[a * 2]) * (1 - k) + (S[b * 2] - S[i0 * 2]) * k;
  const tz = (S[i1 * 2 + 1] - S[a * 2 + 1]) * (1 - k) + (S[b * 2 + 1] - S[i0 * 2 + 1]) * k;
  const len = Math.hypot(tx, tz) || 1;
  out.tx = tx / len;
  out.tz = tz / len;
  return out;
}

/** Bounding box of the circuit: centre and half-extents. */
export const BOUNDS = (() => {
  let x0 = Infinity;
  let x1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  for (let i = 0; i < N; i++) {
    x0 = Math.min(x0, SAMPLES[i * 2]);
    x1 = Math.max(x1, SAMPLES[i * 2]);
    z0 = Math.min(z0, SAMPLES[i * 2 + 1]);
    z1 = Math.max(z1, SAMPLES[i * 2 + 1]);
  }
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hw: (x1 - x0) / 2, hd: (z1 - z0) / 2 };
})();

/** Scale and centre the circuit inside a `size` x `size` viewBox. */
function fit(size: number, pad: number) {
  const s = (size - pad * 2) / (2 * Math.max(BOUNDS.hw, BOUNDS.hd));
  return { s, ox: size / 2 - BOUNDS.cx * s, oy: size / 2 - BOUNDS.cz * s };
}

/**
 * The circuit as an SVG path that fits a `size` x `size` viewBox.
 * Pass lap fractions `from`/`to` to get just one stretch of it.
 */
export function minimapPath(size = 48, pad = 5, from = 0, to = 1) {
  const { s, ox, oy } = fit(size, pad);
  const whole = from <= 0 && to >= 1;
  const i0 = Math.round(from * N);
  const i1 = whole ? N - 1 : Math.round(to * N);
  let d = '';
  for (let i = i0; i <= i1; i += 3) {
    const k = wrap(i);
    d += `${d ? 'L' : 'M'}${(ox + SAMPLES[k * 2] * s).toFixed(2)} ${(oy + SAMPLES[k * 2 + 1] * s).toFixed(2)}`;
  }
  return whole ? `${d}Z` : d;
}

const scratch: TrackFrame = { x: 0, z: 0, tx: 0, tz: 0 };

/** Where lap fraction `u` falls on that same minimap. */
export function minimapPoint(u: number, size = 48, pad = 5) {
  const { s, ox, oy } = fit(size, pad);
  trackFrame(u, scratch);
  return { x: ox + scratch.x * s, y: oy + scratch.z * s };
}
