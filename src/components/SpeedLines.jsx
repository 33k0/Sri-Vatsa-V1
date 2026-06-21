/**
 * Vertical white "speed lines" shown during the deep dive to sell the sense of
 * fast downward motion. Thin white streaks rush UP past the viewport (the world
 * is moving down), staggered and accelerating. Decorative + inert.
 */
import { motion } from "motion/react";

// fixed set so the streaks are stable across re-renders
const LINES = Array.from({ length: 28 }, () => ({
  left: Math.random() * 100, // vw %
  width: 1 + Math.random() * 2, // px
  height: 16 + Math.random() * 30, // vh
  delay: Math.random() * 0.5, // s
  duration: 0.4 + Math.random() * 0.35, // s
  opacity: 0.25 + Math.random() * 0.5,
}));

export default function SpeedLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[45] overflow-hidden">
      {LINES.map((l, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-full"
          style={{
            left: `${l.left}%`,
            width: l.width,
            height: `${l.height}vh`,
            background: "linear-gradient(to bottom, transparent, #ffffff, transparent)",
          }}
          initial={{ y: "115vh", opacity: 0 }}
          animate={{ y: "-130vh", opacity: [0, l.opacity, l.opacity, 0] }}
          transition={{ duration: l.duration, delay: l.delay, repeat: Infinity, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
