import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';

/**
 * Interactive monochrome 3D object for the hero — a wireframe icosahedron
 * shell around a solid crystal core, orbiting rings and ambient sparkles.
 * Tilts toward the cursor and spins continuously. Colour follows the theme.
 */
export function Hero3D({
  fg = '#ffffff',
  bg = '#000000',
  muted = '#a3a3a3',
  offsetX = 0,
  cameraZ = 6,
  className = '',
}: {
  fg?: string;
  bg?: string;
  muted?: string;
  offsetX?: number;
  cameraZ?: number;
  className?: string;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={1.4} color={fg} />
        <pointLight position={[-5, -3, 2]} intensity={0.8} color={muted} />

        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8} floatingRange={[-0.1, 0.1]}>
          <group position={[offsetX, 0, 0]}>
            <ObjectShell fg={fg} bg={bg} muted={muted} pointer={pointer} />
          </group>
        </Float>

        <Sparkles count={70} scale={[9, 6, 9]} size={2.4} speed={0.3} color={fg} opacity={0.5} />
      </Canvas>
    </div>
  );
}

function ObjectShell({
  fg,
  bg,
  muted,
  pointer,
}: {
  fg: string;
  bg: string;
  muted: string;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const ring = useRef<Group>(null);

  useFrame((_, delta) => {
    if (outer.current) {
      const tx = pointer.current.y * 0.5;
      const ty = pointer.current.x * 0.5;
      outer.current.rotation.x += (tx - outer.current.rotation.x) * 0.04;
      outer.current.rotation.y += (ty - outer.current.rotation.y) * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.y += delta * 0.22;
      inner.current.rotation.z += delta * 0.06;
    }
    if (ring.current) {
      ring.current.rotation.x += delta * 0.12;
      ring.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* Wireframe shell */}
        <mesh>
          <icosahedronGeometry args={[1.55, 1]} />
          <meshBasicMaterial color={fg} wireframe transparent opacity={0.85} />
        </mesh>
        {/* Solid crystal core */}
        <mesh>
          <icosahedronGeometry args={[0.98, 0]} />
          <meshStandardMaterial
            color={bg}
            metalness={0.85}
            roughness={0.22}
            emissive={fg}
            emissiveIntensity={0.06}
            flatShading
          />
        </mesh>
        {/* Inner wireframe core */}
        <mesh>
          <icosahedronGeometry args={[0.62, 0]} />
          <meshBasicMaterial color={muted} wireframe transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Orbiting rings */}
      <group ref={ring}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.1, 0.012, 8, 120]} />
          <meshBasicMaterial color={fg} transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 3, Math.PI / 5]}>
          <torusGeometry args={[2.4, 0.008, 8, 120]} />
          <meshBasicMaterial color={muted} transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}
