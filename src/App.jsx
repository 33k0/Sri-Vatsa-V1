import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import TileTrail from "./components/TileTrail.jsx";
import Landing, { CatScene } from "./components/Landing.jsx";
import BackPage from "./components/BackPage.jsx";
import Page3 from "./components/Page3.jsx";
import ProjectsPage from "./components/ProjectsPage.jsx";
import CursorToggle from "./components/CursorToggle.jsx";
import NavMenu from "./components/NavMenu.jsx";
import TileSweep from "./components/TileSweep.jsx";
import SplitMerge from "./components/SplitMerge.jsx";
import SpeedLines from "./components/SpeedLines.jsx";

// vh of scroll per transition; bigger = slower scrub
const VH_PER_STEP = 2.5;

// nav bar destinations; target is the page/progress index
const NAV_PAGES = [
  { label: "HOME", target: 0 },
  { label: "ABOUT", target: 1 },
  { label: "EXPERIENCE", target: 2 },
  { label: "PROJECTS", target: 3 },
];

// reload: snap back to whatever page you were on, skip its intro, but re-lock
// everything past it so you redo those transitions. we only stash scroll pos.
const NAV_KEY = "portfolio:nav";
let SAVED = null;
try {
  SAVED = JSON.parse(sessionStorage.getItem(NAV_KEY)) || null;
} catch {
  SAVED = null;
}
// grab scroll restoration so the browser doesn't fight our jump
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
const SAVED_PROGRESS = SAVED ? SAVED.progress || 0 : 0;
// page you were on (0 home, 1 about, 2 deep, 3 projects). home doesn't restore,
// it just replays the full intro.
const RESTORE_PAGE =
  SAVED_PROGRESS >= 2.5 ? 3 : SAVED_PROGRESS >= 1.5 ? 2 : SAVED_PROGRESS >= 0.5 ? 1 : 0;
const RESTORING = RESTORE_PAGE > 0;
if (!RESTORING) {
  try {
    sessionStorage.removeItem(NAV_KEY);
  } catch {}
}
// skip intros up to and including where we land
const RESTORE_ABOUT = RESTORE_PAGE >= 1;
const RESTORE_DEEP = RESTORE_PAGE >= 2;
const RESTORE_PROJECTS = RESTORE_PAGE >= 3;

export default function App() {
  const [maxP, setMaxP] = useState(RESTORE_PAGE);   // furthest unlocked page (0–3)
  const [settled, setSettled] = useState(RESTORE_PAGE); // furthest page actually arrived at (post-animation)
  const [trailOn, setTrailOn] = useState(false);    // tile trail starts off; cat turns it on
  const [flipped, setFlipped] = useState(false); // true once past the flip's halfway point
  const [deep, setDeep] = useState(false);       // true once on the page-3 (deep/experience) side
  const [onProjects, setOnProjects] = useState(RESTORE_PROJECTS); // true once on the projects page
  const [inVoid, setInVoid] = useState(false);   // true while BOTH pages are off-screen (mid-void)
  const [expType, setExpType] = useState(RESTORE_DEEP); // start experience typing (before the card slides in)
  const [voidStage, setVoidStage] = useState(0); // unlock-only: 0 none, 1 "???", 2..4 guide cat
  const [shakeBack, setShakeBack] = useState(false); // jolt the about page before the "???"
  const [navConfirmed, setNavConfirmed] = useState(false); // user okayed skipping animations
  const [navConfirmOpen, setNavConfirmOpen] = useState(false); // confirm modal visible
  const [navOpen, setNavOpen] = useState(false);  // nav bar visible
  const [sweepActive, setSweepActive] = useState(false); // tile sweep playing
  const navTargetRef = useRef(0);
  const sweepBusyRef = useRef(false);
  const maxPRef = useRef(RESTORE_PAGE);
  const distRef = useRef(0);                      // page-3 (experience) pan distance (px)
  const distProjRef = useRef(0);                  // projects pan distance (px)
  const busyRef = useRef(false);                  // an unlock animation is playing
  const page3Ref = useRef(null);
  const projRef = useRef(null);

  useEffect(() => {
    maxPRef.current = maxP;
  }, [maxP]);

  // progress 0..3 from document scroll; one viewport height = +1.
  // unlocking a section grows the track, so scrolling scrubs that transition.
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => y / (window.innerHeight * VH_PER_STEP));

  // only stash scroll position; we derive the page from it on reload
  const lastWrite = useRef(0);
  const persist = () => {
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({ progress: progress.get() }));
    } catch {}
  };
  const persistThrottled = () => {
    const now = performance.now();
    if (now - lastWrite.current < 200) return;
    lastWrite.current = now;
    persist();
  };
  useEffect(() => {
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, []);

  // first paint after reload: measure the pan distances, then snap to the page
  // we landed on. set the motion value too so transforms land with no flash.
  useLayoutEffect(() => {
    if (!RESTORING) return;
    // measure both offsets BEFORE the snap: scrollY.set synchronously recomputes
    // worldY, which reads distProjRef. the measure() effect below runs too late
    // (after paint), so restoring onto projects would pan to a stale 0 and show
    // the wrong slot until the next scroll.
    if (page3Ref.current) distRef.current = page3Ref.current.offsetTop;
    if (projRef.current) distProjRef.current = projRef.current.offsetTop;
    const target = RESTORE_PAGE * window.innerHeight * VH_PER_STEP;
    window.scrollTo(0, target);
    scrollY.set(target);
  }, []);

  // page 1 <-> 2 flip
  const rotateY = useTransform(progress, [0, 1], [0, 180], { clamp: true });
  const cardScale = useTransform(progress, [0, 0.5, 1], [1, 0.22, 1], { clamp: true });
  // page 2 <-> 3 depth: zoom out (centered on about), pan, zoom into page 3
  const cameraScale = useTransform(progress, [1, 1.3, 1.8, 2], [1, 0.5, 0.5, 1], { clamp: true });
  const worldY = useTransform(progress, (p) => {
    const d = distRef.current;       // experience offset
    const d2 = distProjRef.current;  // projects offset
    if (p <= 1.3) return 0;
    if (p < 1.8) return -d * ((p - 1.3) / 0.5);
    if (p <= 2) return -d;
    // 2 -> 3: plain vertical pan from experience to projects (camera stays at 1x).
    // progress clamps at 3, so this lerp reaches exactly -d2 there.
    return -d - (d2 - d) * (p - 2);
  });
  // experience -> projects split-merge progress (scrubbed by the 2..3 range)
  const splitP = useTransform(progress, [2, 3], [0, 1], { clamp: true });

  useMotionValueEvent(progress, "change", (p) => {
    setFlipped(p >= 0.5);
    setDeep(p >= 1.5);
    setOnProjects(p >= 2.5);
    // both the about slot [0,vh] and page-3 slot [d,d+vh] are off-screen when
    // we're deep in the void. account for the camera zoom (the visible world
    // window grows as it scales down) so this holds at any zoom.
    const vh = window.innerHeight;
    const s = cameraScale.get() || 1;
    const low = (vh / 2) * (1 - 1 / s); // top edge of the visible world window
    const high = (vh / 2) * (1 + 1 / s); // bottom edge
    const y = -worldY.get(); // how far the world has panned up (px)
    const d = distRef.current;
    setInVoid(d > 0 && y > vh - low && y < d - high);
    persistThrottled();
  });
  useEffect(() => {
    if (flipped) history.replaceState(null, "", "#about");
  }, [flipped]);

  // measure the page-3 / projects distances after layout / unlock / resize
  useEffect(() => {
    const measure = () => {
      if (page3Ref.current) distRef.current = page3Ref.current.offsetTop;
      if (projRef.current) distProjRef.current = projRef.current.offsetTop;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [maxP]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const nextFrame = () =>
    new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // programmatic eased scroll to a target progress (in vh).
  // `ease` lets the caller pick the feel (e.g. accelerate into the dive).
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeLinear = (t) => t;
  const scrollToProgress = (p, duration = 2.4, ease = easeOutCubic) =>
    new Promise((resolve) => {
      const target = p * window.innerHeight * VH_PER_STEP;
      if (reduce() || duration === 0) {
        window.scrollTo(0, target);
        resolve();
        return;
      }
      const start = window.scrollY;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / (duration * 1000));
        window.scrollTo(0, start + (target - start) * ease(k));
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

  const toggleTrail = () => setTrailOn((v) => !v);

  // nav bar: jump straight to a page behind a tile sweep.
  // first NAV click opens the confirm modal, after that it toggles the bar.
  const handleNav = () => {
    if (!navConfirmed) {
      setNavConfirmOpen(true);
      return;
    }
    setNavOpen((v) => !v);
  };
  const confirmNavYes = () => {
    setNavConfirmed(true);
    setNavConfirmOpen(false);
    setNavOpen(true);
  };
  const confirmNavNo = () => setNavConfirmOpen(false);

  // go to a page: unlock up to it (so the track is tall), start the sweep, then
  // jump the scroll while the screen is covered. scrubbing still works after,
  // all we did was move the scroll position.
  const navGo = (target) => {
    if (sweepBusyRef.current || busyRef.current) return;
    navTargetRef.current = target;
    setNavOpen(false);
    setMaxP((m) => Math.max(m, target));
    setSettled((s) => Math.max(s, target));
    sweepBusyRef.current = true;
    // reduced motion: skip the sweep, just jump once the track has grown
    if (reduce()) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          onSweepCovered();
          sweepBusyRef.current = false;
        })
      );
      return;
    }
    setSweepActive(true);
  };
  const onSweepCovered = () => {
    if (page3Ref.current) distRef.current = page3Ref.current.offsetTop;
    if (projRef.current) distProjRef.current = projRef.current.offsetTop;
    const target = navTargetRef.current * window.innerHeight * VH_PER_STEP;
    window.scrollTo(0, target);
    scrollY.set(target);
  };
  const onSweepDone = () => {
    setSweepActive(false);
    sweepBusyRef.current = false;
  };

  // experience -> projects via the cat: unlock projects (tall track), then
  // auto-scroll across 2..3 to scrub the split-merge once. the same range
  // replays it after, it's all progress-driven. mirrors descend.
  const advanceToProjects = async () => {
    if (busyRef.current || sweepBusyRef.current) return;
    busyRef.current = true;
    setMaxP((m) => Math.max(m, 3));
    setSettled((s) => Math.max(s, 3));
    await nextFrame();
    if (page3Ref.current) distRef.current = page3Ref.current.offsetTop;
    if (projRef.current) distProjRef.current = projRef.current.offsetTop;
    await scrollToProgress(3, 8.5, easeInOutCubic);
    busyRef.current = false;
  };

  // unlock page 2: grow the track, then scroll through the flip
  const summon = async () => {
    if (maxPRef.current >= 1 || busyRef.current || sweepBusyRef.current) return;
    busyRef.current = true;
    setMaxP(1);
    await nextFrame();
    await scrollToProgress(1, 4.5);
    setSettled(1);
    busyRef.current = false;
  };

  // unlock page 3: grow the track, then play the scripted descent (cat + ???).
  // scrubbing later only replays the camera/world, never these overlays.
  const descend = async () => {
    if (maxPRef.current >= 2 || busyRef.current || sweepBusyRef.current) return;
    busyRef.current = true;
    setMaxP(2);
    await nextFrame();
    distRef.current = page3Ref.current ? page3Ref.current.offsetTop : window.innerHeight * 3;

    // 1) zoom out, centered on about
    await scrollToProgress(1.3, 1.5);
    // violently jolt the about page in the void, then the "???" hits
    if (!reduce()) {
      setShakeBack(true);
      await delay(550);
      setShakeBack(false);
    }
    // 2) "???" then the guide cat slides in from the right
    setVoidStage(1);
    await delay(700);
    setVoidStage(2);
    await delay(1700);
    // a beat before the plunge, everything goes still
    await delay(750);
    // 3) the DIVE
    setVoidStage(3);
    // accelerate down through the about-page exit (still partly on screen)
    await scrollToProgress(1.53, 1.0, easeInCubic);
    // slow steady cruise, only while it's PURE void (both page edges gone)
    await scrollToProgress(1.57, 3.5, easeLinear);
    // ease out as the deep-end page edge comes into view
    await scrollToProgress(1.8, 0.9, easeOutCubic);
    // start experience typing now; the card itself slides in later, on arrival
    setExpType(true);
    // brief beat as the cat reaches the deep end
    await delay(350);
    // 4) zoom into the deep end (easing to a stop); cat slides away
    setVoidStage(4);
    await scrollToProgress(2, 1.3, easeOutCubic);
    setVoidStage(0);
    setSettled(2); // card slides in on full arrival
    busyRef.current = false;
  };

  return (
    <div className="flip-track" style={{ height: `${(maxP * VH_PER_STEP + 1) * 100}dvh` }}>
      <div className="flip-scene">
        {/* camera = zoom; world = vertical pan across the stacked page slots */}
        <motion.div className="depth-camera" style={{ scale: cameraScale }}>
          <motion.div className="depth-world" style={{ y: worldY }}>
            {/* slot A: pages 1 & 2 (the flip card). Jolts left/right in the void
                just before the "???" during the deep dive. */}
            <motion.div
              className="depth-slot"
              animate={shakeBack ? { rotate: [0, -10, 9, -8, 6, -4, 3, 0] } : { rotate: 0 }}
              transition={shakeBack ? { duration: 0.5, ease: "easeInOut" } : { duration: 0 }}
            >
              <motion.div
                className="flip-card"
                style={{ rotateY, scale: cardScale, transformStyle: "preserve-3d" }}
              >
                <div className="flip-face flip-front">
                  <TileTrail active={trailOn && !flipped} />
                  <Landing onActivate={() => setTrailOn(true)} onSummon={summon} older={settled >= 1} />
                  <CursorToggle theme="dark" on={trailOn} onToggle={toggleTrail} onNav={handleNav} className="left-6 top-6" />
                </div>
                <div className="flip-face flip-back">
                  <TileTrail active={trailOn && flipped && !deep} />
                  <BackPage revealed={flipped} onDescend={descend} older={settled >= 2} shake={shakeBack} instant={RESTORE_ABOUT} />
                  <CursorToggle theme="light" on={trailOn} onToggle={toggleTrail} onNav={handleNav} className="left-6 top-6" />
                </div>
              </motion.div>
            </motion.div>

            {/* deep void between the about page and page 3 */}
            <div className="depth-void" />

            {/* slot B: page 3 (experience), far below past the void */}
            <div ref={page3Ref} className="depth-slot">
              <TileTrail active={trailOn && deep && !onProjects} />
              <Page3 revealed={settled >= 2} typeArmed={expType || settled >= 2} instant={RESTORE_DEEP} onAdvance={advanceToProjects} />
              <CursorToggle theme="dark" on={trailOn} onToggle={toggleTrail} onNav={handleNav} className="left-6 top-6" />
            </div>

            {/* slot C: projects, directly below experience. Hidden until we're
                heading into it, so its cream bg doesn't peek under experience
                while the dive is zoomed out (it's behind the split overlay when
                it switches on, so no flash). */}
            <div ref={projRef} className="depth-slot" style={{ visibility: onProjects ? "visible" : "hidden" }}>
              <TileTrail active={trailOn && onProjects} />
              <ProjectsPage revealed={settled >= 3} instant={RESTORE_PROJECTS} />
              <CursorToggle theme="light" on={trailOn} onToggle={toggleTrail} onNav={handleNav} className="left-6 top-6" />
            </div>
          </motion.div>
        </motion.div>

        {/* speed lines during the plunge, only once both pages are off-screen */}
        {voidStage >= 3 && inVoid && <SpeedLines />}

        {/* unlock-only overlay, fixed on screen, never shown while scrubbing */}
        {voidStage >= 1 && (
          <motion.div
            className="pointer-events-none absolute right-[19%] top-[19%] z-50 font-pixel leading-none text-[#ff3b30]"
            style={{ fontSize: "8vw" }}
            initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
            animate={voidStage >= 3 ? { opacity: 0, scale: 0.8, rotate: 25 } : { opacity: 1, scale: 1, rotate: 25 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            ??!?!
          </motion.div>
        )}
        {voidStage >= 2 && (
          <motion.div
            className="pointer-events-none absolute right-[6%] top-[38%] z-50 w-[26vw] max-w-[340px] overflow-visible"
            initial={{ opacity: 0, x: "130%", y: 0 }}
            animate={
              voidStage >= 4
                ? { opacity: 1, x: 0, y: "120vh" }
                : voidStage >= 3
                  ? { opacity: 1, x: 0, y: "32vh" }
                  : { opacity: 1, x: 0, y: 0 }
            }
            transition={
              voidStage >= 4
                ? { duration: 1.4, ease: [0.83, 0, 0.17, 1] }
                : voidStage >= 3
                  ? { duration: 2.6, ease: [0.5, 0, 0.5, 1] }
                  : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <CatScene
              single
              startDelay={0}
              finalText="WAIT IT'S OVER HERE!!"
              finalClass="font-pixel font-bold text-[clamp(0.35rem,1.2vw,0.95rem)]"
            />
          </motion.div>
        )}

        {/* navigation bar + confirm modal (screen-fixed, above the pages) */}
        <NavMenu
          pages={NAV_PAGES}
          current={onProjects ? 3 : deep ? 2 : flipped ? 1 : 0}
          navOpen={navOpen}
          confirmOpen={navConfirmOpen}
          onGo={navGo}
          onConfirmYes={confirmNavYes}
          onConfirmNo={confirmNavNo}
        />

        {/* tile sweep that covers the screen while a nav jump happens */}
        <TileSweep active={sweepActive} onCovered={onSweepCovered} onDone={onSweepDone} />

        {/* experience -> projects split-merge, scrubbed by scroll over the 2..3
            range. Mounted (so it can clone the live experience page) once projects
            is unlocked and experience has settled; transparent until you scroll in. */}
        {maxP >= 3 && settled >= 2 && <SplitMerge progress={splitP} sourceRef={page3Ref} />}
      </div>
    </div>
  );
}
