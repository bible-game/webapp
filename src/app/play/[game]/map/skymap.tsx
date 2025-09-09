'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Stars() {
  const ref = useRef<THREE.Points>(null!)
  const count = 5000;

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4000 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count]);

  useFrame((_, delta) => {
    ref.current.rotation.x -= delta / 200;
    ref.current.rotation.y -= delta / 300;
  })

  return (
    <points ref={ref}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" size={3} sizeAttenuation={true} color="white" transparent={true} opacity={0.8} />
    </points>
  );
}

export default function SkyMap() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <color attach="background" args={['black']} />
      <Stars />
      <OrbitControls />
    </Canvas>
  );
}
