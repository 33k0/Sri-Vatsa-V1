/**
 * SplitMerge: the experience -> projects transition, driven by scroll progress
 * (normalized 0..1 over the global 2..3 range) so it scrubs both ways like the
 * flip and the void dive. we deep-clone the LIVE experience page (`sourceRef`)
 * four times; each clone sits in a quadrant box clipped to its quarter at 1:1,
 * so the four reconstruct the real page. as progress advances:
 *
 *   0.00-0.10  zoom out (pitch-black void opens around the page)
 *   0.10-0.22  vertical cut   (white pixel beam flashes edge-to-edge)
 *   0.22-0.34  horizontal cut (white pixel beam flashes edge-to-edge)
 *   0.34-0.44  each piece fills the dark site color (card crossfades away)
 *   0.44-0.56  pieces shrink to small squares
 *   0.56-0.66  squares spin +90deg in unison
 *   0.66-0.76  squares turn cream
 *   0.76-0.92  squares enlarge + unspin into the new page surface
 *   0.92-1.00  cream overlay fades to reveal the real projects page
 *
 * the overlay is pointer-events-none and fully transparent at progress 0, so the
 * real experience page stays interactive until you actually scroll into it.
 */
import { useEffect, useState } from "react";
import { motion, useTransform } from "motion/react";

const BLACK = "#10100f"; // the dark background color used across the site (squares)
const VOID = "#000000"; // pitch-black void around the cut page
const CREAM = "#f2e7be"; // matches the projects page background
const ZOOM = 0.55; // how far the page pulls back

function Piece({ p, col, row, qw, qh, vw, vh, side, seamHX, seamHY, attach }) {
  const dx = col === 0 ? -1 : 1;
  const dy = row === 0 ? -1 : 1;
  // container slide: the cuts (held apart, then recentred before the shrink)
  const x = useTransform(p, [0.1, 0.22, 0.44, 0.52], [0, dx * seamHX, dx * seamHX, 0]);
  const y = useTransform(p, [0.22, 0.34, 0.44, 0.52], [0, dy * seamHY, dy * seamHY, 0]);
  // fill tile: real width/height square (rotate can't shear it), spin, color
  const w = useTransform(p, [0.44, 0.56, 0.76, 0.92], [qw, side, side, qw]);
  const h = useTransform(p, [0.44, 0.56, 0.76, 0.92], [qh, side, side, qh]);
  const rotate = useTransform(p, [0.56, 0.66, 0.76, 0.92], [0, 90, 90, 0]);
  const fillOpacity = useTransform(p, [0.34, 0.44], [0, 1]);
  const fillColor = useTransform(p, [0.66, 0.76], [BLACK, CREAM]);
  const cloneOpacity = useTransform(p, [0.34, 0.44], [1, 0]);

  return (
    <motion.div
      className="absolute flex items-center justify-center overflow-hidden"
      style={{ left: col * qw, top: row * qh, width: qw, height: qh, x, y }}
    >
      {/* live-page clone, offset so this box shows its quadrant at 1:1; fades at
          the black step so it never peeks around the shrunken squares */}
      <motion.div
        ref={attach}
        className="pointer-events-none absolute"
        style={{ left: -col * qw, top: -row * qh, width: vw, height: vh, zIndex: 0, opacity: cloneOpacity }}
      />
      {/* fill tile: relative + z so it paints above the absolute clone */}
      <motion.div
        style={{ position: "relative", zIndex: 1, transformOrigin: "50% 50%", width: w, height: h, rotate, opacity: fillOpacity, backgroundColor: fillColor }}
      />
    </motion.div>
  );
}

const measureDims = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return { vw, vh, qw: vw / 2, qh: vh / 2, side: Math.round(Math.min(vw, vh) * 0.11), seamHX: vw * 0.09, seamHY: vh * 0.09 };
};

export default function SplitMerge({ progress, sourceRef }) {
  // the overlay stays mounted for scrubbing, so a mid-session resize would leave
  // the quadrant geometry stale and misaligned; re-measure on resize
  const [dims, setDims] = useState(measureDims);
  useEffect(() => {
    const onResize = () => setDims(measureDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const { vw, vh, qw, qh, side, seamHX, seamHY } = dims;

  // whole-overlay + stage values, all functions of scroll progress
  const overlayOpacity = useTransform(progress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const stageScale = useTransform(progress, [0, 0.1, 0.85, 0.92], [1, ZOOM, ZOOM, 1]);
  const backColor = useTransform(progress, [0.8, 0.9], [VOID, CREAM]);
  const vBeam = useTransform(progress, [0.1, 0.16, 0.22], [0, 1, 0]);
  const hBeam = useTransform(progress, [0.22, 0.28, 0.34], [0, 1, 0]);

  // each quadrant gets its own deep clone of the live page (captured once). the
  // clone is purely visual, so force pointer-events off on it AND every descendant
  // (the source has `pointer-events-auto` nodes like CursorToggle/Socials/cat
  // that would otherwise keep intercepting clicks on the projects page below,
  // since the overlay stays mounted for scrubbing).
  const attach = (el) => {
    if (!el || el.dataset.filled) return;
    const src = sourceRef?.current;
    if (!src) return;
    const clone = src.cloneNode(true);
    clone.style.visibility = "visible";
    clone.style.pointerEvents = "none";
    clone.querySelectorAll("*").forEach((n) => {
      n.style.pointerEvents = "none";
    });
    el.appendChild(clone);
    el.dataset.filled = "1";
  };

  return (
    <motion.div className="pointer-events-none absolute inset-0 z-[95] overflow-hidden" style={{ opacity: overlayOpacity }}>
      {/* opaque backdrop: pitch-black void, turns cream as the page forms */}
      <motion.div className="absolute inset-0" style={{ backgroundColor: backColor }} />

      {/* stage carries the zoom-out; holds the four pieces */}
      <motion.div className="absolute inset-0" style={{ transformOrigin: "50% 50%", scale: stageScale }}>
        {[0, 1, 2, 3].map((i) => (
          <Piece key={i} p={progress} col={i % 2} row={(i / 2) | 0} qw={qw} qh={qh} vw={vw} vh={vh} side={side} seamHX={seamHX} seamHY={seamHY} attach={attach} />
        ))}
      </motion.div>

      {/* hard-edged white pixel beams, edge-to-edge across the whole void */}
      <motion.div className="pointer-events-none absolute top-0 bg-white" style={{ left: vw / 2, width: 32, height: vh, marginLeft: -16, opacity: vBeam }} />
      <motion.div className="pointer-events-none absolute left-0 bg-white" style={{ top: vh / 2, height: 32, width: vw, marginTop: -16, opacity: hBeam }} />
    </motion.div>
  );
}
