import { Suspense, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CameraControls, ContactShadows } from "@react-three/drei";
import { Duck } from "./Duck";
import { Lights } from "./Lights";
import type { Theme } from "../themes";
import type { DuckModel } from "../models";
import type { MotionMode } from "../camera";
import { MAX_DISTANCE, MIN_DISTANCE } from "../camera";

interface SceneProps {
  controlsRef: RefObject<CameraControls | null>;
  mode: MotionMode;
  model: DuckModel;
  theme: Theme;
  onZoomChange: (distance: number) => void;
  onDragStart: () => void;
}

function AutoRotate({ controlsRef, enabled }: { controlsRef: SceneProps["controlsRef"]; enabled: boolean }) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!enabled || !controls || controls.currentAction !== 0) return;
    controls.azimuthAngle += delta * 0.35;
  });
  return null;
}

export function Scene({ controlsRef, mode, model, theme, onZoomChange, onDragStart }: SceneProps) {
  return (
    <>
      <Lights rim={theme.rim} boost={model.lightBoost} />

      <Suspense fallback={null}>
        <Duck key={model.id} model={model} follow={mode === "follow"} />
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
        // Fires for pointer/touch drags only (wheel zoom doesn't emit it).
        onStart={onDragStart}
      />
      <AutoRotate controlsRef={controlsRef} enabled={mode === "spin"} />
    </>
  );
}
