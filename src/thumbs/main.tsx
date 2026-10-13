// Dev-only page (thumbs.html) that renders each model and saves a preview to
// public/models/thumbs/<id>.webp through the dev server. Run `npm run thumbs`.
/* eslint-disable react-refresh/only-export-components -- standalone entry, not hot-reloaded */
import { Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useThree } from "@react-three/fiber";
import { FittedModel } from "../components/FittedModel";
import { Lights } from "../components/Lights";
import { MODELS, type DuckModel } from "../models";

const only = new URLSearchParams(location.search).get("only")?.split(",");
const queue = only ? MODELS.filter((m) => only.includes(m.id)) : MODELS;

function Capture({ model, onDone }: { model: DuckModel; onDone: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let frames = 0;
    let raf = requestAnimationFrame(function tick() {
      // Give the environment map and textures a few frames to settle.
      if (++frames < 10) {
        raf = requestAnimationFrame(tick);
        return;
      }
      gl.domElement.toBlob(
        async (blob) => {
          if (!blob) throw new Error(`No image for ${model.id}`);
          const res = await fetch(`/__thumbs/${model.id}`, { method: "POST", body: blob });
          if (!res.ok) throw new Error(`Saving ${model.id} failed: ${res.status}`);
          console.log(`saved ${model.id}`);
          onDone();
        },
        "image/webp",
        0.9,
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [gl, model, onDone]);
  return null;
}

function Generator() {
  const [index, setIndex] = useState(0);
  const model = queue[index];

  useEffect(() => {
    if (!model) console.log("thumbs done");
  }, [model]);

  if (!model) return <p style={{ color: "white" }}>Done.</p>;

  return (
    <Canvas
      key={model.id}
      dpr={1}
      camera={{ position: [3.2, 1.6, 4.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <Lights rim="#ffffff" />
      <Suspense fallback={null}>
        <FittedModel model={model} />
        <Capture model={model} onDone={() => setIndex((i) => i + 1)} />
      </Suspense>
    </Canvas>
  );
}

createRoot(document.getElementById("root")!).render(<Generator />);
