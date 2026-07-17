import { useEffect, useRef, useState } from "react";
import { useBoardDispatch } from "../state/BoardContext.jsx";
import { BACKGROUND_COLORS, BACKGROUND_GRADIENTS } from "../utils/backgrounds.js";

export default function BoardBackgroundMenu({ board }) {
  const dispatch = useBoardDispatch();
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#4d7ea8");
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyBackground(css) {
    dispatch({ type: "SET_BOARD_BACKGROUND", boardId: board.id, background: css });
  }

  return (
    <div className="board-bg-menu">
      <button ref={btnRef} className="btn-ghost" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="15" height="15" style={{ marginRight: 6, verticalAlign: -2 }}>
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.52-.2-1-.53-1.36-.32-.36-.52-.83-.52-1.36 0-1.1.9-2 2-2H17a5 5 0 0 0 5-5c0-4.42-4.48-8-10-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          />
        </svg>
        Personalizar
      </button>
      {open && (
        <div className="dropdown board-bg-dropdown" ref={ref}>
          <div className="board-bg-section-label">Cores</div>
          <div className="board-bg-swatch-grid">
            {BACKGROUND_COLORS.map((c) => (
              <button
                key={c.id}
                className={"board-bg-swatch" + (board.background === c.css ? " active" : "")}
                style={{ background: c.css }}
                onClick={() => applyBackground(c.css)}
                title={c.id}
              />
            ))}
          </div>

          <div className="board-bg-section-label">Gradientes</div>
          <div className="board-bg-swatch-grid">
            {BACKGROUND_GRADIENTS.map((g) => (
              <button
                key={g.id}
                className={"board-bg-swatch" + (board.background === g.css ? " active" : "")}
                style={{ background: g.css }}
                onClick={() => applyBackground(g.css)}
                title={g.id}
              />
            ))}
          </div>

          <div className="board-bg-section-label">Cor personalizada</div>
          <div className="board-bg-custom-row">
            <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
            <button className="btn-primary btn-small" onClick={() => applyBackground(customColor)}>
              Aplicar
            </button>
          </div>

          <div className="dropdown-divider" />
          <div className="dropdown-item" onClick={() => applyBackground(null)}>
            Padrão (sem fundo)
          </div>
        </div>
      )}
    </div>
  );
}
