"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { Mesh } from "three";
import * as THREE from "three";

function NeuralCore() {
  const wireframe = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (wireframe.current) wireframe.current.rotation.y += delta * 0.12;
    if (shell.current) shell.current.rotation.y -= delta * 0.2;
    if (core.current) core.current.rotation.y += delta * 0.4;
    if (ringA.current) {
      ringA.current.rotation.x += delta * 0.22;
      ringA.current.rotation.y += delta * 0.09;
    }
    if (ringB.current) {
      ringB.current.rotation.z -= delta * 0.16;
      ringB.current.rotation.y -= delta * 0.11;
    }
  });

  return (
    <group>
      {/* inner glowing gem - unlit so it always reads as a saturated light source */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#a5f3fc" toneMapped={false} />
      </mesh>

      {/* faceted crystalline shell */}
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.5}>
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.85, 1]} />
          <MeshDistortMaterial
            color="#062933"
            emissive="#22d3ee"
            emissiveIntensity={0.75}
            distort={0.25}
            speed={1.4}
            roughness={0.15}
            metalness={0.75}
            flatShading
            transparent
            opacity={0.94}
          />
        </mesh>
      </Float>

      {/* outer wireframe geodesic cage */}
      <mesh ref={wireframe}>
        <icosahedronGeometry args={[1.24, 1]} />
        <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.32} toneMapped={false} />
      </mesh>

      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.8, 0.006, 16, 180]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      <mesh ref={ringB} rotation={[Math.PI / 3.2, Math.PI / 5, 0]}>
        <torusGeometry args={[2.1, 0.004, 16, 180]} />
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function OrbScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <ambientLight intensity={0.18} />
      <pointLight position={[3.2, 2.4, 3.6]} intensity={26} color="#22d3ee" distance={20} />
      <pointLight position={[-3, -1.6, -1.5]} intensity={10} color="#6366f1" distance={20} />
      <pointLight position={[0, 0, -3]} intensity={8} color="#38bdf8" distance={16} />

      <NeuralCore />

      <Sparkles count={70} scale={[5.5, 5.5, 5.5]} size={1.4} speed={0.25} color="#7dd3fc" opacity={0.6} />
    </Canvas>
  );
}
