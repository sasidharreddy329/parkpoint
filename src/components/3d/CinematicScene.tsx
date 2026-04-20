import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Car from "./Car";
import ParkingLot from "./ParkingLot";

const PARKING_SLOTS = [
  { id: "A1", position: [-4, 0, -2] as [number, number, number], occupied: false },
  { id: "A2", position: [-2, 0, -2] as [number, number, number], occupied: true },
  { id: "A3", position: [0, 0, -2] as [number, number, number], occupied: false },
  { id: "A4", position: [2, 0, -2] as [number, number, number], occupied: false },
  { id: "A5", position: [4, 0, -2] as [number, number, number], occupied: true },
  { id: "B1", position: [-4, 0, 3] as [number, number, number], occupied: false },
  { id: "B2", position: [-2, 0, 3] as [number, number, number], occupied: true },
  { id: "B3", position: [0, 0, 3] as [number, number, number], occupied: false },
  { id: "B4", position: [2, 0, 3] as [number, number, number], occupied: false },
  { id: "B5", position: [4, 0, 3] as [number, number, number], occupied: false },
];

// Lerp helper
function lerpValue(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface SceneContentProps {
  scrollProgress: number;
  selectedSlot: string | null;
  onSlotClick: (id: string) => void;
}

function SceneContent({ scrollProgress, selectedSlot, onSlotClick }: SceneContentProps) {
  const carRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame(() => {
    const p = scrollProgress;

    // Scene 1 (0-0.15): Hero - car centered, slow rotate
    // Scene 2 (0.15-0.3): Camera push toward car
    // Scene 3 (0.3-0.5): Car moves forward
    // Scene 4 (0.5-0.65): Environment reveal (parking lot fades in)
    // Scene 5 (0.65-0.8): Camera orbit to top-down
    // Scene 6 (0.8-1.0): Interaction mode

    if (carRef.current) {
      if (p < 0.3) {
        // Car rotates slowly in hero
        carRef.current.rotation.y = p * 4;
        carRef.current.position.set(0, 0, 0);
      } else if (p < 0.5) {
        // Car moves forward
        const t = (p - 0.3) / 0.2;
        const smoothT = t * t * (3 - 2 * t); // smoothstep
        carRef.current.rotation.y = 0.3 * 4 + smoothT * (-Math.PI / 2 - 0.3 * 4 + Math.PI * 2);
        carRef.current.position.x = lerpValue(0, -8, smoothT);
        carRef.current.position.z = lerpValue(0, 0.5, smoothT);
      } else {
        carRef.current.rotation.y = -Math.PI / 2;
        carRef.current.position.set(-8, 0, 0.5);
      }
    }

    // Camera choreography
    if (p < 0.15) {
      // Hero view
      camera.position.set(5, 3, 5);
      camera.lookAt(0, 0.5, 0);
    } else if (p < 0.3) {
      // Push in
      const t = (p - 0.15) / 0.15;
      const st = t * t * (3 - 2 * t);
      camera.position.set(
        lerpValue(5, 2.5, st),
        lerpValue(3, 1.8, st),
        lerpValue(5, 2.5, st)
      );
      camera.lookAt(0, 0.5, 0);
    } else if (p < 0.5) {
      // Follow car
      const t = (p - 0.3) / 0.2;
      const st = t * t * (3 - 2 * t);
      const carX = lerpValue(0, -8, st);
      camera.position.set(
        lerpValue(2.5, -4, st),
        lerpValue(1.8, 3, st),
        lerpValue(2.5, 6, st)
      );
      camera.lookAt(carX, 0.5, 0);
    } else if (p < 0.65) {
      // Reveal parking lot
      const t = (p - 0.5) / 0.15;
      const st = t * t * (3 - 2 * t);
      camera.position.set(
        lerpValue(-4, 0, st),
        lerpValue(3, 6, st),
        lerpValue(6, 8, st)
      );
      camera.lookAt(0, 0, 0);
    } else if (p < 0.8) {
      // Orbit to top-down
      const t = (p - 0.65) / 0.15;
      const st = t * t * (3 - 2 * t);
      const angle = lerpValue(0, Math.PI * 0.5, st);
      camera.position.set(
        Math.sin(angle) * lerpValue(8, 2, st),
        lerpValue(6, 14, st),
        Math.cos(angle) * lerpValue(8, 2, st)
      );
      camera.lookAt(0, 0, 0);
    } else {
      // Top-down interaction view
      camera.position.set(0, 14, 2);
      camera.lookAt(0, 0, 0);
    }
  });

  const showLot = scrollProgress > 0.45;
  const interactive = scrollProgress > 0.78;

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Car ref={carRef} />

      <ParkingLot
        visible={showLot}
        slots={PARKING_SLOTS}
        selectedSlot={selectedSlot}
        onSlotClick={onSlotClick}
        interactive={interactive}
      />

      {showLot && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.5}
          scale={30}
          blur={2}
          far={10}
        />
      )}

      <fog attach="fog" args={["#050505", 15, 35]} />
    </>
  );
}

interface CinematicSceneProps {
  scrollProgress: number;
  selectedSlot: string | null;
  onSlotClick: (id: string) => void;
}

const CinematicScene = ({ scrollProgress, selectedSlot, onSlotClick }: CinematicSceneProps) => {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <SceneContent
          scrollProgress={scrollProgress}
          selectedSlot={selectedSlot}
          onSlotClick={onSlotClick}
        />
      </Suspense>
    </Canvas>
  );
};

export { PARKING_SLOTS };
export default CinematicScene;
