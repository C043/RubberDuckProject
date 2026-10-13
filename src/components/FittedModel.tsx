import { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { DuckModel } from "../models";

// Largest dimension every model is scaled to, so they all frame the same.
const FIT_SIZE = 2.3;
const box = new THREE.Box3();
const meshBox = new THREE.Box3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

interface Fit {
  scale: number;
  position: THREE.Vector3;
}
const fits = new WeakMap<THREE.Object3D, Fit>();

function isTransparent(mesh: THREE.Mesh) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.every((m) => m.transparent);
}

// Measured once per loaded scene, while it is still detached and untransformed.
function getFit(scene: THREE.Object3D, opaqueOnly: boolean) {
  let fit = fits.get(scene);
  if (!fit) {
    scene.updateMatrixWorld(true);
    box.makeEmpty();
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || (opaqueOnly && isTransparent(mesh))) return;
      box.union(meshBox.setFromObject(mesh));
    });
    if (box.isEmpty()) box.setFromObject(scene);
    box.getSize(size);
    box.getCenter(center);
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z, 1e-6);
    fit = { scale, position: center.clone().multiplyScalar(-scale) };
    fits.set(scene, fit);
  }
  return fit;
}

// A model centred at the origin and scaled to FIT_SIZE.
export function FittedModel({ model }: { model: DuckModel }) {
  const { scene } = useGLTF(model.url);
  const fit = getFit(scene, !!model.fitOpaqueOnly);

  useLayoutEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      if (!model.forceOpaque) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        mat.transparent = false;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      });
    });
  }, [scene, model.forceOpaque]);

  return (
    <group scale={fit.scale} position={fit.position}>
      <primitive object={scene} />
    </group>
  );
}
