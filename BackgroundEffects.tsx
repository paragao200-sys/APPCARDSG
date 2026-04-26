import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function BackgroundParticles({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= (delta / 20) * intensity;
      ref.current.rotation.y -= (delta / 25) * intensity;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#0088ff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.2 * intensity}
        />
      </Points>
    </group>
  );
}

export function PremiumFog({ color = "#0088ff", intensity = 0.5 }) {
  const points = useMemo(() => {
    const p = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      p[i * 3] = (1.5 + Math.random() * 2) * side; 
      p[i * 3 + 1] = (Math.random() - 0.5) * 8;
      p[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current || !ref.current.geometry.attributes.position) return;
    const position = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 400; i++) {
      position[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.003;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial transparent color={color} size={0.15} sizeAttenuation depthWrite={false} opacity={0.08 * intensity} />
    </Points>
  );
}
