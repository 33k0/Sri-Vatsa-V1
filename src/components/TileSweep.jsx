/**
 * Full-screen tile sweep used by the navigation bar. When `active` flips true it
 * covers the viewport with a diagonal sweep of glyph tiles, fires `onCovered`
 * at peak coverage (where the caller jumps the scroll to the target page,
 * hidden behind the tiles), holds briefly, then sweeps back out and fires
 * `onDone`. Pure CSS transitions (staggered via transition-delay) keep ~700
 * one-shot tiles cheap; no per-tile motion components.
 */
import { useEffect, useMemo, useRef, useState } from "react";

const GLYPHS = ["{", "}", ">", "<", "#", "λ", "*", "/", "=", ";", "&", "|", "0", "1", "$", "%", "[]", "()"];
const CELL = 56; // tile size (bigger than the trail's, for fewer nodes)
const STAGGER = 0.011; // seconds of delay per diagonal step
const TILE_DUR = 0.34; // seconds for a tile to grow / shrink
const HOLD = 140; // ms held fully covered (the scroll jump happens here)

export default function TileSweep({ active, onCovered, onDone }) {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0); // 0 = cleared (tiny), 1 = covering
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const coveredRef = useRef(onCovered);
  const doneRef = useRef(onDone);
  coveredRef.current = onCovered;
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const cols = Math.ceil(window.innerWidth / CELL) + 1;
    const rows = Math.ceil(window.innerHeight / CELL) + 1;
    setGrid({ cols, rows });
    setRunning(true);
    setT(0);

    const maxDiag = cols - 1 + (rows - 1);
    const sweepMs = maxDiag * STAGGER * 1000 + TILE_DUR * 1000;

    const rafs = [];
    rafs.push(requestAnimationFrame(() => rafs.push(requestAnimationFrame(() => setT(1))))); // cover
    const tCover = setTimeout(() => coveredRef.current?.(), sweepMs);
    const tReveal = setTimeout(() => setT(0), sweepMs + HOLD); // sweep out
    const tDone = setTimeout(() => {
      setRunning(false);
      doneRef.current?.();
    }, sweepMs + HOLD + sweepMs);

    return () => {
      rafs.forEach(cancelAnimationFrame);
      clearTimeout(tCover);
      clearTimeout(tReveal);
      clearTimeout(tDone);
    };
  }, [active]);

  const glyphs = useMemo(() => {
    const n = grid.cols * grid.rows;
    const g = new Array(n);
    for (let i = 0; i < n; i++) {
      g[i] = Math.random() < 0.4 ? "" : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    return g;
  }, [grid]);

  if (!running) return null;

  const tiles = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const i = r * grid.cols + c;
      const diag = c + r;
      tiles.push(
        <div
          key={i}
          className="absolute grid select-none place-items-center font-mono text-[#f2e7be]"
          style={{
            left: c * CELL,
            top: r * CELL,
            width: CELL + 1,
            height: CELL + 1,
            background: "#0d0a0a",
            fontSize: CELL * 0.74,
            lineHeight: 1,
            opacity: t ? 1 : 0,
            transform: `scale(${t ? 1 : 0.25})`,
            transitionProperty: "transform, opacity",
            transitionDuration: `${TILE_DUR}s`,
            transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
            transitionDelay: `${diag * STAGGER}s`,
          }}
        >
          {glyphs[i]}
        </div>
      );
    }
  }

  return <div className="pointer-events-auto absolute inset-0 z-[90] overflow-hidden">{tiles}</div>;
}
