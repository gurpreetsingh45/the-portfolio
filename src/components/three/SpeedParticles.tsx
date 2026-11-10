import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scene } from '../../lib/sceneStore';

const RANGE = 4;

/** Streaks of air flowing past the car; they stretch and speed up with scroll velocity. */
export function SpeedParticles({ count = 60 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // deterministic pseudo-random spread
        const r = (n: number) => {
          const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
          return v - Math.floor(v);
        };
        const side = r(1) > 0.5 ? 1 : -1;
        return { x: (r(2) * 2 - 1) * RANGE, y: 0.15 + r(3) * 1.9, z: side * (1.25 + r(4) * 2.2), k: 0.6 + r(5) * 0.8 };
      }),
    [count],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const speed = 3 + Math.min(Math.abs(scene.velocity) * 0.01, 26);
    dummy.rotation.set(0, 0, Math.PI / 2); // lay the streak along the car's axis
    seeds.forEach((s, i) => {
      s.x -= speed * s.k * dt;
      if (s.x < -RANGE) s.x += RANGE * 2;
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.set(1, 0.25 + speed * 0.07 * s.k, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.006, 0.006, 1, 5]} />
      <meshBasicMaterial color="#f4f4f0" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}
