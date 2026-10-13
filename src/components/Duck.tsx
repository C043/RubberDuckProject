import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FittedModel } from "./FittedModel";
import { MODELS, type DuckModel } from "../models";

const ray = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const aim = new THREE.Object3D();
const REST = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);
const followGoal = new THREE.Quaternion();

export function Duck({ model, follow }: { model: DuckModel; follow: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const beakTurn = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(UP, THREE.MathUtils.degToRad(model.followYaw ?? 0)),
    [model.followYaw],
  );

  // Face the cursor as if it hovered between the camera and the duck.
  // Eases back to rest when following is off.
  useFrame(({ pointer, camera }) => {
    const group = groupRef.current;
    if (!group) return;
    let goal = REST;
    if (follow) {
      ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      lookTarget.copy(camera.position).addScaledVector(ray, camera.position.length() * 0.5);
      // lookAt aims the local +Z axis; beakTurn first brings the beak onto it.
      aim.lookAt(lookTarget);
      goal = followGoal.copy(aim.quaternion).multiply(beakTurn);
    }
    group.quaternion.slerp(goal, 0.08);
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
        <FittedModel model={model} />
      </Float>
    </group>
  );
}

// Only the default model is preloaded; the others are fetched on demand.
useGLTF.preload(MODELS[0].url);
