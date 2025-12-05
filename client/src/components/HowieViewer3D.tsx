import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, PerspectiveCamera, Environment } from '@react-three/drei';
import { Loader2, AlertCircle } from 'lucide-react';
import { EquippedCosmetics, CosmeticCategory, CosmeticItem } from '@shared/schema';
import { getCosmeticById } from '@/constants/cosmetics';
import * as THREE from 'three';

interface HowieViewer3DProps {
  modelPath?: string;
  equippedCosmetics?: EquippedCosmetics;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  pixelSize?: number;
}

// Pixelation shader for post-processing effect
const PixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    pixelSize: { value: 4.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;

    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `,
};

// Pixelation Effect Component
function PixelationEffect({ pixelSize = 4 }: { pixelSize?: number }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<any>(null);

  useEffect(() => {
    // Create render target
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
    });

    // Create full-screen quad with pixelation shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        resolution: { value: new THREE.Vector2(size.width, size.height) },
        pixelSize: { value: pixelSize },
      },
      vertexShader: PixelationShader.vertexShader,
      fragmentShader: PixelationShader.fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    composerRef.current = {
      renderTarget,
      material,
      quadScene,
      quadCamera,
    };

    return () => {
      renderTarget.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [size.width, size.height, pixelSize]);

  useFrame(() => {
    if (!composerRef.current) return;

    const { renderTarget, material, quadScene, quadCamera } = composerRef.current;

    // Update shader uniforms
    material.uniforms.resolution.value.set(size.width, size.height);
    material.uniforms.pixelSize.value = pixelSize;

    // Render scene to texture
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);

    // Render pixelated quad to screen
    gl.setRenderTarget(null);
    gl.render(quadScene, quadCamera);
  }, 1);

  return null;
}

// Attachment bone mapping for each cosmetic category
const ATTACHMENT_BONE_MAP: Record<CosmeticCategory, string> = {
  hat: 'attachment_hat',
  shirt: 'attachment_shirt',
  pants: 'attachment_pants',
  cape: 'attachment_cape',
  facewear: 'attachment_facewear',
};

// Howie Model Component
function HowieModel({
  modelPath = '/models/Howie.glb',
  onSceneLoaded,
}: {
  modelPath?: string;
  onSceneLoaded?: (scene: THREE.Object3D) => void;
}) {
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // Play the Idle animation
    const idleAction = actions['Idle'];

    if (idleAction) {
      // Start animation immediately with full weight (no T-pose flash)
      idleAction.reset();
      idleAction.setEffectiveWeight(1); // Full weight immediately, no fade-in
      idleAction.play();

      // Start at random point in animation loop to avoid always starting from frame 0
      const clip = idleAction.getClip();
      idleAction.time = Math.random() * clip.duration;
    }

    // Notify parent that scene is ready for cosmetic attachment
    if (onSceneLoaded) {
      onSceneLoaded(scene);
    }
  }, [actions, scene, onSceneLoaded]);

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, -0.5, 0]}
    />
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

// Loading fallback
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Howie...</p>
      </div>
    </div>
  );
}

// Error fallback
function ErrorDisplay({ error }: { error?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm font-semibold">Could not load 3D model</p>
        <p className="text-xs text-muted-foreground max-w-md">
          {error || 'Make sure Howie.glb is in /public/models/'}
        </p>
      </div>
    </div>
  );
}

export default function HowieViewer3D({
  modelPath = '/models/Howie.glb',
  equippedCosmetics,
  autoRotate = false,
  enableZoom = false,
  enablePan = false,
  pixelSize = 6 ,
}: HowieViewer3DProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [baseScene, setBaseScene] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    // Check if model exists
    fetch(modelPath)
      .then((response) => {
        if (!response.ok) {
          setError(`Model not found at ${modelPath}`);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load model: ${err.message}`);
        setIsLoading(false);
      });
  }, [modelPath]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="w-full h-full relative">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: false,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
        >
          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[0, 1, 3]}
            fov={60}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Howie Model + Cosmetics */}
          <Suspense fallback={null}>
            <HowieModel
              modelPath={modelPath}
              onSceneLoaded={setBaseScene}
            />
            <CosmeticManager
              baseScene={baseScene}
              equippedCosmetics={equippedCosmetics}
            />
          </Suspense>

          {/* Controls */}
          <OrbitControls
            autoRotate={false}
            autoRotateSpeed={2}
            enableZoom={enableZoom}
            enablePan={enablePan}
            minDistance={2}
            maxDistance={6}
            target={[0, 0.5, 0]}
          />
          <color attach="background" args={['#1a1a1a']} />

          {/* Pixelation Post-Processing */}
          <PixelationEffect pixelSize={pixelSize} />
        </Canvas>
      </div>
    </Suspense>
  );
}

// Preload the model if it exists
try {
  useGLTF.preload('/models/Howie.glb');
} catch (error) {
  console.warn('Could not preload Howie model:', error);
}
