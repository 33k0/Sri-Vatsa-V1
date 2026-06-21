import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Socials from "./Socials.jsx";

export const ROLES = ["SOFTWARE ENGINEER", "AI SYSTEMS BUILDER", "FULL STACK DEVELOPER"];

// roles slide up from underneath, one after another
const rolesContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.3 } },
};
const roleLine = {
  hidden: { y: "120%" },
  show: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

/** Types out `text` one char at a time once `start` is true, then fires onDone. */
export function Typed({ text, start, speed = 50, onDone, className, cursor }) {
  const [n, setN] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!start) return;
    if (n >= text.length) {
      onDoneRef.current?.();
      return;
    }
    const id = setTimeout(() => setN((x) => x + 1), speed);
    return () => clearTimeout(id);
  }, [start, n, text, speed]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      {cursor && start && <span className="blink">_</span>}
    </span>
  );
}

/** Like Typed, but types across an array of `segments` ([{ text, className }]),
    so highlighted words keep their color while the whole line types as one. */
export function TypedRich({ segments, start, speed = 16, onDone, cursor }) {
  const total = segments.reduce((a, s) => a + s.text.length, 0);
  const [n, setN] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!start) return;
    if (n >= total) {
      onDoneRef.current?.();
      return;
    }
    const id = setTimeout(() => setN((x) => x + 1), speed);
    return () => clearTimeout(id);
  }, [start, n, total, speed]);

  let before = 0;
  return (
    <>
      {segments.map((s, i) => {
        const take = Math.max(0, Math.min(s.text.length, n - before));
        before += s.text.length;
        return (
          <span key={i} className={s.className}>
            {s.text.slice(0, take)}
          </span>
        );
      })}
      {cursor && start && n < total && <span className="blink">_</span>}
    </>
  );
}

/** Cat scene: the whole group (cat + bubble) idle-bobs, then enlarges and bounces
    while the bubble plays type "WORD!" -> big "WORD" -> finalText.
    `mirrored` flips the cat to face the other way while keeping the bubble text
    readable. `onFinal` fires once the bubble settles on its final line. */
export function CatScene({
  mirrored = false,
  word = "HEY",
  bigText,                       // enlarged line; defaults to `word`
  typed = true,                  // play the char-by-char "WORD!" stage first
  bigClass = "text-[#ff3b30]",   // color of the enlarged word
  bigSizeClass = "text-[clamp(2.3rem,5.5vw,3.6rem)]", // size of the enlarged word
  startDelay = 1200,             // wait before the bubble starts talking
  single = false,                // skip the typed + enlarged stages: just finalText
  midText,                       // optional line shown between big WORD and finalText
  finalText = "Click mee!",
  finalClass = "font-pixel text-[clamp(.65rem,2vw,1.2rem)]",
  onFinal,
  onClick,                       // click handler bound to the cat-sized hit box
  interactive = false,           // enables the click box (pointer events + a11y)
  cursorClass = "cursor-pointer",
  ariaLabel,
}) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(-1); // -1 idle, 0 type WORD!, 1 big WORD, 2 midText, 3 finalText
  const bigContent = bigText ?? word;

  useEffect(() => {
    // `single` jumps straight to the plain final line (no typing, no enlargement)
    const t = setTimeout(() => setStage(single ? 3 : typed ? 0 : 1), startDelay);
    return () => clearTimeout(t);
  }, [typed, startDelay, single]);

  useEffect(() => {
    if (stage === 1) {
      // hold the big WORD, then go to midText (if any) or straight to finalText
      const t = setTimeout(() => setStage(midText ? 2 : 3), 1500);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 1600); // hold midText, then settle
      return () => clearTimeout(t);
    }
  }, [stage, midText]);

  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;
  useEffect(() => {
    if (stage === 3) onFinalRef.current?.();
  }, [stage]);

  const hype = stage === 1;

  // the cat + bubble move together: gentle idle bob, or enlarge + bounce on WORD
  const groupAnim = reduce
    ? undefined
    : hype
      ? { scale: 1.28, y: [0, -16, 0], rotate: 0, x: 0 }
      : { scale: 1, rotate: 0, x: 0, y: [0, -10, 0] };
  const groupTransition = hype
    ? {
        scale: { type: "spring", stiffness: 320, damping: 14 },
        y: { repeat: Infinity, duration: 0.55, ease: "easeInOut" },
      }
    : {
        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 300, damping: 18 },
        rotate: { duration: 0.3 },
        x: { duration: 0.3 },
      };

  return (
    // static mirror wrapper: flips the whole cat (img + bubble graphic) together,
    // so the bubble overlay below stays glued to the (now mirrored) bubble.
    <div style={mirrored ? { transform: "scaleX(-1)" } : undefined}>
      {/* group is sized to the cat art (w-[60%]) so the click box hugs the cat,
          not the whole positioning wrapper. */}
      <motion.div
        className={`relative w-[60%] origin-bottom overflow-visible ${interactive ? `pointer-events-auto ${cursorClass}` : ""}`}
        animate={groupAnim}
        transition={groupTransition}
        onClick={onClick}
        // the cats are the primary way to advance pages, so the role/tabIndex
        // a11y affordance must actually fire on Enter/Space, not just click
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e);
                }
              }
            : undefined
        }
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={ariaLabel}
      >
        <img src="/cat.svg" alt="" aria-hidden="true" className="w-full" />

        {/* counter-flip just the text so it reads normally on a mirrored cat.
            Coords are relative to the cat-sized group (left/w scaled up from the
            old wrapper-relative values: 7%/0.6≈12%, 30%/0.6=50%). */}
        <div
          className="absolute left-[12%] top-[7%] flex h-[14%] w-[50%] items-center justify-center text-center text-[#10100f]"
          style={mirrored ? { transform: "scaleX(-1)" } : undefined}
        >
          {stage === 0 && (
            <span className="font-pixel text-[clamp(0.75rem,2vw,1.2rem)]">
              <Typed text={`${word}!`} start speed={110} onDone={() => setTimeout(() => setStage(1), 450)} />
            </span>
          )}

          {stage === 1 && (
            <Typed
              text={bigContent}
              start
              speed={90}
              className={`font-pixel font-bold ${bigClass} ${bigSizeClass}`}
            />
          )}

          {stage === 2 && <Typed text={midText} start speed={55} className={finalClass} />}

          {stage === 3 && <Typed text={finalText} start speed={55} className={finalClass} />}
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing({ onActivate, onSummon, older = false }) {
  // sequential typing: each line starts when the previous one finishes
  const [step, setStep] = useState(0);
  const next = (i) => () => setStep((s) => Math.max(s, i + 1));
  const reduce = useReducedMotion();

  // cat journey: intro (top-right) -> leaving (slides off left) -> arrived (mirror, bottom)
  const [catPhase, setCatPhase] = useState("intro");
  const [catReady, setCatReady] = useState(false); // first cat finished saying "click me!"
  const [showCat, setShowCat] = useState(false);   // cat enters last, after everything else

  // once the hero typing is done (step 3), the roles/socials/version slide in over
  // ~3.4s; only then mount the cat so it (and its bubble) start fresh, appearing last.
  useEffect(() => {
    if (step < 3) return;
    const t = setTimeout(() => setShowCat(true), 3400);
    return () => clearTimeout(t);
  }, [step]);

  const handleCatClick = () => {
    if (catPhase !== "intro" || !catReady) return; // not clickable until it says "click me!"
    onActivate?.();          // switch on the tile trail
    setCatPhase("leaving");  // and send the cat off-screen
  };
  const handleSummon = () => {
    onSummon?.(); // clicking the second cat triggers the page flip
  };

  return (
    <>
    <main className="pointer-events-none relative z-10 min-h-[100dvh]">
      {/* decorative pixel art, behind the hero text.
          wrapper handles the entrance; inner img does the idle float loop. */}
      <motion.div
        className="fixed top-20 left-20 z-0 w-[34vw] max-w-[460px]"
        initial={reduce ? false : { opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src="/cloud.svg"
          alt=""
          aria-hidden="true"
          className="w-full"
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="fixed right-20 bottom-[15%] z-0 w-[21vw] max-w-[300px]"
        initial={reduce ? false : { opacity: 0, x: 160, y: -160 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src="/meteor.svg"
          alt=""
          aria-hidden="true"
          className="w-full"
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* first cat, top-right. appears last, after the rest of the page loads in.
          click it: trail turns on, then it slides off left.
          the wrapper only positions/animates; the click box lives in CatScene. */}
      {showCat && catPhase !== "arrived" && (
        <motion.div
          className="pointer-events-none fixed top-[10%] right-8 z-0 w-[24vw] max-w-[320px] overflow-visible"
          initial={reduce ? false : { opacity: 1, x: "130%", y: 0 }}
          animate={
            catPhase === "leaving"
              ? { opacity: 1, x: "-160vw", y: 0 }
              : { opacity: 1, x: 0, y: 0 }
          }
          transition={
            catPhase === "leaving"
              ? { duration: 0.8, ease: [0.7, 0, 0.84, 0] }
              : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
          }
          onAnimationComplete={() => {
            if (catPhase === "leaving") setCatPhase("arrived");
          }}
        >
          <CatScene
            interactive
            onClick={handleCatClick}
            cursorClass={catReady ? "cursor-pointer" : "cursor-default"}
            ariaLabel="Enable tile trail"
            onFinal={() => setCatReady(true)}
          />
        </motion.div>
      )}

      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <p className="font-pixel mb-8 text-[11px] tracking-[0.35em] text-[#ff3b30]">
          <Typed text="● SYSTEM ONLINE" start={step >= 0} speed={45} onDone={next(0)} />
        </p>

        <h1 className="font-pixel leading-[1.1] text-[#f2e7be]">
          <span className="block text-[clamp(1.1rem,3.5vw,2.1rem)] tracking-[0.15em]">
            <Typed text="HI, I'M" start={step >= 1} speed={70} onDone={next(1)} />
          </span>
          <span className="block text-[clamp(2.75rem,12vw,7.5rem)]">
            <Typed text="SRI VATSA" start={step >= 2} speed={90} onDone={next(2)} cursor />
          </span>
        </h1>

        <motion.div
          variants={rolesContainer}
          initial="hidden"
          animate={step >= 3 ? "show" : "hidden"}
          className="mt-9 space-y-2 text-[11px] tracking-[0.28em] text-[#f2e7be]/55"
        >
          {ROLES.map((role) => (
            <div key={role} className="overflow-hidden py-0.5">
              <motion.p variants={roleLine}>{role}</motion.p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* socials, bottom-left corner; slide up after the intro finishes */}
      <Socials theme="dark" show={step >= 3} />

      <div className="fixed bottom-6 right-6 z-20 overflow-hidden">
        <motion.p
          initial={{ y: "120%" }}
          animate={step >= 3 ? { y: 0 } : { y: "120%" }}
          transition={{ duration: 1, delay: 2.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-pixel text-[10px] tracking-[0.2em] text-[#f2e7be]/40"
        >
          Version 1
        </motion.p>
      </div>
    </main>

    {/* second cat, bottom-center, mirrored. rendered OUTSIDE <main> so its z-50
        beats the tile-trail stage (z-40); otherwise main's z-10 stacking context
        would trap it underneath and swallow the click. */}
    {catPhase === "arrived" && (
      <motion.div
        className="pointer-events-none fixed bottom-[3%] left-1/2 z-50 w-[26vw] max-w-[340px] overflow-visible"
        initial={reduce ? false : { opacity: 0, y: 60, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <CatScene
          mirrored
          interactive
          onClick={handleSummon}
          ariaLabel="Flip the page"
          typed={false}
          startDelay={300}
          bigText="YAYY!"
          bigClass="text-[#10100f]"
          bigSizeClass="text-[clamp(1.6rem,4vw,2.7rem)]"
          midText="cool right?"
          finalText={older ? "Scroll to go back :3" : "Now click me againn!"}
          finalClass="font-pixel leading-tight text-[clamp(0.55rem,1.4vw,0.85rem)]"
        />
      </motion.div>
    )}
    </>
  );
}
