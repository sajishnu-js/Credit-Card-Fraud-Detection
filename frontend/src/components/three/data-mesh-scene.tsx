"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

function buildMesh(count: number, radius: number, connectDistance: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const dist = radius * (0.55 + Math.random() * 0.45);
    points.push(dir.multiplyScalar(dist));
  }

  const linePositions: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < connectDistance) {
        linePositions.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
      }
    }
  }

  const pointPositions = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    pointPositions[i * 3] = p.x;
    pointPositions[i * 3 + 1] = p.y;
    pointPositions[i * 3 + 2] = p.z;
  });

  return { pointPositions, linePositions: new Float32Array(linePositions) };
}

function NetworkShell() {
  const group = useRef<Group>(null);
  const autoRotation = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });

  const { pointPositions, linePositions } = useMemo(() => buildMesh(42, 2.9, 1.15), []);

  useFrame((state, delta) => {
    autoRotation.current += delta * 0.045;
    tilt.current.x += (state.pointer.y * 0.18 - tilt.current.x) * 0.03;
    tilt.current.y += (state.pointer.x * 0.22 - tilt.current.y) * 0.03;

    if (group.current) {
      group.current.rotation.y = autoRotation.current + tilt.current.y;
      group.current.rotation.x = tilt.current.x;
    }
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.16} toneMapped={false} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#7dd3fc" size={0.05} transparent opacity={0.8} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  );
}

export function DataMeshScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
      }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 3, 4]} intensity={16} color="#22d3ee" distance={20} />
      <pointLight position={[-4, -2, -2]} intensity={9} color="#6366f1" distance={20} />

      <NetworkShell />

      <Sparkles count={50} scale={[9, 6, 9]} size={1.3} speed={0.2} color="#7dd3fc" opacity={0.3} />
    </Canvas>
  );
}
