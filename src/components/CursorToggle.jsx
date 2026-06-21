/**
 * Control pill rendered INSIDE a flip face so it travels with that page's
 * flip/scale/slide animations. One pill, two separate buttons: the cursor
 * (tile-trail) on/off toggle and a "NAV" button that opens the navigation bar.
 * Sits at z-50 with its own pointer events so it stays clickable above the
 * trail stage (z-40).
 *
 * `theme="dark"` styles it for the dark front/deep pages; `theme="light"` for
 * the cream about page.
 */
export default function CursorToggle({ on, onToggle, onNav, theme = "dark", className = "" }) {
  const dark = theme === "dark";
  const pillBorder = dark ? "border-[#f2e7be]/50" : "border-[#10100f]";
  const text = dark ? "text-[#f2e7be]" : "text-[#10100f]";
  const hover = dark
    ? "hover:bg-[#f2e7be] hover:text-[#10100f]"
    : "hover:bg-[#10100f] hover:text-[#fbf4dd]";
  const divider = dark ? "bg-[#f2e7be]/40" : "bg-[#10100f]/40";
  const dot = on ? "bg-[#34c759]" : dark ? "bg-[#f2e7be]/30" : "bg-[#10100f]/30";

  return (
    <div
      className={`pointer-events-auto absolute z-50 flex items-stretch overflow-hidden rounded-md border-2 font-pixel text-[10px] tracking-[0.2em] ${pillBorder} ${text} ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        title="Toggle the cursor tile-trail"
        className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${hover}`}
      >
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        CURSOR {on ? "ON" : "OFF"}
      </button>

      <span className={`w-[2px] shrink-0 ${divider}`} />

      <button
        type="button"
        onClick={onNav}
        title="Open the navigation bar"
        className={`flex items-center px-3 py-1.5 transition-colors ${hover}`}
      >
        NAV
      </button>
    </div>
  );
}
