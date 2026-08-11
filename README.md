# Cursor Demo

An interactive, animated product tour of [Cursor](https://cursor.com), built as a single-page React app. It opens on the Cursor logo, zooms into a simulated IDE, and walks through Cursor's features with glowing hotspots and in-IDE simulations.

## Features covered in the tour

Agent, Modes, Models & Auto, @ Context, Context Ring, Tab, Inline Edit (⌘K), Rules & AGENTS.md, Skills, Hooks, MCP, Subagents & Multitask, Worktrees & best-of-n, Checkpoints & Queue, Cloud Agents, Automations + Memories, CLI, SDK, Browser, Files Changed, Bugbot & /review, Run Modes & Sandbox, and more.

## How it works

1. The demo opens on the Cursor logo
2. Click anywhere — the logo zooms into white
3. A simulated Cursor IDE layout appears with pulsing hotspots
4. Click any hotspot (or use the guided tour) to learn about that feature
5. Press `Esc` to zoom back out to the overview

Tour progress is persisted across reloads.

### Deep links

You can jump straight to a tour stop:

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
    Hotspot.tsx        Pulsing tour dots
    ...
```

## License

[MIT](LICENSE)
