/**
 * Bottom-left social row, shared across every page. GitHub + LinkedIn open in a
 * new tab; the mail icon pops a small box showing the email (click it to copy).
 * `theme="dark"` for the near-black pages, `theme="light"` for the cream ones.
 * `show` gates the slide-up entrance (the landing waits for its intro to finish).
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GithubLogo, LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react";

export const LINKS = [
  { Icon: GithubLogo, href: "https://github.com/33k0/", label: "GitHub" },
  { Icon: LinkedinLogo, href: "https://www.linkedin.com/in/sri-vatsa-vuddanti-a81b68336/", label: "LinkedIn" },
];
export const EMAIL = "srivatsa644@gmail.com";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = {
  hidden: { y: "120%", opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function Socials({ theme = "dark", show = true, className = "" }) {
  const dark = theme === "dark";
  const icon = dark ? "text-[#f2e7be]/60 hover:text-[#ff6a2c]" : "text-[#10100f]/55 hover:text-[#ff3b30]";
  const box = dark
    ? "border-[#f2e7be]/40 bg-[#161510] text-[#f2e7be]"
    : "border-[#10100f] bg-[#fbf4dd] text-[#10100f]";

  const [mailOpen, setMailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked, the email is still visible to copy manually */
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      className={`pointer-events-auto absolute bottom-6 left-6 z-50 flex items-center gap-4 ${className}`}
    >
      {LINKS.map(({ Icon, href, label }) => (
        <div key={label} className="overflow-hidden">
          <motion.a
            variants={item}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className={`block transition-colors ${icon}`}
          >
            <Icon size={22} weight="fill" />
          </motion.a>
        </div>
      ))}

      {/* mail: reveals a small box with the email (click to copy) */}
      <div className="relative">
        <div className="overflow-hidden">
          <motion.button
            variants={item}
            type="button"
            aria-label="Email"
            onClick={() => setMailOpen((v) => !v)}
            className={`block transition-colors ${icon}`}
          >
            <EnvelopeSimple size={22} weight="fill" />
          </motion.button>
        </div>

        <AnimatePresence>
          {mailOpen && (
            <motion.button
              type="button"
              onClick={copyEmail}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              title="Click to copy"
              className={`absolute bottom-full left-0 mb-3 whitespace-nowrap rounded-md border-2 px-3 py-2 font-mono text-[12px] tracking-wide shadow-[4px_4px_0_0_rgba(0,0,0,0.25)] ${box}`}
            >
              {copied ? "copied!" : EMAIL}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
