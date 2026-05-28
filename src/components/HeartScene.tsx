import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, PresentationControls, Stars } from "@react-three/drei";
import * as THREE from "three";

type Particle = {
  position: [number, number, number];
  rotation: [number, number, number];
  text: string;
};

const TextParticle = ({ position, rotation, text }: Particle) => {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group position={position} rotation={rotation}>
        <Text
          fontSize={0.08}
          color="#ff4d6d"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

const HeartCloud = () => {
  const group = useRef<THREE.Group | null>(null);

  const particles = useMemo<Particle[]>(() => {
    const temp: Particle[] = [];
    const count = 140;
    const text = "i love you";

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = 16 * Math.pow(Math.sin(t), 3) * Math.sin(phi);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      const z = 16 * Math.pow(Math.sin(t), 3) * Math.cos(phi);

      const scale = 0.06;

      temp.push({
        position: [x * scale, y * scale, z * scale],
        rotation: [0, t, 0],
        text,
      });
    }

    return temp;
  }, []);

  useFrame((state: any) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <TextParticle key={i} {...p} />
      ))}
    </group>
  );
};

export default function HeartScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff4d6d" />

        <PresentationControls
          global
          speed={1.2}
          snap
          polar={[-Math.PI / 2, Math.PI / 2]}
          azimuth={[-Math.PI, Math.PI]}
        >
          <HeartCloud />
        </PresentationControls>

        <Stars radius={80} depth={50} count={2500} factor={3} fade speed={1} />
      </Canvas>
    </div>
  );
}