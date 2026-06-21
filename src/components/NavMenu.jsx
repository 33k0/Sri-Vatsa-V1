/**
 * Navigation overlay: a top-center nav bar (the page links) plus the one-time
 * confirmation modal shown before navigation is enabled. Both are screen-fixed
 * (rendered at the flip-scene level, not inside a transformed page slot).
 *
 * Controlled by App: `navOpen` shows the bar, `confirmOpen` shows the modal.
 * Clicking a link calls `onGo(target)`; the modal answers `onConfirmYes` /
 * `onConfirmNo`.
 */
import { AnimatePresence, motion } from "motion/react";

export default function NavMenu({
  pages,
  current,
  navOpen,
  confirmOpen,
  onGo,
  onConfirmYes,
  onConfirmNo,
}) {
  return (
    <>
      {/* nav bar */}
      <AnimatePresence>
        {navOpen && (
          <motion.nav
            key="navbar"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute left-1/2 top-6 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-[#f2e7be]/40 bg-[#10100f]/90 px-2 py-1.5 backdrop-blur"
          >
            {pages.map((p) => {
              const on = p.target === current;
              return (
                <button
                  key={p.target}
                  type="button"
                  onClick={() => onGo(p.target)}
                  className={`rounded-full px-4 py-1.5 font-pixel text-[10px] tracking-[0.2em] transition-colors ${
                    on
                      ? "bg-[#f2e7be] text-[#10100f]"
                      : "text-[#f2e7be]/70 hover:text-[#f2e7be]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* one-time confirmation modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onConfirmNo}
            className="pointer-events-auto absolute inset-0 z-[80] grid place-items-center bg-black/60 px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] rounded-[12px] border-2 border-[#f2e7be]/30 bg-[#161510] p-7 text-[#f2e7be] shadow-[10px_10px_0_0_#ffffff4d]"
            >
              <p className="font-pixel text-[10px] tracking-[0.25em] text-[#ff3b30]">// HEADS UP</p>
              <h3 className="mt-3 font-pixel text-[clamp(1.1rem,2.4vw,1.5rem)] leading-tight">
                Skip the transitions?
              </h3>
              <p className="mt-4 text-[clamp(0.85rem,1.1vw,0.95rem)] leading-relaxed text-[#f2e7be]/75">
                The navigation bar jumps straight to a section and skips the animated
                transitions between pages. You can still scroll through everything
                normally afterwards.
              </p>
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onConfirmNo}
                  className="rounded-md border-2 border-[#f2e7be]/40 px-4 py-2 font-pixel text-[10px] tracking-[0.2em] text-[#f2e7be] transition-colors hover:bg-[#f2e7be]/10"
                >
                  NOT NOW
                </button>
                <button
                  type="button"
                  onClick={onConfirmYes}
                  className="rounded-md border-2 border-[#ff3b30] bg-[#ff3b30] px-4 py-2 font-pixel text-[10px] tracking-[0.2em] text-[#10100f] transition-colors hover:bg-[#ff5a4d]"
                >
                  YES, CONTINUE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
