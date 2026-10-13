import { useLayoutEffect } from "react";
import { Center, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/rubber_duck.glb";

export function Duck() {
  const { scene } = useGLTF(MODEL_URL);

  // The Sketchfab export marks the material as alpha-blended, which causes
  // depth-sorting artifacts on an opaque toy. Force it opaque.
  useLayoutEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        mat.transparent = false;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
      <Center scale={0.8}>
        <primitive object={scene} />
      </Center>
    </Float>
  );
}

useGLTF.preload(MODEL_URL);
