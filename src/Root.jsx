/**
 * Top-level switch: full animated scroll experience (App) on desktop, plain
 * static portfolio (MobileApp) on phones. deciding here, above both, means the
 * desktop scroll rig's hooks never run on mobile at all.
 */
import { useEffect, useState } from "react";
import App from "./App.jsx";
import MobileApp from "./MobileApp.jsx";

// narrow viewport OR touch-primary device (phones, tablets, landscape phones).
// the scroll-scrubbing rig fights momentum scrolling on anything touch.
const QUERY = "(max-width: 768px), (pointer: coarse)";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

export default function Root() {
  return useIsMobile() ? <MobileApp /> : <App />;
}
