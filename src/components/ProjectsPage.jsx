/**
 * Projects page, the last one, reached via the experience-page cat (the
 * SplitMerge transition) or the nav bar. same cream scheme + dithered texture as
 * the about-me page, but instead of one big window it's a 2x2 grid of four
 * smaller "project_N.exe" windows. the top two slide in from the top, the bottom
 * two from the bottom.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DitherBackground from "./DitherBackground.jsx";
import Socials from "./Socials.jsx";
import { CatScene } from "./Landing.jsx";

export const GITHUB = "https://github.com/33k0/";

export const PROJECTS = [
  {
    file: "project_1.exe",
    color: "#bf8fef",
    tag: "// REACT · SUPABASE",
    name: "Pomodoro Focus Timer",
    desc: "A Pomodoro/focus-timer SPA with custom themes, ambient sounds, and Spotify/YouTube music integration, plus a gamified focus system (per-minute XP, levels, streaks, and goal bonuses) backed by a real-time Supabase backend.",
    links: [{ label: "LIVE SITE", href: "https://pomodoro-6hnq.vercel.app/" }],
  },
  {
    file: "project_2.exe",
    color: "#ef988f",
    tag: "// AI RESEARCH",
    name: "PALADIN",
    desc: "A framework that trains language-model agents to recover from real-world tool-call failures — injecting controlled failures and synthesizing recovery trajectories to teach self-correction (recovery rate 52% → 86%). Earned an oral at the AAAI LaMAS workshop.",
    links: [
      { label: "PAPER", href: "https://openreview.net/forum?id=NVTtoO297p" },
      { label: "REPO", href: "https://github.com/33k0/PALADIN-Framework" },
    ],
  },
  {
    file: "project_3.exe",
    color: "#8fefa1",
    tag: "// PORTFOLIO",
    name: "Sri Vatsa — V1",
    desc: "My portfolio, designed with varying effects, animations, and graphics, built using React and Vite. Every section is its own little interactive scene (page flips, a deep dive into the void, and tile sweeps) all wired together with scroll-driven motion.",
    links: [{ label: "REPO · TBD" }],
  },
  {
    file: "project_4.exe",
    color: "#ef8fee",
    tag: "// NONPROFIT",
    name: "For the Record",
    desc: "A site I helped build for a youth-advocacy nonprofit. I worked on the backend structure (PostgreSQL) and a Medium-style article writer built on-site for our journalists.",
    links: [{ label: "VISIT SITE", href: "https://fortherecordjournal.org" }],
  },
];

export default function ProjectsPage({ revealed = false, instant = false }) {
  const reduce = useReducedMotion();

  // latch once revealed so scrubbing back and forth doesn't replay the slide-in
  const [shown, setShown] = useState(instant);
  useEffect(() => {
    if (revealed) setShown(true);
  }, [revealed]);

  // cat slides in a bit after the cards settle, then stays
  const [showCat, setShowCat] = useState(instant);
  useEffect(() => {
    if (!revealed || showCat) return;
    const t = setTimeout(() => setShowCat(true), 1700);
    return () => clearTimeout(t);
  }, [revealed, showCat]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#f2e7be] px-10 py-16 text-[#10100f]">
      {/* same animated dithered texture as the about-me page */}
      <DitherBackground />

      <div className="relative z-10 grid w-full max-w-[1160px] grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
        {PROJECTS.map((p, i) => {
          const fromTop = i < 2; // top row slides from the top, bottom row from below
          return (
            <motion.div
              key={p.file}
              initial={false}
              animate={reduce || shown ? { y: 0, opacity: 1 } : { y: fromTop ? "-150%" : "150%", opacity: 0 }}
              transition={
                reduce || instant
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 120, damping: 20, delay: 1.05 + 0.1 * i }
              }
              className="flex h-full flex-col overflow-hidden rounded-[10px] border-2 border-[#10100f] bg-[#fbf4dd] shadow-[8px_8px_0_0_#10100f]"
            >
              {/* title bar */}
              <div
                className="flex items-center gap-2.5 border-b-2 border-[#10100f] px-3.5 py-1.5"
                style={{ backgroundColor: p.color }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />
                  <span className="h-2 w-2 rounded-full bg-[#fac800]" />
                  <span className="h-2 w-2 rounded-full bg-[#34c759]" />
                </div>
                <h3 className="font-pixel text-[clamp(0.7rem,1.1vw,0.86rem)] tracking-wide">{p.file}</h3>
              </div>

              {/* body (grows so the bottom bar pins to the bottom) */}
              <div className="flex-1 px-4 py-3.5">
                <p className="font-pixel text-[8px] tracking-[0.25em] text-[#ff3b30]">{p.tag}</p>
                <h4 className="mt-1.5 font-pixel text-[clamp(0.85rem,1.35vw,1.05rem)] leading-tight">{p.name}</h4>
                <p className="mt-2 text-[clamp(0.66rem,0.85vw,0.78rem)] leading-relaxed text-[#10100f]/75">
                  {p.desc}
                </p>

                {p.links?.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-3.5 border-t-2 border-[#10100f]/15 pt-2.5">
                    {p.links.map((l) =>
                      l.href ? (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-pixel text-[8px] tracking-[0.18em] text-[#ff3b30] transition-colors hover:text-[#10100f]"
                        >
                          {l.label} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span
                          key={l.label}
                          className="font-pixel text-[8px] tracking-[0.18em] text-[#10100f]/35"
                        >
                          {l.label}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* bottom bar */}
              <div
                className="flex items-center justify-between border-t-2 border-[#10100f] px-4 py-1.5 font-pixel text-[8px] tracking-[0.2em] text-[#10100f]/70"
                style={{ backgroundColor: p.color }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10100f]" /> READY
                </span>
                <span>0{i + 1} / 0{PROJECTS.length}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* cat slides in bottom-right; clicking it opens GitHub */}
      {showCat && (
        <motion.div
          className="pointer-events-none absolute bottom-[1.5%] right-[-5%] z-50 w-[24vw] max-w-[360px] overflow-visible"
          initial={reduce || instant ? false : { opacity: 0, x: "130%" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: instant ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <CatScene
            interactive
            onClick={() => window.open(GITHUB, "_blank", "noopener,noreferrer")}
            ariaLabel="See all projects on GitHub"
            cursorClass="cursor-pointer"
            single
            startDelay={300}
            finalText="Click me to see all projects"
            finalClass="font-pixel leading-tight text-[clamp(0.42rem,1vw,0.68rem)]"
          />
        </motion.div>
      )}

      <Socials theme="light" />
    </div>
  );
}
