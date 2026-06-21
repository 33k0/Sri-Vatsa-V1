/**
 * Page 3, "the deep end": work experience in the SAME retro desktop window as
 * the about-me (BackPage), but recolored to the landing's dark scheme (near-black
 * surface, cream text, red accent, no dither). a left tab rail (with a sliding
 * active indicator on the divider) switches between roles; the selected role's
 * header + bullets type out char by char. reached from the about-me by panning
 * down + zooming in (the App.jsx depth rig).
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Typed, CatScene } from "./Landing.jsx";
import Socials from "./Socials.jsx";

export const JOBS = [
  {
    tab: "UC Berkeley",
    role: "Researcher",
    org: "Sky Computing Lab",
    date: "JAN 2026 - PRESENT",
    points: [
      "Research on LLM tool-use evaluation at the lab behind the Berkeley Function Calling Leaderboard (BFCL)",
      "Building evaluation infrastructure for MCP and multi-turn tool-calling benchmarks",
      "Designed dataset scenarios / traces for several models across multiple MCP domains",
      "Co-author on a NeurIPS 2026 submission (under review) on MCP tool-use evaluation",
    ],
  },
  {
    tab: "Algoverse",
    role: "Lead Researcher",
    org: "Algoverse",
    date: "MAY 2025 - JAN 2026",
    points: [
      "Led a 4-person research team developing an LLM-agent framework; first-author AAAI 2026 workshop oral submission while under the age of 18",
      "Conducted literature reviews, experimental evaluation, and error analysis on agent robustness and tool failure",
      "Coordinated research direction, writing, and revisions under tight deadlines",
    ],
  },
  {
    tab: "Freelance",
    role: "Full-Stack Web Developer",
    org: "Self-Employed",
    date: "FEB 2024 - PRESENT",
    points: [
      "Developing full-stack web applications for various clients, focusing on user-friendly interfaces and robust back-end functionality",
      "Built custom dashboards and applications using React and SQL, enhancing data visualization and accessibility",
      "Delivered projects on time and within budget, resulting in high client satisfaction and repeat business",
    ],
  },
  {
    tab: "Hindu Heritage Hall",
    role: "Technical Volunteer",
    org: "Hindu Heritage Hall",
    date: "NOV 2024 - JAN 2026",
    points: [
      "Led digital architecture for a public-facing cultural exhibition focused on long-form audio and narrative content",
      "Built interactive audio / story exhibits and custom content cataloging and playback systems",
      "Designed volunteer and curator workflows supporting daily operations; trained 10+ volunteers",
      "Systems support 200+ weekly visitors engaging with the exhibits",
    ],
  },
];

const PARA = "text-[clamp(0.9rem,1.2vw,1rem)] leading-relaxed text-[#f2e7be]/95";

/** one role's content: header (role @ org), then date, then bullets, each typed
    in sequence once `start` is true. remounted (via key) on tab change so the
    typing replays from the top. */
function Panel({ job, start }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const next = (i) => () => setStep((s) => Math.max(s, i + 1));

  if (reduce || !start) {
    return (
      <div>
        <h3 className="font-pixel text-[clamp(1.3rem,2.4vw,1.9rem)] leading-tight text-[#fff]">
          {job.role} <span className="text-[#f2e7be]/40">@</span>{" "}
          <span className="font-bold text-[#ff3b30]">{job.org}</span>
        </h3>
        <p className="mt-3 font-pixel text-[11px] tracking-[0.2em] text-[#f2e7be]/70">{job.date}</p>
        <ul className="mt-7 space-y-5">
          {job.points.map((p) => (
            <li key={p} className="flex gap-4">
              <span className="select-none text-[#ff3b30]">▷</span>
              <span className={PARA}>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-pixel text-[clamp(1.3rem,2.4vw,1.9rem)] leading-tight text-[#fff]">
        <Typed text={job.role} start speed={45} onDone={next(0)} />
        {step >= 1 && <span className="text-[#f2e7be]/40"> @ </span>}
        {step >= 1 && (
          <Typed
            text={job.org}
            start
            speed={55}
            className="font-bold text-[#ff3b30]"
            onDone={next(1)}
            cursor={step < 2}
          />
        )}
      </h3>

      {step >= 2 && (
        <p className="mt-3 font-pixel text-[11px] tracking-[0.2em] text-[#f2e7be]/70">{job.date}</p>
      )}

      <ul className="mt-7 space-y-5">
        {job.points.map((p, i) =>
          step >= 2 + i ? (
            <li key={p} className="flex gap-4">
              <span className="select-none text-[#ff3b30]">▷</span>
              <span className={PARA}>
                <Typed text={p} start speed={12} onDone={next(2 + i)} />
              </span>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

export default function Page3({ revealed = false, typeArmed = false, instant = false, onAdvance }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  // on a reload restore (`instant`) the content shows already typed; clicking a
  // tab re-arms the typing effect for subsequent switches.
  const [armed, setArmed] = useState(!instant);
  const select = (i) => {
    setArmed(true);
    setActive(i);
  };

  // the window slides in from the left once you arrive (latched so scrubbing
  // back and forth doesn't replay it); `instant` (reload restore) skips it
  const [shown, setShown] = useState(instant);
  useEffect(() => {
    if (revealed) setShown(true);
  }, [revealed]);

  // start typing as soon as the content is armed (which happens a bit before the
  // card actually slides in, so it lands already mid-typing)
  const [typeStart, setTypeStart] = useState(instant);
  useEffect(() => {
    if (instant || !typeArmed) return;
    setTypeStart(true);
  }, [instant, typeArmed]);

  // a cat slides in after the window settles and invites you onward to projects
  const [showCat, setShowCat] = useState(instant);
  useEffect(() => {
    if (!revealed || showCat) return;
    const t = setTimeout(() => setShowCat(true), 1800);
    return () => clearTimeout(t);
  }, [revealed, showCat]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#10100f] px-10 py-16 text-[#f2e7be]">
      {/* landing-page decor floating behind the card */}
      <motion.img
        src="/cloud.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[3%] top-[5%] z-0 w-[26vw] max-w-[400px]"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src="/meteor.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] right-[5%] z-0 w-[18vw] max-w-[400px]"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* cat slides in bottom-right; clicking it cuts the page apart into projects */}
      {showCat && onAdvance && (
        <motion.div
          className="pointer-events-none absolute bottom-[6%] right-[-4%] z-50 w-[30vw] max-w-[400px] overflow-visible"
          initial={reduce || instant ? false : { opacity: 0, x: "130%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <CatScene
            interactive
            onClick={onAdvance}
            ariaLabel="See my projects"
            cursorClass="cursor-pointer"
            single
            startDelay={300}
            finalText="Wanna see what I built?? Click me :3"
            finalClass="font-pixel leading-tight text-[clamp(0.42rem,1vw,0.68rem)]"
          />
        </motion.div>
      )}

      <motion.div
        initial={false}
        animate={reduce || shown ? { x: 0, opacity: 1 } : { x: "-130%", opacity: 0 }}
        transition={reduce || instant ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, delay: 0.3 }}
        className="relative z-10 w-full max-w-[1080px] overflow-hidden rounded-[12px] border-2 border-[white] bg-[#10100f] shadow-[10px_10px_0_0_#fff]/90"
      >

        {/* title bar; filename types out on reveal */}
        <div className="flex items-center bg-[#e29d37] gap-4 border-b-2 border-[white] px-5 py-2">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff3b30]" />
            <span className="h-3 w-3 rounded-full bg-[#fac800]" />
            <span className="h-3 w-3 rounded-full bg-[#34c759]" />
          </div>
          <h2 className="font-pixel text-[clamp(1.25rem,2.6vw,1.9rem)] tracking-wide text-[#fff]">
            {reduce || instant ? (
              "experience.exe"
            ) : (
              <Typed text="experience.exe" start={typeStart} speed={70} cursor />
            )}
          </h2>
          <span className="ml-auto hidden font-pixel text-[clamp(0.72rem,1.35vw,1rem)] font-bold tracking-wide text-[#fff]/85 sm:block">
            ↖ cursor in the way? turn it off — top left
          </span>
        </div>

        {/* body: tab rail + content */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
          {/* tab rail: vertical divider with a sliding active indicator */}
          <aside className="relative flex flex-row flex-wrap border-b-2 border-[white] py-4 md:flex-col md:flex-nowrap md:border-b-0 md:border-r-2">
            {JOBS.map((job, i) => {
              const on = i === active;
              return (
                <button
                  key={job.tab}
                  onClick={() => select(i)}
                  className={`relative block px-6 py-3 text-left font-pixel text-[clamp(0.68rem,1vw,0.85rem)] tracking-wide transition-colors ${
                    on ? "text-[#f2e7be]" : "text-[#f2e7be]/65 hover:text-[#f2e7be]/35"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="exp-tab-indicator"
                      className="absolute -bottom-[2px] inset-x-4 h-[3px] rounded bg-[#ff3b30] md:-right-[2px] md:bottom-auto md:left-auto md:inset-y-1.5 md:h-auto md:w-[3px]"
                    />
                  )}
                  {job.tab}
                </button>
              );
            })}
          </aside>

          {/* content panel; min-height reserves space so typing doesn't jump the layout */}
          <div className="min-h-[360px] px-11 py-8 md:px-14">
            <Panel key={active} job={JOBS[active]} start={typeStart && armed} />
          </div>
        </div> 

        {/* status bar */}
        <div className="flex items-center bg-[#e29d37] justify-between border-t-2 border-[white] px-11 py-5 font-pixel text-[10px] tracking-[0.2em] text-[#fff]/80">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff3b30]" /> {JOBS.length} ROLES
          </span>
          <span>EXPERIENCE-LOG</span>
        </div>
      </motion.div>

      <Socials theme="dark" />
    </div>
  );
}
