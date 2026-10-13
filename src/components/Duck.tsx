import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/rubber_duck.glb";
const ray = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const aim = new THREE.Object3D();
const REST = new THREE.Quaternion();

export function Duck({ follow }: { follow: boolean }) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);

  // Face the cursor as if it hovered between the camera and the duck.
  // Eases back to rest when following is off.
  useFrame(({ pointer, camera }) => {
    const group = groupRef.current;
    if (!group) return;
    let goal = REST;
    if (follow) {
      ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      lookTarget.copy(camera.position).addScaledVector(ray, camera.position.length() * 0.5);
      // lookAt aims the local +Z axis, which is where the beak points.
      aim.lookAt(lookTarget);
      goal = aim.quaternion;
    }
    group.quaternion.slerp(goal, 0.08);
  });

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
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
        <Center scale={0.8}>
          <primitive object={scene} />
        </Center>
      </Float>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
