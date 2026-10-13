export const MIN_DISTANCE = 2.5;
export const MAX_DISTANCE = 10;

const BASE_POSITION: [number, number, number] = [3.2, 1.6, 4.2];

// Portrait screens need the camera further back to fit the whole duck.
export function getDefaultPosition(): [number, number, number] {
  const aspect = window.innerWidth / window.innerHeight;
  const factor = aspect < 0.8 ? 1.55 : 1;
  return BASE_POSITION.map((v) => v * factor) as [number, number, number];
}
