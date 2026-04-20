import { useMemo } from "react";
import * as THREE from "three";

interface ParkingSlot {
  id: string;
  position: [number, number, number];
  occupied: boolean;
}

interface ParkingLotProps {
  visible: boolean;
  slots: ParkingSlot[];
  selectedSlot: string | null;
  onSlotClick: (id: string) => void;
  interactive: boolean;
}

const ParkingLot = ({ visible, slots, selectedSlot, onSlotClick, interactive }: ParkingLotProps) => {
  if (!visible) return null;

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.9} />
      </mesh>

      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.15, 20]} />
        <meshStandardMaterial color="#ffffff" opacity={0.15} transparent />
      </mesh>

      {/* Parking slots */}
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.id;
        const color = slot.occupied
          ? "#ef4444"
          : isSelected
          ? "#3b82f6"
          : "#22c55e";

        return (
          <group key={slot.id} position={slot.position}>
            {/* Slot ground */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.02, 0]}
              onClick={(e) => {
                if (interactive && !slot.occupied) {
                  e.stopPropagation();
                  onSlotClick(slot.id);
                }
              }}
              onPointerOver={(e) => {
                if (interactive && !slot.occupied) {
                  document.body.style.cursor = "pointer";
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = "default";
              }}
            >
              <planeGeometry args={[1.8, 3.2]} />
              <meshStandardMaterial
                color={color}
                opacity={isSelected ? 0.5 : 0.2}
                transparent
              />
            </mesh>
            {/* Slot border lines */}
            {[[-0.9, 0.015, 0], [0.9, 0.015, 0]].map((pos, i) => (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos as [number, number, number]}>
                <planeGeometry args={[0.06, 3.2]} />
                <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
              </mesh>
            ))}
            {/* Slot label */}
            {isSelected && (
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={2}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Lamp posts */}
      {[[-6, 0, -4], [6, 0, -4], [-6, 0, 4], [6, 0, 4]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 4, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          <pointLight
            position={[0, 4, 0]}
            intensity={8}
            distance={12}
            color="#ffeedd"
            castShadow
          />
        </group>
      ))}
    </group>
  );
};

export default ParkingLot;
