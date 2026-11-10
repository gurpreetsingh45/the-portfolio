import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Car } from './Car';
import { SpeedParticles } from './SpeedParticles';
import { Track } from './track/Track';
import { Trackside } from './track/Trackside';
import { BOUNDS, LENGTH, trackFrame, type TrackFrame } from './track/layout';
import { DESKTOP, END_SECTION, MOBILE, SPIN_AMOUNT, SPIN_SECTION, type Pose } from './choreography';
import { lapSections, readLap } from '../../lib/lap';
import { scene } from '../../lib/sceneStore';
import { useIsMobile } from '../../hooks/useMediaQuery';

const { damp, clamp, smoothstep, lerp } = THREE.MathUtils;
const FOV = 35;

const KEYS = ['az', 'd', 'h', 'lf', 'lh', 'sx', 'sy', 'map', 'o'] as const;
/** The camera's idea of "forwards" is averaged over this many metres, so it swings gently through corners. */
const HEADING_WINDOW = 9 / LENGTH;
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/** Drives the car round the circuit as the page scrolls, and films it from each section's camera position. */
function Rig({ wrap, low }: { wrap: RefObject<HTMLDivElement | null>; low: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const marker = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null!);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const fog = useThree((s) => s.scene.fog) as THREE.Fog | null;
  const sections = useRef<HTMLElement[]>([]);
  const state = useRef({ lastY: 0, u: 0, started: false, cur: { ...DESKTOP.hero } });
  const tmp = useMemo(
    () => ({
      car: { x: 0, z: 0, tx: 0, tz: 0 } as TrackFrame,
      a: { x: 0, z: 0, tx: 0, tz: 0 } as TrackFrame,
      b: { x: 0, z: 0, tx: 0, tz: 0 } as TrackFrame,
      eye: new THREE.Vector3(),
      look: new THREE.Vector3(),
      mapEye: new THREE.Vector3(),
      mapLook: new THREE.Vector3(BOUNDS.cx, 0, BOUNDS.cz),
    }),
    [],
  );

  useEffect(() => {
    sections.current = lapSections();
    state.current.lastY = window.scrollY;
  }, []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const st = state.current;
    const vh = window.innerHeight;
    const mid = vh * 0.5;
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    const table = portrait ? MOBILE : DESKTOP;
    const fit = portrait ? 1 : Math.min(1, aspect / 1.7);

    // Blend through the section camera poses in page order
    const p: Pose = { ...table.hero };
    sections.current.forEach((el, i) => {
      const key = el.dataset.pose!;
      const target = table[key];
      if (!target) return;
      const rect = el.getBoundingClientRect();
      const t =
        i === 0
          ? 1
          : key === END_SECTION
            ? smoothstep((vh - rect.top) / (rect.height * 0.8), 0, 1)
            : smoothstep((mid - rect.top) / (vh * 0.8) + 0.5, 0, 1);
      if (t <= 0) return;
      for (const k of KEYS) p[k] = lerp(p[k], target[k], t);
      if (key === SPIN_SECTION) p.az += clamp((mid - rect.top) / rect.height, 0, 1) * SPIN_AMOUNT * t;
    });

    // Scroll velocity drives wheel spin and air streaks
    const y = window.scrollY;
    scene.velocity = damp(scene.velocity, (y - st.lastY) / Math.max(dt, 0.001), 6, dt);
    st.lastY = y;

    if (!scene.dragging) scene.drag = damp(scene.drag, 0, 2.5, dt);

    const k = st.started ? 4 : 1000; // snap on the very first frame
    st.started = true;
    st.u = damp(st.u, readLap(sections.current), k, dt);
    const cur = st.cur;
    for (const key of KEYS) cur[key] = damp(cur[key], p[key], k, dt);

    // Car: on the centreline, pointing along it (the model's nose is +X)
    const car = trackFrame(st.u, tmp.car);
    const g = group.current;
    g.position.set(car.x, 0, car.z);
    g.rotation.y = Math.atan2(-car.tz, car.tx);

    // Chase camera, positioned relative to a smoothed heading
    const a = trackFrame(st.u - HEADING_WINDOW, tmp.a);
    const b = trackFrame(st.u + HEADING_WINDOW, tmp.b);
    const fl = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const fx = (b.x - a.x) / fl;
    const fz = (b.z - a.z) / fl;
    const az = cur.az - scene.drag - scene.pointer.x * 0.14;
    const dist = cur.d / (portrait ? 1 : lerp(0.8, 1, fit));
    const cos = Math.cos(az) * dist;
    const sin = Math.sin(az) * dist;
    // right of travel = (-fz, fx)
    tmp.eye.set(car.x + fx * cos - fz * sin, cur.h * (1 + scene.pointer.y * 0.06), car.z + fz * cos + fx * sin);
    tmp.look.set(car.x + fx * cur.lf, cur.lh, car.z + fz * cur.lf);

    // Map camera: high above the circuit, far enough back to fit all of it (turned sideways on phones)
    const m = cur.map;
    if (m > 0.001) {
      const across = portrait ? BOUNDS.hd : BOUNDS.hw;
      const along = portrait ? BOUNDS.hw : BOUNDS.hd;
      const height = Math.max(across / (TAN_HALF_FOV * aspect), along / TAN_HALF_FOV) * 1.25;
      tmp.mapEye.set(BOUNDS.cx + (portrait ? height * 0.3 : 0), height, BOUNDS.cz + (portrait ? 0 : height * 0.3));
      tmp.eye.lerp(tmp.mapEye, m);
      tmp.look.lerp(tmp.mapLook, m);
    }
    camera.position.copy(tmp.eye);
    camera.lookAt(tmp.look);
    camera.setViewOffset(size.width, size.height, -cur.sx * fit * size.width, -cur.sy * size.height, size.width, size.height);

    // From the map view the car is tiny, so ring it
    marker.current.visible = m > 0.01;
    marker.current.material.opacity = m;
    if (fog) {
      fog.near = lerp(45, 2000, m);
      fog.far = lerp(190, 4000, m);
    }

    if (wrap.current) wrap.current.style.opacity = cur.o.toFixed(3);
  });

  return (
    <>
      <Track />
      <Trackside low={low} />
      <group ref={group}>
        <Car />
        <SpeedParticles count={low ? 28 : 64} />
        <mesh ref={marker} rotation-x={-Math.PI / 2} position-y={1.2} visible={false}>
          <ringGeometry args={[4.2, 5.6, 40]} />
          <meshBasicMaterial color="#ff2a1f" transparent depthTest={false} fog={false} />
        </mesh>
      </group>
    </>
  );
}

export default function Scene() {
  const wrap = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const [lowPower, setLowPower] = useState(false);

  // Pointer parallax (mouse) and gentle tilt (phone gyroscope, where available without a prompt)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      scene.pointer.x = clamp(e.gamma / 35, -1, 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, []);

  const maxDpr = lowPower ? 1 : mobile ? 1.5 : 2;

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh">
      <Canvas
        dpr={[1, maxDpr]}
        camera={{ fov: FOV, position: [0, 1.4, 9], near: 0.5, far: 1200 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <PerformanceMonitor onDecline={() => setLowPower(true)} />
        {/* distant track melts into the page background */}
        <fog attach="fog" args={['#0b0b0f', 45, 190]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <directionalLight position={[-6, 3, -4]} intensity={2.5} color="#ff5a4a" />
        <Environment resolution={256} frames={1}>
          <color attach="background" args={['#050507']} />
          <Lightformer form="rect" intensity={5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[7, 2, 3]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={2} position={[0, 2, 8]} rotation-y={Math.PI} scale={[10, 1.2, 1]} />
          <Lightformer form="ring" color="#ff2a1f" intensity={8} position={[-7, 1.5, -4]} rotation-y={Math.PI / 2} scale={3} />
        </Environment>
        <Rig wrap={wrap} low={mobile || lowPower} />
      </Canvas>
    </div>
  );
}
