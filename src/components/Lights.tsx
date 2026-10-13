import { Environment, Lightformer } from "@react-three/drei";

export function Lights({ rim, boost = 1 }: { rim: string; boost?: number }) {
  return (
    <>
      <ambientLight intensity={0.4 * boost} />
      <directionalLight position={[4, 6, 3]} intensity={1.6 * boost} castShadow />

      {/* Local light rig so reflections work offline (no HDRI download). */}
      <Environment resolution={256} environmentIntensity={boost}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color={rim} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="circle" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={3} />
      </Environment>
    </>
  );
}
