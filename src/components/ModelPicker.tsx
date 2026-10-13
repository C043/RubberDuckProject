import { useEffect, useRef } from "react";
import { MODELS, thumbnailUrl, type DuckModel } from "../models";

interface ModelPickerProps {
  open: boolean;
  current: DuckModel;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function ModelPicker({ open, current, onSelect, onClose }: ModelPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  // A native modal dialog gives us the backdrop, focus trap and Esc for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      currentRef.current?.focus();
      currentRef.current?.scrollIntoView({ block: "nearest" });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="picker-modal"
      aria-labelledby="picker-title"
      onClose={onClose}
      // Clicks on the backdrop land on the dialog element itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="picker-modal__panel">
        <header className="picker-modal__head">
          <div>
            <p className="picker-modal__kicker">{MODELS.length} specimens</p>
            <h2 id="picker-title">Pick your duck</h2>
          </div>
          <button className="dock__btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <ul className="picker-grid">
          {MODELS.map((m, i) => {
            const selected = m.id === current.id;
            return (
              <li key={m.id}>
                <button
                  ref={selected ? currentRef : undefined}
                  className={`duck-card ${selected ? "duck-card--active" : ""}`}
                  aria-current={selected}
                  onClick={() => {
                    onSelect(m.id);
                    onClose();
                  }}
                >
                  <span className="duck-card__num">{String(i + 1).padStart(3, "0")}</span>
                  <img src={thumbnailUrl(m)} alt="" loading="lazy" decoding="async" width={512} height={512} />
                  <span className="duck-card__title">{m.title}</span>
                  <span className="duck-card__meta">
                    {m.author} · {m.license}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
