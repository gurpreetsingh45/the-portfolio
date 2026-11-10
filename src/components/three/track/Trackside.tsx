import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { profile, sections } from '../../../data/profile';
import { LAP, LINE_AT } from '../choreography';
import { LENGTH, N, TRACK_WIDTH, trackFrame, type TrackFrame } from './layout';

const HALF = TRACK_WIDTH / 2;
/** The cameras film from the right of the car, so the scenery stands on the left as a backdrop. */
const WALL_AT = -(HALF + 2.6);
const WALL_HEIGHT = 1;
const BOARD_AT = -(HALF + 3.6);
const LIGHT_AT = -(HALF + 5);
const LIGHT_EVERY = 38; // metres
const LIGHT_HEIGHT = 11;

const frame = (u: number) => trackFrame(u, { x: 0, z: 0, tx: 0, tz: 0 });

/** Places children at a point on the lap. Inside, +X is the direction of travel and +Z is the right-hand side. */
function At({ u, offset = 0, children }: { u: number; offset?: number; children: ReactNode }) {
  const f = useMemo(() => frame(u), [u]);
  return (
    <group position={[f.x - f.tz * offset, 0, f.z + f.tx * offset]} rotation-y={Math.atan2(-f.tz, f.tx)}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pit wall: a low barrier with a red cap, all the way round            */
/* ------------------------------------------------------------------ */

function wallGeometry(y0: number, y1: number, inset: number) {
  const pos = new Float32Array(N * 6);
  const idx: number[] = [];
  const f: TrackFrame = { x: 0, z: 0, tx: 0, tz: 0 };
  for (let i = 0; i < N; i++) {
    trackFrame(i / N, f);
    const o = WALL_AT + inset;
    const x = f.x - f.tz * o;
    const z = f.z + f.tx * o;
    pos.set([x, y0, z, x, y1, z], i * 6);
    const a = i * 2;
    const b = ((i + 1) % N) * 2;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function Wall() {
  const body = useMemo(() => wallGeometry(-0.03, WALL_HEIGHT, 0), []);
  const cap = useMemo(() => wallGeometry(WALL_HEIGHT - 0.14, WALL_HEIGHT, 0.02), []);
  return (
    <>
      <mesh geometry={body}>
        <meshStandardMaterial color="#26262e" roughness={0.7} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cap}>
        <meshBasicMaterial color="#ff2a1f" side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Floodlight masts                                                     */
/* ------------------------------------------------------------------ */

function Floodlights() {
  const poles = useRef<THREE.InstancedMesh>(null!);
  const heads = useRef<THREE.InstancedMesh>(null!);
  const count = Math.floor(LENGTH / LIGHT_EVERY);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const f = frame((i + 0.5) / count);
      const x = f.x - f.tz * LIGHT_AT;
      const z = f.z + f.tx * LIGHT_AT;
      o.rotation.set(0, Math.atan2(-f.tz, f.tx), 0);
      o.position.set(x, LIGHT_HEIGHT / 2, z);
      o.updateMatrix();
      poles.current.setMatrixAt(i, o.matrix);
      // lamp bank leans out over the track
      o.position.set(x - f.tz * 0.7, LIGHT_HEIGHT, z + f.tx * 0.7);
      o.rotation.x = 0.5;
      o.updateMatrix();
      heads.current.setMatrixAt(i, o.matrix);
    }
    poles.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, count]} frustumCulled={false}>
        <cylinderGeometry args={[0.1, 0.16, LIGHT_HEIGHT, 8]} />
        <meshStandardMaterial color="#2a2a33" roughness={0.6} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[2.2, 0.5, 0.25]} />
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Start gantry over the line                                           */
/* ------------------------------------------------------------------ */

function Gantry() {
  const span = TRACK_WIDTH + 3;
  return (
    <At u={LINE_AT}>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 3, (s * span) / 2]}>
          <boxGeometry args={[0.35, 6, 0.35]} />
          <meshStandardMaterial color="#2a2a33" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.5, 0.6, span + 0.35]} />
        <meshStandardMaterial color="#2a2a33" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* five start lights, facing the grid */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <group key={i} position={[-0.3, 5.25, i * 1.15]}>
          <mesh>
            <boxGeometry args={[0.3, 0.9, 0.55]} />
            <meshStandardMaterial color="#0b0b0f" roughness={0.6} />
          </mesh>
          {[0.2, -0.2].map((y) => (
            <mesh key={y} position={[-0.16, y, 0]} rotation-y={-Math.PI / 2}>
              <circleGeometry args={[0.15, 20]} />
              <meshBasicMaterial color="#ff2a1f" toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </At>
  );
}

/* ------------------------------------------------------------------ */
/* Trackside boards                                                     */
/* ------------------------------------------------------------------ */

const BOARD_W = 7.5;
const BOARD_H = 1.9;

function drawBoard(canvas: HTMLCanvasElement, title: string, sub: string, accent: string) {
  const ctx = canvas.getContext('2d')!;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#0b0b0f';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 22, h);
  ctx.fillRect(0, h - 10, w, 10);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#a3a3af';
  ctx.font = '500 34px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(sub.toUpperCase(), 60, 70, w - 100);
  ctx.fillStyle = '#f4f4f0';
  ctx.font = 'italic 800 132px "Saira Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(title.toUpperCase(), 56, 200, w - 100);
}

function Board({ u, title, sub, accent = '#ff2a1f' }: { u: number; title: string; sub: string; accent?: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

  useEffect(() => {
    let live = true;
    const paint = () => {
      if (!live) return;
      drawBoard(texture.image as HTMLCanvasElement, title, sub, accent);
      texture.needsUpdate = true;
    };
    paint();
    // repaint once the display font has loaded
    document.fonts?.load('italic 800 132px "Saira Condensed"').then(paint, () => {});
    return () => {
      live = false;
    };
  }, [texture, title, sub, accent]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <At u={u} offset={BOARD_AT}>
      {[1, -1].map((s) => (
        <mesh key={s} position={[(s * BOARD_W) / 2.4, 1, -0.1]}>
          <boxGeometry args={[0.14, 2, 0.14]} />
          <meshStandardMaterial color="#2a2a33" roughness={0.6} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.9 + BOARD_H / 2, 0]}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </At>
  );
}

function Boards() {
  const boards = useMemo(() => {
    const out: { u: number; title: string; sub: string; accent?: string }[] = [];
    sections.forEach((s, i) => {
      const from = LAP[s.id];
      if (from === undefined) return;
      const to = LAP[sections[i + 1]?.id] ?? LAP.finish;
      if (s.id === 'projects') {
        // one board per project, spread along the projects sector
        profile.projects.forEach((p, k) => {
          out.push({
            u: from + ((k + 0.5) / profile.projects.length) * (to - from),
            title: p.title,
            sub: p.stack.join(' · '),
            accent: p.color,
          });
        });
      } else {
        out.push({ u: (from + to) / 2, title: s.label, sub: `Sector ${String(i + 1).padStart(2, '0')}` });
      }
    });
    return out;
  }, []);
  return boards.map((b) => <Board key={`${b.u}-${b.title}`} {...b} />);
}

/**
 * Everything beside the track. `low` (phones and struggling GPUs) keeps the gantry and
 * boards, which carry meaning, and drops the wall and floodlights, which are atmosphere.
 */
export function Trackside({ low }: { low: boolean }) {
  return (
    <>
      <Gantry />
      <Boards />
      {!low && <Wall />}
      {!low && <Floodlights />}
    </>
  );
}
