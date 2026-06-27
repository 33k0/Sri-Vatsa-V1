/**
 * the "other side" revealed by the page flip: an about-me, framed as a retro
 * desktop window. a filled title bar (the dots + the filename as the heading),
 * a sidebar + bio body, then a filled status bar. the reading column is
 * width-capped so lines stay short and the layout breathes.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DitherBackground from "./DitherBackground.jsx";
import Socials from "./Socials.jsx";
import { CatScene, Typed, TypedRich } from "./Landing.jsx";

export const TECH = [
  "Python",
  "React.js",
  "ML / PyTorch",
  "Supabase",
  "AWS",
  "PostgreSQL"
];

const HL = "font-semibold text-[#ff3b30]"; // accent highlight, matches the front
const PARA = "text-[clamp(0.88rem,1.25vw,1rem)] leading-loose text-[#10100f]/80";

// bio as typed segments; highlighted phrases (hl) keep the accent color while
// the whole paragraph types out (see TypedRich). each paragraph types in turn.
export const BIO = [
  [
    { text: "I'm " },
    { text: "18", hl: true },
    { text: " at the moment and currently a freshman at " },
    { text: "San José State University", hl: true },
    { text: " studying toward a CS degree. Recently I've been focused on research, taking on a project at " },
    { text: "UC Berkeley's Sky Computing Lab", hl: true },
    { text: " which involved contributing to the " },
    { text: "Berkeley Function Calling Leaderboard", hl: true },
    { text: ". My research centers on " },
    { text: "Agentic AI", hl: true },
    { text: ", focusing on how agents interact with tools, and is expanding as I go deeper into the domain." },
  ],
  [
    { text: "Outside of research, I do full-stack freelance web development, building websites for clients when I can." },
  ],
  [
    { text: "In my free time, I watch TV shows, go to the gym, or hang out with friends. I love fast-paced environments where I can build real projects." },
  ],
];

/** The bio, typed one paragraph after another once `start` is true (matches the
    experience page). Falls back to static text for reduced motion. */
function Bio({ start, instant = false }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const next = (i) => () => setStep((s) => Math.max(s, i + 1));

  if (reduce || instant) {
    return BIO.map((segs, i) => (
      <p key={i} className={PARA}>
        {segs.map((s, j) => (
          <span key={j} className={s.hl ? HL : undefined}>{s.text}</span>
        ))}
      </p>
    ));
  }

  return BIO.map((segs, i) =>
    step >= i ? (
      <p key={i} className={PARA}>
        <TypedRich
          segments={segs.map((s) => ({ text: s.text, className: s.hl ? HL : undefined }))}
          start={start}
          speed={11}
          onDone={next(i)}
          cursor={step === i}
        />
      </p>
    ) : null
  );
}

export default function BackPage({ revealed = false, onDescend, older = false, shake = false, instant = false }) {
  const reduce = useReducedMotion();

  // once the about page has been revealed it stays put (so scrubbing back and
  // forth doesn't re-slide the window or replay the cat entrance). on a reload
  // restore (`instant`) it starts already settled, no slide, no retype.
  const [shown, setShown] = useState(instant);
  useEffect(() => {
    if (revealed) setShown(true);
  }, [revealed]);

  // start typing the title + bio once the window has slid in and settled
  const [typeStart, setTypeStart] = useState(false);
  useEffect(() => {
    if (instant || !revealed || typeStart) return;
    const t = setTimeout(() => setTypeStart(true), reduce ? 0 : 2400);
    return () => clearTimeout(t);
  }, [instant, revealed, typeStart, reduce]);

  // cat shows up a bit after the window first settles, then stays
  const [showCat, setShowCat] = useState(instant);
  useEffect(() => {
    if (!revealed || showCat) return;
    const t = setTimeout(() => setShowCat(true), 4000);
    return () => clearTimeout(t);
  }, [revealed, showCat]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#f2e7be] px-10 py-16 text-[#10100f]">
      {/* animated dithered texture behind the window */}
      <DitherBackground />

      {/* cat slides in bottom-right and invites you to the next page */}
      {showCat && (
        <motion.div
          className="pointer-events-none absolute bottom-[12%] right-[-5%] z-50 w-[32vw] max-w-[420px] overflow-visible"
          initial={reduce || instant ? false : { opacity: 0, x: "130%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <CatScene
            interactive
            onClick={onDescend}
            ariaLabel="Go to the next page"
            cursorClass="cursor-pointer"
            single
            startDelay={300}
            finalText={older ? "Scroll to go back :3" : "Wanna see more?? Click me againn :3"}
            finalClass="font-pixel leading-tight text-[clamp(0.5rem,1.2vw,0.78rem)]"
          />
        </motion.div>
      )}

      {/* the window slides in from the top once the flip reveals this side */}
      <motion.div
        initial={false}
        animate={reduce || shown ? { y: 0, opacity: 1 } : { y: "-130%", opacity: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, delay: 2.0 }}
        className="relative z-10 w-full max-w-[1080px] overflow-hidden rounded-[12px] border-2 border-[#10100f] bg-[#fbf4dd] shadow-[10px_10px_0_0_#10100f]"
      >
        {/* dots row; the filename doubles as the title */}
        <div className="flex items-center  bg-[#8fbfef] gap-4 border-b-2 border-[#10100f] px-5 py-2">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff3b30]" />
            <span className="h-3 w-3 rounded-full bg-[#fac800]" />
            <span className="h-3 w-3 rounded-full bg-[#34c759]" />
          </div>
          <h2 className="font-pixel text-[clamp(1.25rem,2.6vw,1.9rem)] tracking-wide">
            {reduce || instant ? "about_me.exe" : <Typed text="about_me.exe" start={typeStart} speed={70} cursor />}
          </h2>
        </div>

        {/* body: sidebar + main */}
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr]">
          <aside className="border-b-2 border-[#000] px-11 py-7 md:border-b-0 md:border-r-2">
            <p className="font-pixel text-[10px] tracking-[0.25em] text-[#ff3b30]">// WHOAMI</p>
            <p className="mt-4 font-pixel text-[clamp(1rem,1.7vw,1.2rem)] leading-tight">SRI VATSA</p>
            <p className="mt-2.5 text-[11px] tracking-wide text-[#10100f]/55">18 · SJSU — CS</p>

            <p className="mt-12 font-pixel text-[10px] tracking-[0.25em] text-[#ff3b30]">// STACK</p>
            <ul className="mt-4 space-y-3.5 text-[clamp(0.8rem,1.1vw,0.92rem)] text-[#10100f]/75">
              {TECH.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="text-[#ff3b30]">▷</span>
                  {t}
                </li>
              ))}
            </ul>
          </aside>

          {/* main content, typed paragraph by paragraph (min-h reserves space) */}
          <div className="min-h-[300px] space-y-6 px-11 py-7 md:px-14 md:py-8">
            <Bio start={typeStart} instant={instant} />
          </div>
        </div>

        {/* status bar */}
        <div className="flex items-center justify-between bg-[#8fbfef] border-t-2 border-[#10100f] px-11 py-5 font-pixel text-[10px] tracking-[0.2em] text-[#10100f]/60">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff3b30]" /> ONLINE
          </span>
          <span>REACT-MOTION-V1</span>
        </div>
      </motion.div>

      <Socials theme="light" />
    </div>
  );
}
