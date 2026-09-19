"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

function ScanRings() {
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const ringC = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ringA.current) {
      ringA.current.rotation.z += delta * 0.9;
      const s = 1 + Math.sin(t * 2) * 0.04;
      ringA.current.scale.setScalar(s);
    }
    if (ringB.current) ringB.current.rotation.z -= delta * 0.5;
    if (ringC.current) ringC.current.rotation.x += delta * 0.7;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.12;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshBasicMaterial color="#a5f3fc" toneMapped={false} />
      </mesh>

      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.014, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} toneMapped={false} />
      </mesh>

      <mesh ref={ringB} rotation={[Math.PI / 2.3, 0.3, 0]}>
        <torusGeometry args={[1.15, 0.008, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <mesh ref={ringC} rotation={[0.4, Math.PI / 2, 0]}>
        <torusGeometry args={[1.4, 0.005, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function buildParticleField(count: number) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const angles = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    radii[i] = 2.4 + Math.random() * 1.6;
    speeds[i] = 0.4 + Math.random() * 0.8;
    angles[i * 2] = Math.random() * Math.PI * 2;
    angles[i * 2 + 1] = Math.random() * Math.PI * 2;
  }
  return { positions, speeds, radii, angles };
}

function ConvergingParticles({ count = 90 }: { count?: number }) {
  const points = useRef<Points>(null);

  const { positions, speeds, radii, angles } = useMemo(() => buildParticleField(count), [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const geom = points.current?.geometry;
    if (!geom) return;
    const pos = geom.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const cycle = (t * speeds[i]) % 1.4;
      const progress = Math.min(1, cycle / 1.4);
      const r = radii[i] * (1 - progress) + 0.05 * progress;
      const theta = angles[i * 2];
      const phi = angles[i * 2 + 1];

      pos.setXYZ(
        i,
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.045} transparent opacity={0.85} sizeAttenuation toneMapped={false} />
    </points>
  );
}

export function ScanScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 3]} intensity={20} color="#22d3ee" distance={16} />
      <pointLight position={[-2, -1, -2]} intensity={10} color="#6366f1" distance={16} />
      <ScanRings />
      <ConvergingParticles />
    </Canvas>
  );
}
