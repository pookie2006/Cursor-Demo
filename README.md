# Cursor Demo — the agent control plane, as a tour

An interactive, animated product tour of [Cursor](https://cursor.com), built as a single-page React app. It opens on the Cursor logo, zooms into a simulated IDE, and walks through Cursor's features with glowing hotspots and in-IDE simulations. The narrative project is **Lion Events** — an event planning site for Columbia clubs (Lerner, Mudd, ACM@CU, DevFest, NetID RSVPs).

## Live deployment

**https://pookie2006.github.io/Cursor-Demo/**

Pushes to `main` redeploy automatically via GitHub Pages (`.github/workflows/deploy.yml`).

## Features covered in the tour

Agent, Modes, Models & Auto, @ Context, Context Ring, Tab, Inline Edit (⌘K), Rules & AGENTS.md, Skills, Hooks, MCP, Subagents & Multitask, Worktrees & best-of-n, Checkpoints & Queue, Cloud Agents, Automations + Memories, CLI, SDK, Browser, Files Changed, Bugbot & /review, Run Modes & Sandbox — ordered as a 4-act storyboard (Local loop → Context & policy → Parallel & external → Ship & harden).

## How it works

1. The demo opens on the Cursor logo — click anywhere to zoom in
2. A simulated Cursor IDE appears with pulsing hotspots
3. Click any hotspot (or start the guided tour) to learn about that feature
4. Press `Esc` to zoom back out to the overview

Tour progress is persisted across reloads.

### Paths: crash course, tracks, explore all

The chips at the top of the overview pick the path the guided tour walks:

- **Crash course · 8** (default) — essentials for a short walkthrough
- **Core loop / Agent systems / Ship & harden** — presenter tracks
- **Explore all · 22** — the full storyboard

Every stop's **Try** line is one-click copyable ("Copy · paste into Cursor"), and students can mark prompts they actually ran — three marks unlock stretch challenges on the completion card. The completion card also hands off a real starter repo (`starter/lion-events`) via a copyable clone command.

On screens narrower than ~900px the demo falls back to a grouped stop list instead of the scaled IDE.

### Keyboard

- `Esc` — zoom out / exit tour
- `G` — start guided tour / return to overview
- `←` / `→` — previous / next stop
- `1–9`, `0` — jump to stops 1–10 of the current path
- `A–F`, `H–M` — jump to stops 11–22 (`G` is reserved for the tour key)
- `?` — presenter shortcut overlay

### Deep links

- `#/skills` or `?at=skills` — zoom directly to a stop by id
- `?ide` — skip the intro and start at the IDE overview

## Getting started

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

### Other scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint with oxlint                     |

## Tech stack

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vite.dev) for dev server and builds
- [Framer Motion](https://motion.dev) for the zoom, pulse, and tour animations
- [oxlint](https://oxc.rs) for linting

## Project structure

```
src/
  App.tsx              App shell: intro → zoom → IDE stages, deep links
  tour.ts              Tour stop definitions (all display copy lives here)
  features.ts          Ids of the in-IDE feature simulations
  demoContent.ts       Simulated editor/chat content
  useSimProgress.ts    Drives the in-IDE simulation playback
  components/
    LogoIntro.tsx      Opening logo screen
    IdeWorld.tsx       Zoomable IDE world and tour navigation
    IdeLayout.tsx      The simulated Cursor IDE layout
    TourList.tsx       Narrow-viewport stop list fallback
    Hotspot.tsx        Pulsing tour dots
    ...
starter/lion-events/   Take-home starter matching the demo narrative
```

## License

[MIT](LICENSE)
