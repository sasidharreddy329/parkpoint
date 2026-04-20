import { useRef } from "react";
import { Group } from "three";
import { forwardRef } from "react";

// Procedural stylized car using primitive shapes
const Car = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref} position={[0, 0.35, 0]}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 1.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.1, 0.7, 0]} castShadow>
        <boxGeometry args={[1.3, 0.4, 1.0]} />
        <meshStandardMaterial color="#16213e" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Windshield front */}
      <mesh position={[-0.45, 0.7, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.4, 0.38, 0.95]} />
        <meshStandardMaterial color="#4a9eff" metalness={0.3} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Windshield rear */}
      <mesh position={[0.65, 0.7, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.35, 0.35, 0.95]} />
        <meshStandardMaterial color="#4a9eff" metalness={0.3} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-1.12, 0.3, 0.35]}>
        <boxGeometry args={[0.05, 0.12, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.12, 0.3, -0.35]}>
        <boxGeometry args={[0.05, 0.12, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[1.12, 0.3, 0.35]}>
        <boxGeometry args={[0.05, 0.1, 0.18]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[1.12, 0.3, -0.35]}>
        <boxGeometry args={[0.05, 0.1, 0.18]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={1.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.7, 0.05, 0.6], [-0.7, 0.05, -0.6], [0.7, 0.05, 0.6], [0.7, 0.05, -0.6]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
            <meshStandardMaterial color="#111" metalness={0.5} roughness={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.14, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

Car.displayName = "Car";
export default Car;
