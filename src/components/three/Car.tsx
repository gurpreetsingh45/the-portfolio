import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { profile } from '../../data/profile';
import { scene } from '../../lib/sceneStore';

/**
 * Original open-wheel race car, modelled in code with modern single-seater proportions
 * (3.6 m wheelbase, 2 m wide, sculpted sidepods, multi-element wings, halo).
 * The car points along +X and sits on y = 0. One unit is roughly one metre.
 *
 * To use a real model later: drop a file at /public/models/car.glb and replace
 * the body of this component with drei's `useGLTF('/models/car.glb')`.
 */

type V3 = [number, number, number];

const TYRE_R = 0.36;
const AXLE_F = 1.8;
const AXLE_R = -1.8;

/* ------------------------------------------------------------------ */
/* Lofted bodywork: smooth skin stretched over a series of cross-sections */
/* ------------------------------------------------------------------ */

/** One cross-section: at `x`, half-width `w`, from height `y0` to `y1`, centred at `cz`. `n` = squareness (2 = oval). */
type Section = { x: number; w: number; y0: number; y1: number; n?: number; cz?: number };

function loft(keys: Section[], rings = 56, seg = 36) {
  const curve = (f: (k: Section) => number) =>
    new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(k.x, f(k), 0)), false, 'catmullrom', 0.5);
  const cw = curve((k) => k.w);
  const c0 = curve((k) => k.y0);
  const c1 = curve((k) => k.y1);
  const cn = curve((k) => k.n ?? 2.6);
  const cc = curve((k) => k.cz ?? 0);

  const pos: number[] = [];
  const idx: number[] = [];
  const centres: V3[] = [];

  for (let i = 0; i < rings; i++) {
    const u = i / (rings - 1);
    const x = cw.getPoint(u).x;
    const w = Math.max(cw.getPoint(u).y, 0.003);
    const y0 = c0.getPoint(u).y;
    const y1 = c1.getPoint(u).y;
    const n = Math.max(cn.getPoint(u).y, 2);
    const cz = cc.getPoint(u).y;
    const cy = (y0 + y1) / 2;
    const h = Math.max((y1 - y0) / 2, 0.003);
    centres.push([x, cy, cz]);
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      const e = 2 / (sn < 0 ? n + 1.4 : n); // flatter underside
      pos.push(x, cy + h * Math.sign(sn) * Math.abs(sn) ** e, cz + w * Math.sign(cs) * Math.abs(cs) ** e);
    }
  }
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j;
      const b = i * seg + ((j + 1) % seg);
      idx.push(a, b, a + seg, b, b + seg, a + seg);
    }
  }
  // end caps
  const first = pos.length / 3;
  pos.push(...centres[0], ...centres[rings - 1]);
  const lastRing = (rings - 1) * seg;
  for (let j = 0; j < seg; j++) {
    idx.push(first, (j + 1) % seg, j);
    idx.push(first + 1, lastRing + j, lastRing + ((j + 1) % seg));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  // Make sure the skin faces outwards (top-centre vertex must have an upward normal)
  const probe = Math.floor(rings / 2) * seg + Math.floor(seg / 4);
  if (geo.attributes.normal.getY(probe) < 0) {
    for (let k = 0; k < idx.length; k += 3) [idx[k + 1], idx[k + 2]] = [idx[k + 2], idx[k + 1]];
    geo.setIndex(idx);
    geo.computeVertexNormals();
  }
  return geo;
}

/** Nose, survival cell and gearbox as one continuous spine. */
const SPINE: Section[] = [
  { x: 2.78, w: 0.05, y0: 0.11, y1: 0.17, n: 2.4 },
  { x: 2.6, w: 0.085, y0: 0.13, y1: 0.24, n: 2.6 },
  { x: 2.25, w: 0.12, y0: 0.2, y1: 0.38, n: 2.8 },
  { x: 1.8, w: 0.16, y0: 0.29, y1: 0.52, n: 3 },
  { x: 1.25, w: 0.215, y0: 0.27, y1: 0.6, n: 3.2 },
  { x: 0.75, w: 0.27, y0: 0.15, y1: 0.645, n: 3.2 },
  { x: 0.25, w: 0.3, y0: 0.11, y1: 0.66, n: 3 },
  { x: -0.25, w: 0.3, y0: 0.11, y1: 0.7, n: 2.8 },
  { x: -0.75, w: 0.25, y0: 0.11, y1: 0.7, n: 2.6 },
  { x: -1.25, w: 0.17, y0: 0.13, y1: 0.6, n: 2.4 },
  { x: -1.8, w: 0.105, y0: 0.17, y1: 0.46, n: 2.4 },
  { x: -2.3, w: 0.06, y0: 0.22, y1: 0.36, n: 2.4 },
];

/** Roll hoop / engine air intake, tapering into the engine cover. */
const AIRBOX: Section[] = [
  { x: -0.08, w: 0.095, y0: 0.72, y1: 0.93, n: 2.6 },
  { x: -0.16, w: 0.115, y0: 0.68, y1: 0.955, n: 2.6 },
  { x: -0.55, w: 0.105, y0: 0.62, y1: 0.93, n: 2.4 },
  { x: -1.05, w: 0.065, y0: 0.56, y1: 0.8, n: 2.2 },
  { x: -1.6, w: 0.03, y0: 0.44, y1: 0.62, n: 2.2 },
  { x: -2.0, w: 0.012, y0: 0.38, y1: 0.46, n: 2.2 },
];

/** Sidepod: undercut inlet, wide shoulder, then a "coke-bottle" taper towards the gearbox. */
const sidepod = (s: number): Section[] => [
  { x: 0.64, cz: s * 0.5, w: 0.16, y0: 0.39, y1: 0.56, n: 3.6 },
  { x: 0.56, cz: s * 0.52, w: 0.205, y0: 0.35, y1: 0.6, n: 3.8 },
  { x: 0.2, cz: s * 0.55, w: 0.24, y0: 0.27, y1: 0.615, n: 3.4 },
  { x: -0.3, cz: s * 0.56, w: 0.25, y0: 0.16, y1: 0.59, n: 3 },
  { x: -0.8, cz: s * 0.5, w: 0.235, y0: 0.13, y1: 0.5, n: 2.8 },
  { x: -1.3, cz: s * 0.37, w: 0.19, y0: 0.13, y1: 0.38, n: 2.6 },
  { x: -1.85, cz: s * 0.2, w: 0.1, y0: 0.15, y1: 0.27, n: 2.4 },
];

/* ------------------------------------------------------------------ */
/* Flat parts: floor, wings, endplates                                   */
/* ------------------------------------------------------------------ */

function floorGeometry() {
  // [control x, control z, end x, end z] down one side, front to rear
  const edge: [number, number, number, number][] = [
    [1.1, 0.34, 0.86, 0.6],
    [0.7, 0.8, 0.3, 0.8],
    [-0.4, 0.8, -1.0, 0.78],
    [-1.3, 0.76, -1.42, 0.56],
    [-1.7, 0.5, -2.15, 0.5],
  ];
  const s = new THREE.Shape();
  s.moveTo(1.15, 0);
  for (const [cx, cz, x, z] of edge) s.quadraticCurveTo(cx, cz, x, z);
  s.lineTo(-2.15, -0.5);
  for (let i = edge.length - 1; i >= 0; i--) {
    const [cx, cz] = edge[i];
    const [x, z] = i > 0 ? [edge[i - 1][2], edge[i - 1][3]] : [1.15, 0];
    s.quadraticCurveTo(cx, -cz, x, -z);
  }
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 20,
  });
  geo.rotateX(Math.PI / 2);
  return geo;
}

/**
 * A wing element: aerofoil section swept across `span`.
 * Leading edge at the origin, trailing edge `chord` behind and `rise` higher.
 * `sweep` pulls the tips rearwards, `lift` raises them.
 */
function wingGeometry(chord: number, rise: number, span: number, sweep = 0, lift = 0) {
  const t = chord * 0.11;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(-chord * 0.5, -t * 0.5, -chord, rise);
  s.lineTo(-chord, rise + t * 0.25);
  s.quadraticCurveTo(-chord * 0.45, rise * 0.25 + t * 1.2, -chord * 0.06, t * 0.9);
  s.quadraticCurveTo(chord * 0.02, t * 0.5, 0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: span, steps: 16, bevelEnabled: false, curveSegments: 10 });
  geo.translate(0, 0, -span / 2);
  if (sweep || lift) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const k = Math.abs(pos.getZ(i)) / (span / 2);
      pos.setX(i, pos.getX(i) - sweep * k ** 1.5);
      pos.setY(i, pos.getY(i) + lift * k ** 2);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

function plateGeometry(build: (s: THREE.Shape) => void, thickness: number) {
  const s = new THREE.Shape();
  build(s);
  const geo = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: 16 });
  geo.translate(0, 0, -thickness / 2);
  return geo;
}

const frontEndplate = () =>
  plateGeometry((s) => {
    s.moveTo(2.64, 0.045);
    s.lineTo(2.06, 0.045);
    s.quadraticCurveTo(2.0, 0.2, 2.03, 0.34);
    s.quadraticCurveTo(2.42, 0.33, 2.62, 0.12);
    s.quadraticCurveTo(2.66, 0.08, 2.64, 0.045);
  }, 0.012);

const rearEndplate = () =>
  plateGeometry((s) => {
    s.moveTo(-2.24, 0.97);
    s.lineTo(-2.84, 1.0);
    s.lineTo(-2.84, 0.56);
    s.quadraticCurveTo(-2.8, 0.3, -2.58, 0.27);
    s.lineTo(-2.4, 0.27);
    s.quadraticCurveTo(-2.2, 0.55, -2.24, 0.97);
  }, 0.014);

const sharkFin = () =>
  plateGeometry((s) => {
    s.moveTo(-0.7, 0.9);
    s.quadraticCurveTo(-1.5, 0.84, -2.02, 0.6);
    s.lineTo(-2.0, 0.42);
    s.lineTo(-0.7, 0.7);
    s.closePath();
  }, 0.012);

const diffuser = () =>
  plateGeometry((s) => {
    s.moveTo(-1.7, 0.07);
    s.lineTo(-2.28, 0.07);
    s.lineTo(-2.28, 0.3);
    s.quadraticCurveTo(-1.95, 0.2, -1.7, 0.1);
    s.closePath();
  }, 0.96);

/* ------------------------------------------------------------------ */
/* Wheels                                                                */
/* ------------------------------------------------------------------ */

function tyreGeometry(width: number) {
  const h = width / 2;
  const sh = 0.055;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.232, -h * 0.84), new THREE.Vector2(0.262, -h * 0.98)];
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(TYRE_R - sh + Math.cos(a) * sh, -h + sh + Math.sin(a) * sh));
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(TYRE_R - sh + Math.cos(a) * sh, h - sh + Math.sin(a) * sh));
  }
  pts.push(new THREE.Vector2(0.262, h * 0.98), new THREE.Vector2(0.232, h * 0.84));
  const geo = new THREE.LatheGeometry(pts, 56);
  geo.rotateX(Math.PI / 2); // axle along Z, outer face towards +Z
  return geo;
}

/** Rim with a gently dished aero cover on the outer face. */
function rimGeometry(width: number) {
  const h = width / 2;
  const pts = [
    [0.001, -h * 0.86], [0.236, -h * 0.86], [0.236, h * 0.86], [0.222, h * 0.9],
    [0.2, h * 0.84], [0.07, h * 0.66], [0.001, h * 0.66],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Textures                                                              */
/* ------------------------------------------------------------------ */

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.8)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function numberTexture(text: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f4f4f0';
  ctx.font = 'italic 800 170px "Saira Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 104);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Small parts                                                           */
/* ------------------------------------------------------------------ */

function Rod({ a, b, r = 0.012, material }: { a: V3; b: V3; r?: number; material: THREE.Material }) {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(ax, ay, az);
    const vb = new THREE.Vector3(bx, by, bz);
    const dir = vb.clone().sub(va);
    const length = dir.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: va.add(vb).multiplyScalar(0.5), quaternion, length };
  }, [ax, ay, az, bx, by, bz]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[r, r, length, 8]} />
    </mesh>
  );
}

function tube(points: V3[], radius: number, segments = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, segments, radius, 10);
}

const WHEELS = [
  { x: AXLE_F, side: 1, z: 0.845, w: 0.31 },
  { x: AXLE_F, side: -1, z: 0.845, w: 0.31 },
  { x: AXLE_R, side: 1, z: 0.795, w: 0.41 },
  { x: AXLE_R, side: -1, z: 0.795, w: 0.41 },
];

export function Car() {
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const target = useMemo(() => new THREE.Color(), []);

  const mat = useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({
        color: scene.accent, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08,
      }),
      carbon: new THREE.MeshStandardMaterial({ color: '#0e0e12', metalness: 0.55, roughness: 0.42 }),
      matte: new THREE.MeshStandardMaterial({ color: '#050506', metalness: 0.1, roughness: 0.85 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#0a0a0b', metalness: 0, roughness: 0.82 }),
      rim: new THREE.MeshStandardMaterial({ color: '#3a3a42', metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide }),
      metal: new THREE.MeshStandardMaterial({ color: '#8d8d96', metalness: 1, roughness: 0.3 }),
      marking: new THREE.MeshBasicMaterial({ color: '#e9e9e4' }),
      helmet: new THREE.MeshPhysicalMaterial({ color: '#f2c230', metalness: 0.2, roughness: 0.25, clearcoat: 1 }),
      visor: new THREE.MeshPhysicalMaterial({ color: '#050508', metalness: 0.9, roughness: 0.08, clearcoat: 1 }),
      light: new THREE.MeshBasicMaterial({ color: '#ff2a1f' }),
      number: new THREE.MeshBasicMaterial({ map: numberTexture(profile.carNumber), transparent: true, depthWrite: false }),
      shadow: new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
    }),
    [],
  );

  const geo = useMemo(
    () => ({
      spine: loft(SPINE, 72, 40),
      airbox: loft(AIRBOX, 40, 28),
      podL: loft(sidepod(1), 56, 36),
      podR: loft(sidepod(-1), 56, 36),
      floor: floorGeometry(),
      diffuser: diffuser(),
      fin: sharkFin(),
      // front wing: four stacked elements, swept back towards the tips
      fw: [
        wingGeometry(0.27, 0.02, 1.9, 0.2, 0.01),
        wingGeometry(0.21, 0.05, 1.9, 0.2, 0.012),
        wingGeometry(0.18, 0.07, 1.9, 0.2, 0.014),
        wingGeometry(0.15, 0.085, 1.9, 0.2, 0.016),
      ],
      fwPlate: frontEndplate(),
      rwMain: wingGeometry(0.36, 0.09, 1.02),
      rwFlap: wingGeometry(0.21, 0.12, 1.02),
      beam: wingGeometry(0.16, 0.05, 0.82),
      rwPlate: rearEndplate(),
      swanNeck: tube([[-1.9, 0.44, 0], [-2.12, 0.74, 0], [-2.3, 0.9, 0], [-2.44, 0.86, 0], [-2.46, 0.79, 0]], 0.02),
      halo: tube(
        [[-0.16, 0.7, 0.28], [0.14, 0.81, 0.27], [0.42, 0.855, 0.19], [0.57, 0.86, 0],
         [0.42, 0.855, -0.19], [0.14, 0.81, -0.27], [-0.16, 0.7, -0.28]],
        0.028, 48,
      ),
      tyreF: tyreGeometry(0.31),
      tyreR: tyreGeometry(0.41),
      rimF: rimGeometry(0.31),
      rimR: rimGeometry(0.41),
    }),
    [],
  );

  useFrame((_, dt) => {
    // Wheels: gentle idle spin, faster with scroll speed
    const spin = (3 + Math.min(Math.abs(scene.velocity) * 0.012, 40)) * Math.min(dt, 0.05);
    wheels.current.forEach((w, i) => {
      if (w) w.rotation.z -= spin * WHEELS[i].side;
    });
    // Livery follows the currently highlighted project
    mat.paint.color.lerp(target.set(scene.accent), 1 - Math.exp(-6 * dt));
  });

  return (
    <group>
      {/* soft contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} material={mat.shadow}>
        <planeGeometry args={[7.8, 3.6]} />
      </mesh>

      {/* ---------- bodywork ---------- */}
      <mesh geometry={geo.spine} material={mat.paint} />
      <mesh geometry={geo.airbox} material={mat.paint} />
      <mesh geometry={geo.podL} material={mat.paint} />
      <mesh geometry={geo.podR} material={mat.paint} />
      <mesh geometry={geo.fin} material={mat.carbon} />
      <mesh geometry={geo.floor} material={mat.carbon} position={[0, 0.09, 0]} />
      <mesh geometry={geo.diffuser} material={mat.carbon} />

      {/* intakes */}
      <mesh material={mat.matte} position={[-0.072, 0.825, 0]} rotation-y={Math.PI / 2} scale={[0.075, 0.085, 1]}>
        <circleGeometry args={[1, 24]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} material={mat.matte} position={[0.648, 0.475, s * 0.5]} rotation-y={Math.PI / 2} scale={[0.135, 0.065, 1]}>
          <circleGeometry args={[1, 24]} />
        </mesh>
      ))}

      {/* cockpit opening, helmet, halo, mirrors */}
      <mesh material={mat.matte} position={[0.3, 0.655, 0]} scale={[0.4, 0.045, 0.2]}>
        <sphereGeometry args={[1, 28, 16]} />
      </mesh>
      <mesh material={mat.helmet} position={[0.1, 0.725, 0]}>
        <sphereGeometry args={[0.122, 28, 20]} />
      </mesh>
      <mesh material={mat.visor} position={[0.145, 0.735, 0]} scale={[1, 0.42, 1.04]}>
        <sphereGeometry args={[0.092, 24, 16]} />
      </mesh>
      <mesh geometry={geo.halo} material={mat.carbon} />
      <Rod a={[0.565, 0.86, 0]} b={[0.84, 0.625, 0]} r={0.026} material={mat.carbon} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={mat.carbon} position={[0.66, 0.705, s * 0.43]} scale={[0.028, 0.034, 0.075]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <Rod a={[0.64, 0.62, s * 0.26]} b={[0.66, 0.7, s * 0.4]} r={0.008} material={mat.carbon} />
        </group>
      ))}
      {/* on-board camera and nose antenna */}
      <mesh material={mat.carbon} position={[-0.32, 0.965, 0]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.018, 0.1, 4, 10]} />
      </mesh>
      <Rod a={[1.3, 0.59, 0]} b={[1.3, 0.67, 0]} r={0.004} material={mat.metal} />

      {/* ---------- front wing ---------- */}
      <mesh geometry={geo.fw[0]} material={mat.carbon} position={[2.84, 0.055, 0]} />
      <mesh geometry={geo.fw[1]} material={mat.carbon} position={[2.62, 0.085, 0]} />
      <mesh geometry={geo.fw[2]} material={mat.paint} position={[2.45, 0.145, 0]} />
      <mesh geometry={geo.fw[3]} material={mat.carbon} position={[2.3, 0.22, 0]} />
      {[1, -1].map((s) => (
        <mesh key={s} geometry={geo.fwPlate} material={mat.carbon} position={[0, 0, s * 0.955]} />
      ))}

      {/* ---------- rear wing ---------- */}
      <mesh geometry={geo.rwMain} material={mat.carbon} position={[-2.28, 0.72, 0]} />
      <mesh geometry={geo.rwFlap} material={mat.paint} position={[-2.62, 0.835, 0]} />
      <mesh geometry={geo.beam} material={mat.carbon} position={[-2.36, 0.4, 0]} />
      <mesh geometry={geo.beam} material={mat.carbon} position={[-2.5, 0.47, 0]} />
      <mesh geometry={geo.swanNeck} material={mat.carbon} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.rwPlate} material={mat.carbon} position={[0, 0, s * 0.515]} />
          <mesh material={mat.number} position={[-2.56, 0.66, s * 0.525]} rotation-y={s > 0 ? 0 : Math.PI}>
            <planeGeometry args={[0.36, 0.27]} />
          </mesh>
        </group>
      ))}
      {/* rain light */}
      <mesh material={mat.light} position={[-2.32, 0.3, 0]}>
        <capsuleGeometry args={[0.016, 0.07, 4, 8]} />
      </mesh>

      {/* ---------- wheels + suspension ---------- */}
      {WHEELS.map((w, i) => {
        const s = w.side;
        const half = w.w / 2;
        const front = w.x > 0;
        const hubZ = s * (w.z - half + 0.02);
        const inner: Record<'topA' | 'topB' | 'lowA' | 'lowB', V3> = front
          ? { topA: [2.08, 0.5, s * 0.14], topB: [1.45, 0.53, s * 0.19], lowA: [2.08, 0.31, s * 0.12], lowB: [1.42, 0.3, s * 0.2] }
          : { topA: [-1.48, 0.45, s * 0.14], topB: [-2.08, 0.4, s * 0.07], lowA: [-1.42, 0.2, s * 0.17], lowB: [-2.08, 0.23, s * 0.07] };
        const top: V3 = [w.x, 0.5, hubZ];
        const low: V3 = [w.x, 0.21, hubZ];
        return (
          <group key={i}>
            <group position={[w.x, TYRE_R, s * w.z]} rotation-y={s > 0 ? 0 : Math.PI}>
              <group ref={(el) => { wheels.current[i] = el; }}>
                <mesh geometry={front ? geo.tyreF : geo.tyreR} material={mat.rubber} />
                <mesh geometry={front ? geo.rimF : geo.rimR} material={mat.rim} />
                {/* wheel nut */}
                <mesh material={mat.metal} position={[0, 0, half * 0.66 + 0.012]} rotation-x={Math.PI / 2}>
                  <cylinderGeometry args={[0.032, 0.036, 0.03, 6]} />
                </mesh>
                {/* sidewall markings (also make the spin readable) */}
                {[0, Math.PI].map((r) => (
                  <mesh key={r} material={mat.marking} position={[0, 0, half - 0.004]} rotation-z={r}>
                    <torusGeometry args={[0.3, 0.006, 6, 24, 0.9]} />
                  </mesh>
                ))}
              </group>
            </group>
            <Rod a={inner.topA} b={top} material={mat.carbon} />
            <Rod a={inner.topB} b={top} material={mat.carbon} />
            <Rod a={inner.lowA} b={low} material={mat.carbon} />
            <Rod a={inner.lowB} b={low} material={mat.carbon} />
            {front ? (
              <Rod a={[1.72, 0.53, s * 0.16]} b={[w.x, 0.24, hubZ]} r={0.014} material={mat.carbon} />
            ) : (
              <Rod a={[w.x, TYRE_R, s * 0.09]} b={[w.x, TYRE_R, hubZ]} r={0.02} material={mat.metal} />
            )}
          </group>
        );
      })}
    </group>
  );
}
