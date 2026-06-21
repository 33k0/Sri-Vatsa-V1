# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # production build to dist/
npm run preview   # serve the production build
```

There is **no test runner, linter, or formatter** configured. "Verify" means: `npm run build` must succeed, then check behavior manually in `npm run dev`. State clearly what you could not verify (most visual/animation behavior cannot be confirmed without running the dev server).

## Stack

Single-page personal portfolio. Vite 6 + React 18 (`StrictMode`) + Tailwind v4 (via `@tailwindcss/vite`, **not** PostCSS) + **Motion** (`motion/react`, the successor to framer-motion). Icons: `@phosphor-icons/react`. Background shaders: `@paper-design/shaders-react` (`DitherBackground`). Fonts self-hosted via `@fontsource` (Pixelify Sans → `.font-pixel`). Entry: `main.jsx` → `App.jsx`.

## Architecture — the scroll engine

The whole site is one scroll-driven "machine" orchestrated by `App.jsx`. Understanding this is mandatory before touching anything animation-related.

**One progress value drives everything.** A single Motion value `progress` = `scrollY / (innerHeight * VH_PER_STEP)` (range 0→3, `VH_PER_STEP = 2.5`). Every transition is a `useTransform` off `progress` — there are **no parallel scroll listeners**. To add/adjust motion, map it off `progress`, never read scroll yourself.

**The track grows as pages unlock.** The outer `.flip-track` height is `(maxP * VH_PER_STEP + 1) * 100dvh`. Unlocking a page bumps `maxP`, which makes the track taller, which means scrolling now scrubs that page's transition. Two state vars track this:
- `maxP` — furthest **unlocked** page (controls track height).
- `settled` — furthest page actually **arrived at** post-animation (gates page intro animations / reveals).
- `busyRef` / `sweepBusyRef` — guard scripted animations so they don't overlap or replay.

**The DOM rig** (CSS in `index.css`): `.flip-scene` (sticky, `perspective`) → `.depth-camera` (`scale` = `cameraScale`) → `.depth-world` (`y` = `worldY`) → stacked full-height `.depth-slot`s + a tall `.depth-void` spacer (`230dvh`), all `preserve-3d`. Slot A = the flip card (Landing front / BackPage back), then `.depth-void`, then slot B = Page3 (experience), then slot C = ProjectsPage.

**Progress map (the four "pages"):**
| range | transition | mechanism |
|---|---|---|
| 0→1 | 3D card flip (Landing ↔ BackPage/about) | `rotateY` 0→180 + `cardScale` dip on `.flip-card` |
| 1→2 | the "void dive" into the deep end | `cameraScale` (zoom out then in) + `worldY` pan across the `.depth-void`, plus scripted overlays (`descend()`) |
| 2→3 | experience → projects "split-merge" | `SplitMerge` overlay, scrubbed by `splitP = useTransform(progress, [2,3], [0,1])` |

**Unlock-then-scrub pattern.** Each page is unlocked by clicking a **cat** (`CatScene`), which runs a scripted handler (`summon` → flip, `descend` → dive, `advanceToProjects` → split). Each handler bumps `maxP`, then `await scrollToProgress(...)` (rAF eased programmatic scroll) to *play* the transition once. Afterwards the same scroll range **scrubs it both directions** because it's all `useTransform` off `progress`. One-time theatrics that should NOT replay on scrub (the guide cat, the "???", `SpeedLines`) are gated by separate state (`voidStage`, `shakeBack`) set only during the scripted scroll.

**Reduced motion** is honored throughout via `useReducedMotion()` / `matchMedia` — scripted scrolls jump instantly.

## Persistence (reload behavior)

`sessionStorage["portfolio:nav"]` stores only `{progress}`. On reload, `App.jsx` module-level code derives `RESTORE_PAGE`, snaps to that page (`history.scrollRestoration = "manual"`) with its intro animations **skipped** (pages take an `instant` prop), but **re-locks** everything past it (`maxP` = restore page) so those transitions must be redone. Reloading on Home does a full reset.

## SplitMerge (the experience→projects transition)

`SplitMerge.jsx` is progress-driven and worth understanding as the template for "clone + scrub" effects: it `cloneNode(true)`s the live experience page (`page3Ref`) four times, clips each clone to a quadrant (1:1), and drives cut → black → shrink-to-square → 90° spin → cream → enlarge → reveal **continuously** from `splitP` via `useTransform`. The overlay is `pointer-events-none` and transparent at progress 2, so the real page stays interactive until you scroll in. Hard-won gotchas baked in (don't regress them):
- A `visibility:hidden` source gets that style copied by `cloneNode`; reset `clone.style.visibility = "visible"`.
- Absolute children paint **above** static siblings; the fill that covers the clone needs `position:relative` + `zIndex` to sit on top.
- Make squares with real `width`/`height`, never non-uniform `scale` — a `rotate` shears a non-uniformly-scaled box into a rectangle.
- `DEBUG` flag scrubs phases by wheel for tuning.

## Navigation & overlays

`NavMenu` (top nav bar + "skip the animations?" confirm modal) calls `navGo()`, which unlocks the target and jumps via `TileSweep` (a full-screen diagonal tile cover that fires `onCovered` at peak coverage — that's where the scroll is teleported, hidden behind the tiles). The `CursorToggle` pill (cursor-trail toggle + NAV button) sits on every page. `TileTrail` is the cursor-driven glyph-trail background — it writes the DOM **imperatively** (refs, not React state) for performance and is gated by `trailOn`; mirror that approach for any continuous pointer effect.

## Conventions & traps specific to this codebase

- **Never** use `useState` for continuous scroll/pointer values — it re-renders the tree every frame and collapses on mobile. Use Motion values / `useTransform`, or imperative DOM like `TileTrail`.
- `StrictMode` double-invokes effects in dev; anything with timers/clones (e.g. `SplitMerge`) must be StrictMode-safe (clean up in the effect return).
- **Geometry coupling:** the `.depth-void` height (`230dvh`) is tied to the `descend()` "pure void" cruise — the slow cruise + speed lines assume both page edges are off-screen at `cameraScale 0.5`, which only holds when the void is taller than ~200vh. Changing the void height requires retuning `descend()`'s cruise breakpoints.
- **`public/cat.svg` must not be edited** — speech-bubble text is an HTML overlay positioned over the SVG, never baked into the file.
- Palette: dark `#10100f`, void `#000000`, cream `#f2e7be` / `#fbefc5`, red accent `#ff3b30`. Retro desktop-window / pixel aesthetic.
- `tile-trail.html` is a standalone prototype for reference, not part of the build.

---

## Core Principles

Think before acting. Do not make assumptions about code, architecture, data, APIs, or intent — investigate first. Prefer the simplest solution that satisfies the requirement. Do not introduce abstractions, patterns, frameworks, or refactors unless necessary for the requested task. Make surgical changes only; do not modify unrelated files, logic, formatting, imports, or structure. Change the fewest files possible. Do not rewrite working code or perform opportunistic refactors. If critical information is missing, ask — never guess.

## UI Gotcha: scroll containers clip child effects

Setting `overflow-y-auto` (or `overflow-hidden`) on a container makes the
**computed `overflow-x` become `auto` too**, so the box clips on **all four
sides** — slicing any child's `box-shadow`, `ring`, focus halo, glow, and
`whileHover` scale / `.ui-lift` that extends past the content edge. This was the
root cause of the persistent "pill/panel cut-off" bug.

Rule: any scroll/clip region that holds elevated children (cards, pills,
anything with a shadow/ring/glow/hover-scale) must use the **`.scroll-soft`**
utility (in [src/index.css](src/index.css)) — `overflow-y: auto` + even padding
on every side — instead of bare `overflow-y-auto` plus a thin breathing margin.
Don't place glowing/elevated elements inside a `rounded-* overflow-hidden` card.

## Communication

Be concise. Explain non-obvious decisions and state assumptions explicitly. When finished, report: what changed, files modified, how to verify, and remaining risks or unknowns.
