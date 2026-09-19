"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import type { Points } from "three";
import { subscribeSignal, type SignalOutcome } from "@/lib/signal-bus";

const WIDTH = 8;
const SEGMENTS = 140;
const MAX_PULSES = 10;
const TRAVEL_DURATION = 1.6;
const SPIKE_HEIGHT = 0.08;
const IDLE_COLOR = new THREE.Color("#22d3ee");
const OFFLINE_COLOR = new THREE.Color("#64748b");

interface PulseSlot {
  spawnTime: number;
  color: THREE.Color;
  active: boolean;
}

function outcomeColor(outcome: SignalOutcome) {
  if (outcome === "fraud") return new THREE.Color("#fb7185");
  if (outcome === "error") return new THREE.Color("#fbbf24");
  return new THREE.Color("#34d399");
}

function buildWaveLine() {
  const positions = new Float32Array((SEGMENTS + 1) * 3);
  for (let i = 0; i <= SEGMENTS; i++) {
    positions[i * 3] = (i / SEGMENTS - 0.5) * WIDTH;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    transparent: true,
    toneMapped: false,
  });
  return new THREE.Line(geometry, material);
}

/** Tracks real prediction events (from the signal bus) and animates them as pulses
 * traveling across the wave line — the strip goes flat/dim when the API is offline. */
function SignalWave({ online }: { online: boolean }) {
  const lineRef = useRef<THREE.Line | null>(null);
  const pointsRef = useRef<Points>(null);
  const lineObject = useMemo(() => buildWaveLine(), []);

  const onlineRef = useRef(online);
  useEffect(() => {
    onlineRef.current = online;
  }, [online]);

  const pulses = useRef<PulseSlot[]>(
    Array.from({ length: MAX_PULSES }, () => ({
      spawnTime: -100,
      color: new THREE.Color(),
      active: false,
    }))
  );
  const pendingQueue = useRef<SignalOutcome[]>([]);
  const cursor = useRef(0);

  const pointPositions = useMemo(() => new Float32Array(MAX_PULSES * 3), []);
  const pointColors = useMemo(() => new Float32Array(MAX_PULSES * 3), []);

  useEffect(() => {
    return subscribeSignal((event) => {
      pendingQueue.current.push(event.outcome);
    });
  }, []);

  useFrame((state) => {
    const line = lineRef.current;
    if (!line) return;

    const t = state.clock.elapsedTime;
    const isOnline = onlineRef.current;

    while (pendingQueue.current.length > 0) {
      const outcome = pendingQueue.current.shift()!;
      const idx = cursor.current % MAX_PULSES;
      cursor.current += 1;
      pulses.current[idx] = {
        spawnTime: t,
        color: outcomeColor(outcome),
        active: true,
      };
    }

    const linePos = line.geometry.attributes.position as THREE.BufferAttribute;
    const idleAmplitude = isOnline ? 0.045 : 0;

    for (let i = 0; i <= SEGMENTS; i++) {
      const x = linePos.getX(i);
      let y = Math.sin(x * 1.6 + t * 1.6) * idleAmplitude;

      for (const pulse of pulses.current) {
        if (!pulse.active) continue;
        const elapsed = t - pulse.spawnTime;
        if (elapsed > TRAVEL_DURATION) continue;
        const travelX = -WIDTH / 2 + (elapsed / TRAVEL_DURATION) * WIDTH;
        const dist = Math.abs(x - travelX);
        const spike = Math.max(0, 1 - dist * 6) * SPIKE_HEIGHT;
        if (spike > y) y = spike;
      }
      linePos.setY(i, y);
    }
    linePos.needsUpdate = true;

    const lineColor = isOnline ? IDLE_COLOR : OFFLINE_COLOR;
    const lineMaterial = line.material as THREE.LineBasicMaterial;
    lineMaterial.color.copy(lineColor);
    lineMaterial.opacity = isOnline ? 0.85 : 0.35;

    const pos = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const col = pointsRef.current?.geometry.attributes.color as THREE.BufferAttribute | undefined;
    if (pos && col) {
      pulses.current.forEach((pulse, i) => {
        if (!pulse.active) {
          pos.setXYZ(i, 0, -50, 0);
          return;
        }
        const elapsed = t - pulse.spawnTime;
        if (elapsed > TRAVEL_DURATION) {
          pulse.active = false;
          pos.setXYZ(i, 0, -50, 0);
          return;
        }
        const travelX = -WIDTH / 2 + (elapsed / TRAVEL_DURATION) * WIDTH;
        const y = Math.sin(travelX * 1.6 + t * 1.6) * idleAmplitude + SPIKE_HEIGHT;
        pos.setXYZ(i, travelX, y, 0);
        col.setXYZ(i, pulse.color.r, pulse.color.g, pulse.color.b);
      });
      pos.needsUpdate = true;
      col.needsUpdate = true;
    }
  });

  return (
    <>
      <primitive ref={lineRef} object={lineObject} />
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={8} vertexColors transparent opacity={0.95} toneMapped={false} sizeAttenuation={false} />
      </points>
    </>
  );
}

export function PulseScene({ online = true }: { online?: boolean }) {
  return (
    <Canvas gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} dpr={[1, 1.5]}>
      <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={90} />
      <SignalWave online={online} />
    </Canvas>
  );
}
