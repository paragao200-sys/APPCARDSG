
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function BackgroundParticles({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= (delta / 15) * intensity;
      ref.current.rotation.y -= (delta / 20) * intensity;
      
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * (intensity - 0.5);
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00D1FF"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.15 * intensity}
        />
      </Points>
    </group>
  );
}

export function SnowEffect({ intensity = 1 }: { intensity?: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = Math.random() * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current || !ref.current.geometry || !ref.current.geometry.attributes.position) return;
    const position = ref.current.geometry.attributes.position.array as Float32Array;
    const speed = 0.02 * intensity;
    for (let i = 0; i < 800; i++) {
      position[i * 3 + 1] -= speed;
      if (position[i * 3 + 1] < -5) position[i * 3 + 1] = 5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += 0.001 * intensity;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial transparent color="#ffffff" size={0.05 * intensity} sizeAttenuation={true} depthWrite={false} opacity={0.4 * intensity} />
    </Points>
  );
}

export function FireEffect({ intensity = 1 }: { intensity?: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current || !ref.current.geometry || !ref.current.geometry.attributes.position) return;
    const position = ref.current.geometry.attributes.position.array as Float32Array;
    const speed = 0.05 * intensity;
    for (let i = 0; i < 600; i++) {
      position[i * 3 + 1] += speed;
      if (position[i * 3 + 1] > 5) {
        position[i * 3 + 1] = -5;
        position[i * 3] = (Math.random() - 0.5) * 6 * intensity;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y -= 0.01 * intensity;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial transparent color="#FF005C" size={0.08 * intensity} sizeAttenuation={true} depthWrite={false} opacity={0.6 * intensity} />
    </Points>
  );
}

export function CyberCore() {
  const meshRef = useRef<any>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#00D1FF" wireframe emissive="#00D1FF" emissiveIntensity={1} />
    </mesh>
  );
}

export function PremiumFog({ color = "#00D1FF", intensity = 0.5 }) {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      // Concentrate particles on the sides (-4 to -6 and 4 to 6 on X axis)
      const side = Math.random() > 0.5 ? 1 : -1;
      p[i * 3] = (4 + Math.random() * 2) * side; 
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current || !ref.current.geometry || !ref.current.geometry.attributes.position) return;
    const position = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 500; i++) {
        // Subtle drift
        position[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.005;
        position[i * 3] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.z += 0.0002;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial 
        transparent 
        color={color} 
        size={0.12} 
        sizeAttenuation={true} 
        depthWrite={false} 
        opacity={0.05 * intensity} 
        blending={THREE.NormalBlending}
      />
    </Points>
  );
}
