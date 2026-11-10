import { useMemo } from 'react';
import * as THREE from 'three';
import { LENGTH, N, SAMPLES, TRACK_WIDTH, trackFrame, type TrackFrame } from './layout';
import { LINE_AT } from '../choreography';

const HALF = TRACK_WIDTH / 2;
const WHITE = new THREE.Color('#f4f4f0');
const RED = new THREE.Color('#ff2a1f');
const DARK = new THREE.Color('#0b0b0f');

/** Corners tighter than this radius (metres) get kerbs. */
const KERB_RADIUS = 45;
const KERB_WIDTH = 1.1;
const KERB_BLOCK = 2; // metres per red or white block

/** The racing surface: a flat ribbon following the centreline. */
function asphaltGeometry() {
  const pos = new Float32Array(N * 6);
  const idx: number[] = [];
  const f: TrackFrame = { x: 0, z: 0, tx: 0, tz: 0 };
  for (let i = 0; i < N; i++) {
    trackFrame(i / N, f);
    // right of travel = (-tz, tx)
    pos.set([f.x + f.tz * HALF, 0, f.z - f.tx * HALF, f.x - f.tz * HALF, 0, f.z + f.tx * HALF], i * 6);
    const a = i * 2;
    const b = ((i + 1) % N) * 2;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Everything painted on or beside the surface, merged into one vertex-coloured mesh. */
function paintGeometry() {
  const pos: number[] = [];
  const col: number[] = [];
  const fa: TrackFrame = { x: 0, z: 0, tx: 0, tz: 0 };
  const fb: TrackFrame = { x: 0, z: 0, tx: 0, tz: 0 };

  /** A quad between lap fractions u0..u1, spanning lateral offsets o0..o1 (metres, + = right of travel). */
  const quad = (u0: number, u1: number, o0: number, o1: number, c: THREE.Color) => {
    trackFrame(u0, fa);
    trackFrame(u1, fb);
    const ax = (o: number) => fa.x - fa.tz * o;
    const az = (o: number) => fa.z + fa.tx * o;
    const bx = (o: number) => fb.x - fb.tz * o;
    const bz = (o: number) => fb.z + fb.tx * o;
    pos.push(ax(o0), 0, az(o0), ax(o1), 0, az(o1), bx(o0), 0, bz(o0));
    pos.push(bx(o0), 0, bz(o0), ax(o1), 0, az(o1), bx(o1), 0, bz(o1));
    for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
  };
  const m = (metres: number) => metres / LENGTH;

  // White edge lines, all the way round
  for (let i = 0; i < N; i++) {
    const u0 = i / N;
    const u1 = (i + 1) / N;
    quad(u0, u1, HALF - 0.4, HALF - 0.2, WHITE);
    quad(u0, u1, -HALF + 0.2, -HALF + 0.4, WHITE);
  }

  // Red/white kerbs on the inside of every corner
  const heading = (i: number) => {
    const a = ((i % N) + N) % N;
    const b = (a + 1) % N;
    return Math.atan2(SAMPLES[b * 2 + 1] - SAMPLES[a * 2 + 1], SAMPLES[b * 2] - SAMPLES[a * 2]);
  };
  const step = LENGTH / N;
  for (let i = 0; i < N; i++) {
    let turn = heading(i + 4) - heading(i - 4);
    while (turn > Math.PI) turn -= Math.PI * 2;
    while (turn < -Math.PI) turn += Math.PI * 2;
    const curvature = turn / (8 * step); // + = turning right
    if (Math.abs(curvature) < 1 / KERB_RADIUS) continue;
    const side = Math.sign(curvature);
    const c = Math.floor((i * step) / KERB_BLOCK) % 2 ? RED : WHITE;
    quad(i / N, (i + 1) / N, side * (HALF - 0.15), side * (HALF + KERB_WIDTH), c);
  }

  // Start/finish line: two rows of chequers
  const COLS = 10;
  const cell = TRACK_WIDTH / COLS;
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < COLS; c++) {
      const u0 = LINE_AT + m(row * cell);
      quad(u0, u0 + m(cell), -HALF + c * cell, -HALF + (c + 1) * cell, (row + c) % 2 ? WHITE : DARK);
    }
  }

  // Grid slots: pole on the centreline where the car starts, the rest staggered behind it
  const slot = (u: number, offset: number) => {
    quad(u, u + m(0.18), offset - 1.3, offset + 1.3, WHITE);
    quad(u - m(1.2), u, offset - 1.3, offset - 1.12, WHITE);
    quad(u - m(1.2), u, offset + 1.12, offset + 1.3, WHITE);
  };
  slot(m(3.3), 0);
  for (let k = 1; k <= 7; k++) slot(m(3.3 - k * 8), k % 2 ? 2.6 : -2.6);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

/** The circuit the car laps. Built once from the shared layout; two draw calls. */
export function Track() {
  const asphalt = useMemo(asphaltGeometry, []);
  const paint = useMemo(paintGeometry, []);

  return (
    <group>
      <mesh geometry={asphalt} position-y={-0.03}>
        <meshStandardMaterial color="#1b1b22" roughness={0.5} metalness={0.15} envMapIntensity={0.7} />
      </mesh>
      {/* unlit so the lines still read when the canvas is faded behind text */}
      <mesh geometry={paint} position-y={-0.02}>
        <meshBasicMaterial vertexColors polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  );
}
