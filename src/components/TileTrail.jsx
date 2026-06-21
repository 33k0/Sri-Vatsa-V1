import { useEffect, useRef } from "react";

/**
 * Cursor-driven tile-trail background layer.
 *
 * disabled until `active` is true (so the page underneath stays clickable).
 * once active it draws on plain hover (pointermove), no click/drag needed,
 * spawning a diamond "brush" of glyph tiles that trail and fade behind the
 * cursor. pointer logic writes the DOM imperatively (not React state) to stay
 * smooth. listeners and timers are torn down on unmount.
 */
export default function TileTrail({ active = false }) {
  const stageRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const styles = getComputedStyle(document.documentElement);
    const CELL = parseInt(styles.getPropertyValue("--cell"));

    const BIG_GLYPHS   = [ "{", "}", ">", "<", "#", "λ", "*", "/", "✺", "⌖", "⏥" ];
    const SMALL_GLYPHS = [ "=", ";", "&", "|", "0", "1", "$", "%", "⟴", "()", "[]" ];
    const BIG_SIZE   = 0.98;
    const SMALL_SIZE = 0.69;

    const BRUSH_RADIUS = 2;
    const BRUSH = [];
    for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {
      for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= BRUSH_RADIUS) BRUSH.push({ dx, dy });
      }
    }

    const pick = (a) => a[(Math.random() * a.length) | 0];

    const EMPTY_CHANCE = 0.35;
    const randGlyph = () => {
      if (Math.random() < EMPTY_CHANCE) return { ch: "", size: BIG_SIZE };
      const big = Math.random() < 0.5;
      const pool = big ? BIG_GLYPHS : SMALL_GLYPHS;
      return { ch: pick(pool), size: big ? BIG_SIZE : SMALL_SIZE };
    };
    const cellKey = (c, r) => c + "_" + r;

    const head = new Map();
    let currentKey = null;

    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
      return id;
    };

    function makeTile(col, row) {
      const t = document.createElement("div");
      t.className = "tile";
      const g = randGlyph();
      t.textContent = g.ch;
      t.style.fontSize = CELL * g.size + "px";
      t.style.left = col * CELL + "px";
      t.style.top = row * CELL + "px";
      stage.appendChild(t);
      requestAnimationFrame(() => t.classList.add("in"));
      return t;
    }

    const MIN_TAIL = 150;
    const MAX_TAIL = 380;

    function release(t) {
      const hold = MIN_TAIL + Math.random() * (MAX_TAIL - MIN_TAIL);
      later(() => t.remove(), hold);
    }

    function moveCross(col, row) {
      const desired = new Map();
      for (const { dx, dy } of BRUSH) {
        desired.set(cellKey(col + dx, row + dy), [col + dx, row + dy]);
      }
      for (const [key, el] of head) {
        if (!desired.has(key)) { release(el); head.delete(key); }
      }
      for (const [key, [c, r]] of desired) {
        if (!head.has(key)) head.set(key, makeTile(c, r));
      }
    }

    function drawAt(e) {
      const col = Math.floor(e.clientX / CELL);
      const row = Math.floor(e.clientY / CELL);
      const key = cellKey(col, row);
      if (key === currentKey) return;
      currentKey = key;
      moveCross(col, row);
    }

    // hover-draw: only while active
    const onPointerMove = (e) => { if (activeRef.current) drawAt(e); };
    // when the cursor leaves, let the current cross fade out
    const onPointerLeave = () => {
      for (const [, el] of head) release(el);
      head.clear();
      currentKey = null;
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      timers.forEach(clearTimeout);
      head.clear();
      stage.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="stage"
      style={{
        pointerEvents: active ? "auto" : "none",
        cursor: active ? "crosshair" : "default",
      }}
    />
  );
}
