import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera, Environment, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useProfile } from '@/hooks/useProfile';
import { EquippedCosmetics, CosmeticCategory, CosmeticItem } from '@shared/schema';
import { getCosmeticById } from '@/constants/cosmetics';
import { Sun, Sunrise, Moon } from 'lucide-react';

// Time of day types
export type TimeOfDay = 'morning' | 'day' | 'night';

// Time-based theme configurations
const TIME_THEMES: Record<TimeOfDay, {
  skyColor: string;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  accentLightColor: string;
  accentLightIntensity: number;
  environmentPreset: 'sunset' | 'dawn' | 'night' | 'city';
  groundColor: string;
  hillColor: string;
  grassColor: string;
}> = {
  morning: {
    skyColor: '#fdb99b',
    ambientIntensity: 0.5,
    directionalIntensity: 0.9,
    directionalColor: '#ffb380',
    accentLightColor: '#ffa07a',
    accentLightIntensity: 0.5,
    environmentPreset: 'dawn',
    groundColor: '#9ae6b4',
    hillColor: '#68d391',
    grassColor: '#48bb78',
  },
  day: {
    skyColor: '#87ceeb',
    ambientIntensity: 0.6,
    directionalIntensity: 1.2,
    directionalColor: '#ffffff',
    accentLightColor: '#a78bfa',
    accentLightIntensity: 0.4,
    environmentPreset: 'sunset',
    groundColor: '#86efac',
    hillColor: '#4ade80',
    grassColor: '#22c55e',
  },
  night: {
    skyColor: '#0f172a',
    ambientIntensity: 0.2,
    directionalIntensity: 0.3,
    directionalColor: '#c4b5fd',
    accentLightColor: '#6366f1',
    accentLightIntensity: 0.3,
    environmentPreset: 'night',
    groundColor: '#1e3a29',
    hillColor: '#166534',
    grassColor: '#15803d',
  },
};

// Get time of day based on current hour
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'day';
  return 'night';
}

// Attachment bone mapping for each cosmetic category
const ATTACHMENT_BONE_MAP: Record<CosmeticCategory, string> = {
  hat: 'attachment_hat',
  shirt: 'attachment_shirt',
  pants: 'attachment_pants',
  cape: 'attachment_cape',
  facewear: 'attachment_facewear',
};

// Moon component for nighttime
function MoonObject() {
  return (
    <group position={[-8, 12, -15]}>
      {/* Moon sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fef9c3" />
      </mesh>
      {/* Moon glow */}
      <pointLight color="#fef9c3" intensity={0.5} distance={50} />
    </group>
  );
}

// Hill Model
function Hill({ hillColor, grassColor }: { hillColor: string; grassColor: string }) {
  // Memoize grass positions so they don't regenerate on every render
  const grassPositions = useMemo(() => {
    const positions = [];
    const grassCount = 150;

    // Generate random grass positions on the hill surface
    for (let i = 0; i < grassCount; i++) {
      // Random angle around the hill
      const angle = Math.random() * Math.PI * 2;
      // Random distance from center (weighted towards edges)
      const distance = Math.pow(Math.random(), 0.5) * 1.1;

      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Calculate y position on the sphere surface
      // Sphere equation: x^2 + y^2 + z^2 = r^2
      const r = 1.2;
      const yOnSphere = Math.sqrt(Math.max(0, r * r - x * x - z * z));
      const y = -0.8 + yOnSphere; // Offset by hill position

      positions.push({ x, y, z, angle, scale: 0.7 + Math.random() * 0.6 });
    }

    return positions;
  }, []); // Empty dependency array = only calculate once

  return (
    <group>
      {/* Hill */}
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color={hillColor}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grass blades */}
      {grassPositions.map((pos, i) => (
        <mesh
          key={i}
          position={[pos.x, pos.y, pos.z]}
          rotation={[0, pos.angle, 0]}
          scale={[1, pos.scale, 1]}
        >
          {/* Simple grass blade shape */}
          <coneGeometry args={[0.02, 0.15, 3]} />
          <meshStandardMaterial
            color={grassColor}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cosmetic Attachment Component
function CosmeticAttachment({
  cosmeticItem,
  baseScene,
  category,
}: {
  cosmeticItem: CosmeticItem;
  baseScene: THREE.Object3D;
  category: CosmeticCategory;
}) {
  const { scene: cosmeticScene, animations } = useGLTF(cosmeticItem.modelPath!);
  const { actions } = useAnimations(animations, cosmeticScene);

  useEffect(() => {
    // Find attachment bone in base Howie model
    const boneName = ATTACHMENT_BONE_MAP[category];
    const attachmentBone = baseScene.getObjectByName(boneName);

    if (!attachmentBone) {
      console.error(`Attachment bone '${boneName}' not found in Howie model`);
      return;
    }

    // Clone the cosmetic scene to avoid modifying the cached original
    const cosmeticClone = cosmeticScene.clone();

    // Strategy: Find the actual content to attach
    // 1. For rigged cosmetics: look for 'cosmetic_root' bone
    // 2. For simple cosmetics: get all children and create a group
    let objectToAttach = cosmeticClone.getObjectByName('cosmetic_root');

    if (!objectToAttach) {
      // No cosmetic_root found - this is a simple (non-rigged) cosmetic
      // Create a container group and move all scene children into it
      const container = new THREE.Group();

      // Move all children from the scene into our container
      while (cosmeticClone.children.length > 0) {
        const child = cosmeticClone.children[0];
        container.add(child);
      }

      objectToAttach = container;
    }

    // Attach cosmetic to bone
    attachmentBone.add(objectToAttach);

    // Reset ONLY the root transform - children maintain their relative positions
    objectToAttach.position.set(0, 0, 0);
    objectToAttach.rotation.set(0, 0, 0);
    objectToAttach.scale.set(1, 1, 1);

    // Play animation if cosmetic has one
    if (cosmeticItem.hasAnimation && cosmeticItem.animationName) {
      const action = actions[cosmeticItem.animationName];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }

    // Cleanup: detach cosmetic when component unmounts
    return () => {
      if (attachmentBone) {
        attachmentBone.remove(objectToAttach);
      }
    };
  }, [baseScene, cosmeticScene, actions, cosmeticItem, category]);

  return null;
}

// Cosmetic Manager Component
function CosmeticManager({
  baseScene,
  equippedCosmetics,
}: {
  baseScene: THREE.Object3D | null;
  equippedCosmetics?: EquippedCosmetics;
}) {
  if (!baseScene || !equippedCosmetics) return null;

  const categories: CosmeticCategory[] = ['hat', 'shirt', 'pants', 'cape', 'facewear'];

  return (
    <>
      {categories.map((category) => {
        const cosmeticId = equippedCosmetics[category];
        if (!cosmeticId) return null;

        const cosmetic = getCosmeticById(cosmeticId);
        if (!cosmetic || !cosmetic.modelPath) return null;

        // Skip "none" items (empty imagePath means no cosmetic)
        if (cosmetic.imagePath === '') return null;

        return (
          <Suspense key={category} fallback={null}>
            <CosmeticAttachment
              cosmeticItem={cosmetic}
              baseScene={baseScene}
              category={category}
            />
          </Suspense>
        );
      })}
    </>
  );
}

// Single Zzz particle
interface ZzzParticle {
  id: number;
  offsetX: number;
  offsetZ: number;
  size: number;
  duration: number;
  delay: number;
}

// Sleeping Zzz particles above Howie's head
function SleepingZzz({ baseScene }: { baseScene: THREE.Object3D | null }) {
  const [particles, setParticles] = useState<ZzzParticle[]>([]);
  const nextIdRef = useRef(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (!baseScene) return;

    const spawnInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSpawn = (now - lastSpawnRef.current) / 1000;
      const minInterval = 3;
      const maxInterval = 6;
      const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);

      if (timeSinceLastSpawn >= randomInterval) {
        lastSpawnRef.current = now;

        // Create new Zzz particle
        const newParticle: ZzzParticle = {
          id: nextIdRef.current++,
          offsetX: (Math.random() - 0.5) * 0.3,
          offsetZ: (Math.random() - 0.5) * 0.3,
          size: 0.8 + Math.random() * 0.4,
          duration: 1.5 + Math.random() * 0.5,
          delay: Math.random() * 0.3,
        };

        setParticles((prev) => [...prev, newParticle]);

        // Remove particle after its duration
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, (newParticle.duration + newParticle.delay) * 1000);
      }
    }, 100);

    return () => clearInterval(spawnInterval);
  }, [baseScene]);

  if (!baseScene) return null;

  const hatBone = baseScene.getObjectByName('attachment_hat');
  if (!hatBone) return null;

  // Get world position of hat bone
  const hatPosition = new THREE.Vector3();
  hatBone.getWorldPosition(hatPosition);

  return (
    <>
      {particles.map((particle) => (
        <FloatingZzz
          key={particle.id}
          startPosition={hatPosition}
          offsetX={particle.offsetX}
          offsetZ={particle.offsetZ}
          size={particle.size}
          duration={particle.duration}
          delay={particle.delay}
        />
      ))}
    </>
  );
}

// Animated floating Zzz
function FloatingZzz({
  startPosition,
  offsetX,
  offsetZ,
  size,
  duration,
  delay,
}: {
  startPosition: THREE.Vector3;
  offsetX: number;
  offsetZ: number;
  size: number;
  duration: number;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());
  const travelDistanceRef = useRef(0.8 + Math.random() * 0.4);
  // Capture starting position ONCE so it doesn't change as Howie animates
  const fixedStartPosRef = useRef(startPosition.clone());
  const [opacity, setOpacity] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    // Mark as ready after first frame where position is set
    if (!isReady) {
      setIsReady(true);
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000 - delay;
    if (elapsed < 0) {
      setOpacity(0);
      return;
    }

    if (elapsed > duration) {
      setOpacity(0);
      return;
    }

    const progress = elapsed / duration;

    // Float upward smoothly using the FIXED starting position
    const floatHeight = progress * travelDistanceRef.current;
    meshRef.current.position.set(
      fixedStartPosRef.current.x + offsetX,
      fixedStartPosRef.current.y + 0.3 + floatHeight,
      fixedStartPosRef.current.z + offsetZ
    );

    // Fade in quickly at start, fade out in last 30%
    const fadeStart = 0.7;
    let newOpacity: number;

    if (progress < 0.1) {
      // Fade in during first 10%
      newOpacity = progress / 0.1;
    } else if (progress > fadeStart) {
      // Fade out in last 30%
      newOpacity = 1 - ((progress - fadeStart) / (1 - fadeStart));
    } else {
      newOpacity = 1;
    }

    setOpacity(Math.max(0, Math.min(1, newOpacity)));
  });

  const fixedPos = fixedStartPosRef.current;
  return (
    <mesh
      ref={meshRef}
      position={[fixedPos.x + offsetX, fixedPos.y + 0.3, fixedPos.z + offsetZ]}
    >
      <Html center>
        <div
          style={{
            fontSize: `${size * 24}px`,
            fontWeight: 'bold',
            color: '#e0e7ff',
            textShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
            userSelect: 'none',
            pointerEvents: 'none',
            opacity: isReady ? opacity : 0,
            transition: 'opacity 0.1s ease-out',
          }}
        >
          Zzz
        </div>
      </Html>
    </mesh>
  );
}

// Howie Model with Chillin animation
function ChillinHowie({
  onSceneLoaded,
}: {
  onSceneLoaded?: (scene: THREE.Object3D) => void;
}) {
  const { scene, animations } = useGLTF('/models/Howie.glb');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // Try to play the Chillin animation, fallback to Idle
    const chillinAction = actions['Chillin'];
    const idleAction = actions['Idle'];
    const action = chillinAction || idleAction;

    if (action) {
      // Start animation immediately with full weight (no T-pose flash)
      action.reset();
      action.setEffectiveWeight(1); // Full weight immediately, no fade-in
      action.play();

      // Start at random point in animation loop to avoid always starting from frame 0
      const clip = action.getClip();
      action.time = Math.random() * clip.duration;

      console.log(`Playing ${chillinAction ? 'Chillin' : 'Idle'} animation`);
    } else {
      console.warn('No animation found (Chillin or Idle)');
    }

    // Notify parent that scene is ready for cosmetic attachment
    if (onSceneLoaded) {
      onSceneLoaded(scene);
    }
  }, [actions, scene, onSceneLoaded]);

  // Hill crest is at y = -0.8 + 1.2 = 0.4
  // Position Howie's origin (bottom) at the crest
  return (
    <primitive
      object={scene}
      scale={0.75}
      position={[0, 0.4, 0]}
      castShadow
      receiveShadow
    />
  );
}

// Time toggle button component
function TimeToggle({
  currentTime,
  onToggle,
}: {
  currentTime: TimeOfDay;
  onToggle: () => void;
}) {
  const icons: Record<TimeOfDay, React.ReactNode> = {
    morning: <Sunrise className="w-5 h-5" />,
    day: <Sun className="w-5 h-5" />,
    night: <Moon className="w-5 h-5" />,
  };

  const labels: Record<TimeOfDay, string> = {
    morning: 'Morning',
    day: 'Day',
    night: 'Night',
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[9999] pointer-events-none">
      <div className="max-w-4xl mx-auto px-6 flex justify-center">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer pointer-events-auto"
        >
          {icons[currentTime]}
          <span className="text-sm font-medium">{labels[currentTime]}</span>
        </button>
      </div>
    </div>
  );
}

// Main Background Canvas Component
export default function FocusBackground3D({
  timeOfDay,
  onTimeChange,
}: {
  timeOfDay: TimeOfDay;
  onTimeChange: (time: TimeOfDay) => void;
}) {
  const { profile } = useProfile();
  const [baseScene, setBaseScene] = useState<THREE.Object3D | null>(null);

  // Cycle through times: morning -> day -> night -> morning
  const cycleTime = () => {
    const nextTime = timeOfDay === 'morning' ? 'day' : timeOfDay === 'day' ? 'night' : 'morning';
    onTimeChange(nextTime);
  };

  const theme = TIME_THEMES[timeOfDay];

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full -z-10"
        style={{ pointerEvents: 'none' }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
          }}
        >
          {/* Camera - positioned to look at Howie on the hill */}
          <PerspectiveCamera
            makeDefault
            position={[2, 1.8, 4]}
            fov={50}
          />

          {/* Lighting - adjusted based on time of day */}
          <ambientLight intensity={theme.ambientIntensity} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={theme.directionalIntensity}
            color={theme.directionalColor}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight
            position={[-5, 3, 2]}
            intensity={theme.accentLightIntensity}
            color={theme.accentLightColor}
          />

          {/* Sky background */}
          <color attach="background" args={[theme.skyColor]} />

          {/* Stars for nighttime */}
          {timeOfDay === 'night' && (
            <Stars
              radius={100}
              depth={50}
              count={3000}
              factor={4}
              saturation={0}
              fade
              speed={2}
            />
          )}

          {/* Moon for nighttime */}
          {timeOfDay === 'night' && <MoonObject />}

          {/* Environment for nice lighting */}
          <Environment preset={theme.environmentPreset} />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color={theme.groundColor} roughness={0.9} />
          </mesh>

          {/* The Hill */}
          <Suspense fallback={null}>
            <Hill hillColor={theme.hillColor} grassColor={theme.grassColor} />
          </Suspense>

          {/* Howie sitting on the hill */}
          <Suspense fallback={null}>
            <ChillinHowie onSceneLoaded={setBaseScene} />
            <CosmeticManager
              baseScene={baseScene}
              equippedCosmetics={profile.equippedCosmetics}
            />
            {/* Sleeping Zzz particles at night */}
            {timeOfDay === 'night' && <SleepingZzz baseScene={baseScene} />}
          </Suspense>
        </Canvas>
      </div>

      <TimeToggle currentTime={timeOfDay} onToggle={cycleTime} />
    </>
  );
}

// Preload model
try {
  useGLTF.preload('/models/Howie.glb');
} catch (error) {
  console.warn('Could not preload Howie model for focus background:', error);
}
