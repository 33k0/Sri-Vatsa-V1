import { useReducedMotion } from "motion/react";
import { Dithering } from "@paper-design/shaders-react";

/**
 * Animated dithered wave background, recolored to the site's cream scheme.
 * The pattern sits a touch DARKER than the page so it reads as subtle texture
 * behind the about-me window rather than a loud effect. Decorative + inert
 * (pointer-events-none), so the trail and window stay fully interactive.
 */
export default function DitherBackground({ className = "" }) {
  const reduce = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Dithering
        colorBack="#f2e7be"   /* page cream, the base */
        colorFront="#d8c489"  /* darker tan, the animated wave */
        speed={reduce ? 0 : 0.3}
        shape="wave"
        type="4x4"
        pxSize={3}
        scale={1.1}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
