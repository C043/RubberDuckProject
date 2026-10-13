import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, useProgress } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { getDefaultPosition, MAX_DISTANCE, MIN_DISTANCE } from "./camera";
import { THEMES } from "./themes";
import "./App.css";

const ZOOM_STEP = 1;

function Loader() {
  const { active, progress } = useProgress();
  return (
    <div className={`loader ${active ? "" : "loader--done"}`} aria-hidden={!active}>
      <div className="loader__ring">
        <span>{Math.round(progress)}%</span>
      </div>
      <p>Inflating duck…</p>
    </div>
  );
}

function App() {
  const controlsRef = useRef<CameraControls | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [defaultPosition] = useState(getDefaultPosition);
  const defaultDistance = Math.hypot(...defaultPosition);
  const [distance, setDistance] = useState(defaultDistance);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const onZoomChange = useCallback((d: number) => {
    setDistance((prev) => (Math.abs(prev - d) > 0.01 ? d : prev));
  }, []);

  const zoom = useCallback((dir: 1 | -1) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, controls.distance - dir * ZOOM_STEP));
    controls.dollyTo(target, true);
  }, []);

  const reset = useCallback(() => {
    controlsRef.current?.setLookAt(...getDefaultPosition(), 0, 0, 0, true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button, input")) return;
      if (e.key === "+" || e.key === "=") zoom(1);
      else if (e.key === "-" || e.key === "_") zoom(-1);
      else if (e.key.toLowerCase() === "r") reset();
      else if (e.key === " ") {
        e.preventDefault();
        setAutoRotate((v) => !v);
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, reset]);

  // Map camera distance to a 0–100 scale for the zoom meter (closer = higher).
  const zoomPct = Math.round(((MAX_DISTANCE - distance) / (MAX_DISTANCE - MIN_DISTANCE)) * 100);

  return (
    <div className="app" data-theme={theme.id}>
      <div className="bg-glow" />

      <Canvas
        className="canvas"
        shadows
        dpr={[1, 2]}
        camera={{ position: defaultPosition, fov: 40 }}
        gl={{ antialias: true }}
      >
        <Scene controlsRef={controlsRef} autoRotate={autoRotate} theme={theme} onZoomChange={onZoomChange} />
      </Canvas>

      <Loader />

      <header className="hud hud--top">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__kicker">Specimen No. 001</span>
        </div>
        <div className="themes" role="radiogroup" aria-label="Scene theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={t.id === themeId}
              className={`swatch ${t.id === themeId ? "swatch--active" : ""}`}
              style={{ "--swatch": t.swatch } as CSSProperties}
              onClick={() => setThemeId(t.id)}
              title={t.label}
            >
              <span className="sr-only">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="title">
        <h1>
          Rubber{" "}
          <br />
          Duck<span className="title__accent">.</span>
        </h1>
        <p>Your debugging companion, in glorious 3D. Explain your code to it. It's a great listener.</p>
      </section>

      <footer className="hud hud--bottom">
        <p className="hint">
          <kbd>Drag</kbd> rotate · <kbd>Scroll</kbd> zoom · <kbd>R</kbd> reset
        </p>

        <div className="dock">
          <button className="dock__btn" onClick={() => zoom(-1)} aria-label="Zoom out" disabled={zoomPct <= 0}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
          </button>
          <div className="meter" aria-label={`Zoom ${zoomPct}%`}>
            <div className="meter__fill" style={{ width: `${Math.max(0, Math.min(100, zoomPct))}%` }} />
            <span>{(defaultDistance / distance).toFixed(1)}×</span>
          </div>
          <button className="dock__btn" onClick={() => zoom(1)} aria-label="Zoom in" disabled={zoomPct >= 100}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" /></svg>
          </button>
          <span className="dock__sep" />
          <button
            className={`dock__btn ${autoRotate ? "dock__btn--on" : ""}`}
            onClick={() => setAutoRotate((v) => !v)}
            aria-pressed={autoRotate}
            aria-label="Toggle auto-rotate"
            title="Auto-rotate (Space)"
          >
            <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" /></svg>
          </button>
          <button className="dock__btn" onClick={reset} aria-label="Reset view" title="Reset view (R)">
            <svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="4" /></svg>
          </button>
        </div>

        <p className="credit">
          Model by{" "}
          <a href="https://sketchfab.com/3d-models/rubber-duck-7eb15f3c897049f8ba35f8f56f081dff" target="_blank" rel="noreferrer">
            Albert Gregl
          </a>{" "}
          · CC BY-NC 4.0
        </p>
      </footer>
    </div>
  );
}

export default App;
