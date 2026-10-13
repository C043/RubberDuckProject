import { Suspense, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Duck } from "./Duck";
import type { Theme } from "../themes";
import { MAX_DISTANCE, MIN_DISTANCE } from "../camera";

interface SceneProps {
  controlsRef: RefObject<CameraControls | null>;
  autoRotate: boolean;
  theme: Theme;
  onZoomChange: (distance: number) => void;
}

function AutoRotate({ controlsRef, enabled }: { controlsRef: SceneProps["controlsRef"]; enabled: boolean }) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!enabled || !controls || controls.currentAction !== 0) return;
    controls.azimuthAngle += delta * 0.35;
  });
  return null;
}

export function Scene({ controlsRef, autoRotate, theme, onZoomChange }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow />

      {/* Local light rig so reflections work offline (no HDRI download). */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color={theme.rim} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="circle" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <Duck />
      </Suspense>

      <ContactShadows position={[0, -1.25, 0]} opacity={theme.shadowOpacity} scale={8} blur={2.6} far={3} color={theme.shadow} />

      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        maxPolarAngle={Math.PI * 0.62}
        smoothTime={0.35}
        truckSpeed={0}
        onChange={() => controlsRef.current && onZoomChange(controlsRef.current.distance)}
      />
      <AutoRotate controlsRef={controlsRef} enabled={autoRotate} />
    </>
  );
}
