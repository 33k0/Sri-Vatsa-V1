# Sri Vatsa — Portfolio (V1)

A single-page portfolio built as one continuous, scroll-driven scene. Instead of static sections, the whole page is a small "machine": scrolling scrubs a sequence of transitions — a 3D page flip, a zoom-out dive through the void, and a split-merge that slices one page apart into the next.

**Live:** _coming soon_

## Highlights

- **One scroll value drives everything.** A single `progress` value (derived from scroll) feeds every transition via Motion's `useTransform` — no parallel scroll listeners. Each scene is scrubbable both directions.
- **Whole-page transitions, not section reveals** — a CSS 3D flip, a camera zoom + world-pan "void dive," and a `cloneNode`-based split-merge that cuts the live page into four pieces and reassembles them into the next one.
- **A cursor tile-trail** drawn imperatively (no React state per frame) so it stays smooth.
- **Reload-aware** — refresh drops you back on the page you were on and re-locks the rest.
- **Mobile = no theatrics.** Touch devices get a clean, static, top-to-bottom portfolio (same content, single source of truth) — the scroll-jacking is desktop-only on purpose.

## Stack

React 18 · Vite · Tailwind CSS v4 · [Motion](https://motion.dev) · Phosphor Icons

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
```

## Structure

- `src/App.jsx` — the desktop scroll engine (progress → all transforms, page unlocking, persistence)
- `src/components/` — each page + the transition pieces (flip, dive overlays, `SplitMerge`, `TileTrail`, nav)
- `src/MobileApp.jsx` — the static mobile portfolio
- `src/Root.jsx` — picks desktop vs. mobile

---

Built by Sri Vatsa.
