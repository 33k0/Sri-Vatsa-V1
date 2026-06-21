/**
 * Mobile portfolio: a plain, static, top-to-bottom scroll. none of the desktop
 * scroll-rig theatrics (no flip, void dive, split-merge, tile trail, or cats),
 * those are slow and annoying on a phone. reuses the same content as the desktop
 * pages (imported, single source of truth) in simple stacked sections, keeping
 * the pixel / retro-window look but fully static.
 *
 * picked by Root.jsx on small viewports; the desktop App never mounts here.
 */
import { useEffect, useState } from "react";
import { GithubLogo, LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react";
import { ROLES } from "./components/Landing.jsx";
import { BIO, TECH } from "./components/BackPage.jsx";
import { JOBS } from "./components/Page3.jsx";
import { PROJECTS, GITHUB } from "./components/ProjectsPage.jsx";
import { LINKS, EMAIL } from "./components/Socials.jsx";

/** macOS-style traffic-light dots used on every window title bar. */
function Dots() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />
      <span className="h-2 w-2 rounded-full bg-[#fac800]" />
      <span className="h-2 w-2 rounded-full bg-[#34c759]" />
    </span>
  );
}

/** Inline social row (GitHub / LinkedIn / email-copy). */
function SocialRow({ dark = true, className = "" }) {
  const [copied, setCopied] = useState(false);
  const color = dark ? "text-[#f2e7be]/65 hover:text-[#ff6a2c]" : "text-[#10100f]/60 hover:text-[#ff3b30]";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked, fall back to mailto below */
    }
  };
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {LINKS.map(({ Icon, href, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className={`transition-colors ${color}`}>
          <Icon size={26} weight="fill" />
        </a>
      ))}
      <a href={`mailto:${EMAIL}`} onClick={copy} aria-label="Email" className={`transition-colors ${color}`}>
        <EnvelopeSimple size={26} weight="fill" />
      </a>
      {copied && <span className="font-mono text-[11px] opacity-70">copied!</span>}
    </div>
  );
}

/** Retro desktop window wrapper (title bar + dots + body). */
function Window({ title, barColor, dark = false, children }) {
  const border = dark ? "border-white/80" : "border-[#10100f]";
  const shadow = dark ? "shadow-[6px_6px_0_0_rgba(255,255,255,0.18)]" : "shadow-[6px_6px_0_0_#10100f]";
  return (
    <div className={`overflow-hidden rounded-[10px] border-2 ${border} ${shadow} ${dark ? "bg-[#10100f]" : "bg-[#fbf4dd]"}`}>
      <div className={`flex items-center gap-2.5 border-b-2 ${border} px-3.5 py-2`} style={barColor ? { backgroundColor: barColor } : undefined}>
        <Dots />
        <span className={`font-pixel text-[13px] tracking-wide ${dark ? "text-white" : "text-[#10100f]"}`}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function MobileApp() {
  // normal scrolling page, let the browser handle scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#10100f] font-mono text-[#f2e7be]">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="flex min-h-[92dvh] flex-col justify-center px-6 py-20">
        <p className="mb-6 font-pixel text-[10px] tracking-[0.35em] text-[#ff3b30]">● SYSTEM ONLINE</p>
        <h1 className="font-pixel leading-[1.04]">
          <span className="block text-[clamp(0.95rem,4.5vw,1.35rem)] tracking-[0.15em] text-[#f2e7be]/85">HI, I'M</span>
          <span className="block text-[clamp(3rem,17vw,5.5rem)]">SRI VATSA</span>
        </h1>
        <ul className="mt-7 space-y-1.5 font-pixel text-[11px] tracking-[0.28em] text-[#f2e7be]/55">
          {ROLES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-7 max-w-[42ch] text-[clamp(0.9rem,4vw,1.05rem)] leading-relaxed text-[#f2e7be]/75">
          18 · CS @ San José State. Researching agentic AI and building full-stack web.
        </p>
        <SocialRow className="mt-8" />
        <p className="mt-14 font-pixel text-[9px] tracking-[0.3em] text-[#f2e7be]/35">↓ SCROLL</p>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────── */}
      <section className="bg-[#f2e7be] px-5 py-16 text-[#10100f]">
        <Window title="about_me.exe" barColor="#8fbfef">
          <p className="font-pixel text-[10px] tracking-[0.25em] text-[#ff3b30]">// WHOAMI</p>
          <h2 className="mt-2 font-pixel text-[clamp(1.4rem,6.5vw,1.8rem)] leading-tight">SRI VATSA</h2>
          <p className="mt-1 text-[12px] tracking-wide text-[#10100f]/55">18 · SJSU — CS</p>

          <div className="mt-6 space-y-4">
            {BIO.map((segs, i) => (
              <p key={i} className="text-[clamp(0.9rem,3.9vw,1rem)] leading-relaxed text-[#10100f]/80">
                {segs.map((s, j) => (
                  <span key={j} className={s.hl ? "font-semibold text-[#ff3b30]" : undefined}>
                    {s.text}
                  </span>
                ))}
              </p>
            ))}
          </div>

          <p className="mt-8 font-pixel text-[10px] tracking-[0.25em] text-[#ff3b30]">// STACK</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TECH.map((t) => (
              <li key={t} className="border-2 border-[#10100f] px-2.5 py-1 font-pixel text-[11px] tracking-wide">
                {t}
              </li>
            ))}
          </ul>
        </Window>
      </section>

      {/* ── EXPERIENCE ─────────────────────────────────────── */}
      <section className="px-5 py-16">
        <h2 className="font-pixel text-[clamp(1.5rem,7vw,2rem)] text-white">experience.exe</h2>
        <div className="mt-2 h-[3px] w-16 bg-[#ff3b30]" />
        <div className="mt-8 space-y-6">
          {JOBS.map((job) => (
            <div key={job.tab} className="rounded-[10px] border-2 border-white/70 p-5 shadow-[6px_6px_0_0_rgba(255,255,255,0.15)]">
              <p className="font-pixel text-[10px] tracking-[0.22em] text-[#f2e7be]/55">{job.tab}</p>
              <h3 className="mt-1 font-pixel text-[clamp(1.05rem,4.8vw,1.35rem)] leading-tight text-white">
                {job.role} <span className="text-[#f2e7be]/40">@</span> <span className="font-bold text-[#ff3b30]">{job.org}</span>
              </h3>
              <p className="mt-1.5 font-pixel text-[10px] tracking-[0.2em] text-[#f2e7be]/55">{job.date}</p>
              <ul className="mt-4 space-y-2.5">
                {job.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-[clamp(0.84rem,3.7vw,0.95rem)] leading-relaxed text-[#f2e7be]/90">
                    <span className="mt-[2px] select-none text-[#ff3b30]">▷</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ───────────────────────────────────────── */}
      <section className="bg-[#f2e7be] px-5 py-16 text-[#10100f]">
        <h2 className="font-pixel text-[clamp(1.5rem,7vw,2rem)]">projects</h2>
        <div className="mt-2 h-[3px] w-16 bg-[#ff3b30]" />
        <div className="mt-8 space-y-6">
          {PROJECTS.map((p) => (
            <div key={p.file} className="overflow-hidden rounded-[10px] border-2 border-[#10100f] bg-[#fbf4dd] shadow-[6px_6px_0_0_#10100f]">
              <div className="flex items-center gap-2.5 border-b-2 border-[#10100f] px-3.5 py-2" style={{ backgroundColor: p.color }}>
                <Dots />
                <span className="font-pixel text-[12px] tracking-wide">{p.file}</span>
              </div>
              <div className="p-4">
                <p className="font-pixel text-[9px] tracking-[0.25em] text-[#ff3b30]">{p.tag}</p>
                <h3 className="mt-1.5 font-pixel text-[clamp(1.05rem,4.8vw,1.25rem)] leading-tight">{p.name}</h3>
                <p className="mt-2 text-[clamp(0.84rem,3.7vw,0.94rem)] leading-relaxed text-[#10100f]/75">{p.desc}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3.5 border-t-2 border-[#10100f]/15 pt-2.5">
                  {p.links.map((l) =>
                    l.href ? (
                      <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="font-pixel text-[9px] tracking-[0.18em] text-[#ff3b30]">
                        {l.label} ↗
                      </a>
                    ) : (
                      <span key={l.label} className="font-pixel text-[9px] tracking-[0.18em] text-[#10100f]/35">
                        {l.label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <a href={GITHUB} target="_blank" rel="noreferrer" className="mt-8 inline-block border-2 border-[#10100f] bg-[#10100f] px-4 py-2 font-pixel text-[11px] tracking-[0.18em] text-[#f2e7be]">
          See all projects on GitHub ↗
        </a>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="flex flex-col items-center px-5 py-12 text-center">
        <SocialRow className="justify-center" />
        <p className="mt-6 font-pixel text-[9px] tracking-[0.3em] text-[#f2e7be]/35">© SRI VATSA · V1</p>
      </footer>
    </div>
  );
}
