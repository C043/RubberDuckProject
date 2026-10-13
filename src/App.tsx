import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, useProgress } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { getDefaultPosition, MAX_DISTANCE, MIN_DISTANCE, type MotionMode } from "./camera";
import { THEMES } from "./themes";
import { MODELS, thumbnailUrl } from "./models";
import { ModelPicker } from "./components/ModelPicker";
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
  const [mode, setMode] = useState<MotionMode>("spin");
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [defaultPosition] = useState(getDefaultPosition);
  const [distance, setDistance] = useState(() => Math.hypot(...defaultPosition));
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const modelIndex = Math.max(0, MODELS.findIndex((m) => m.id === modelId));
  const model = MODELS[modelIndex];

  const onZoomChange = useCallback((d: number) => {
    setDistance((prev) => (Math.abs(prev - d) > 0.01 ? d : prev));
  }, []);

  const zoom = useCallback((dir: 1 | -1) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, controls.distance - dir * ZOOM_STEP));
    controls.dollyTo(target, true);
  }, []);

  const toggleMode = useCallback((m: Exclude<MotionMode, null>) => {
    setMode((current) => (current === m ? null : m));
  }, []);

  const stopModes = useCallback(() => setMode(null), []);

  const cycleModel = useCallback((dir: 1 | -1) => {
    setModelId((current) => {
      const i = MODELS.findIndex((m) => m.id === current);
      return MODELS[(i + dir + MODELS.length) % MODELS.length].id;
    });
  }, []);

  const reset = useCallback(() => {
    setMode(null);
    controlsRef.current?.setLookAt(...getDefaultPosition(), 0, 0, 0, true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (pickerOpen) return;
      if (e.target instanceof HTMLElement && e.target.closest("button, input")) return;
      if (e.key === "+" || e.key === "=") zoom(1);
      else if (e.key === "-" || e.key === "_") zoom(-1);
      else if (e.key.toLowerCase() === "r") reset();
      else if (e.key === "[") cycleModel(-1);
      else if (e.key === "]") cycleModel(1);
      else if (e.key.toLowerCase() === "m") setPickerOpen(true);
      else if (e.key === " ") {
        e.preventDefault();
        toggleMode("spin");
      } else if (e.key.toLowerCase() === "f") toggleMode("follow");
      else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, reset, toggleMode, cycleModel, pickerOpen]);

  const atMinZoom = distance >= MAX_DISTANCE - 0.01;
  const atMaxZoom = distance <= MIN_DISTANCE + 0.01;

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
        <Scene
          controlsRef={controlsRef}
          mode={mode}
          model={model}
          theme={theme}
          onZoomChange={onZoomChange}
          onDragStart={stopModes}
        />
      </Canvas>

      <Loader />

      <ModelPicker open={pickerOpen} current={model} onSelect={setModelId} onClose={() => setPickerOpen(false)} />

      <header className="hud hud--top">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__kicker">Specimen No. {String(modelIndex + 1).padStart(3, "0")}</span>
        </div>
        <button
          className="picker"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          title="Choose duck (M)"
        >
          <img className="picker__thumb" src={thumbnailUrl(model)} alt="" width={28} height={28} />
          <span className="picker__label">
            <span className="sr-only">Duck model: </span>
            {model.title}
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="4" width="6" height="6" rx="1.5" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" />
          </svg>
        </button>
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
          <kbd>Drag</kbd> rotate · <kbd>Scroll</kbd> zoom · <kbd>F</kbd> follow · <kbd>M</kbd> ducks · <kbd>R</kbd> reset
        </p>

        <div className="dock">
          <button className="dock__btn" onClick={() => zoom(-1)} aria-label="Zoom out" title="Zoom out (-)" disabled={atMinZoom}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
          </button>
          <button className="dock__btn" onClick={() => zoom(1)} aria-label="Zoom in" title="Zoom in (+)" disabled={atMaxZoom}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" /></svg>
          </button>
          <span className="dock__sep" />
          <div className="modes" role="group" aria-label="Motion mode">
            <button
              className={`dock__btn ${mode === "spin" ? "dock__btn--on dock__btn--spin" : ""}`}
              onClick={() => toggleMode("spin")}
              aria-pressed={mode === "spin"}
              aria-label="Auto-rotate"
              title="Auto-rotate (Space)"
            >
              <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" /></svg>
            </button>
            <button
              className={`dock__btn ${mode === "follow" ? "dock__btn--on" : ""}`}
              onClick={() => toggleMode("follow")}
              aria-pressed={mode === "follow"}
              aria-label="Follow mouse"
              title="Follow mouse (F)"
            >
              <svg viewBox="0 0 24 24"><path d="M5 3l6 16 2.2-6.8L20 10z" /></svg>
            </button>
          </div>
          <span className="dock__sep" />
          <button className="dock__btn" onClick={reset} aria-label="Reset view" title="Reset view (R)">
            <svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="4" /></svg>
          </button>
        </div>

        <p className="credit">
          Model by{" "}
          <a href={model.source} target="_blank" rel="noreferrer">
            {model.author}
          </a>{" "}
          · {model.license}
        </p>
      </footer>
    </div>
  );
}

export default App;
