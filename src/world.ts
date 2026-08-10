/**
 * The Agent OS world map: a Prezi-style canvas where the mock IDE is the home
 * continent and advanced Cursor capabilities are continents around it. Every
 * vignette continues the same CampusEvents student project.
 */

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type ContinentId = 'editor' | 'core' | 'extend' | 'scale' | 'ship'

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

export interface WorldNode {
  id: string
  continent: ContinentId | null
  rect: Rect
  title: string
  kicker: string
  headline: string
  points: string[]
  failureMode?: string
  tryIt?: string
  gem?: string
  cite: { label: string; url: string }[]
  vignette: VignetteSpec
}

export interface Continent {
  id: ContinentId
  name: string
  sub: string
  zone: Rect
}

export const WORLD = { w: 5600, h: 3600 }

export const HOME_RECT: Rect = { x: 2080, y: 1350, w: 1440, h: 900 }

export const continents: Continent[] = [
  { id: 'editor', name: 'Editor I/O', sub: 'Local input & output', zone: { x: 240, y: 300, w: 1520, h: 1060 } },
  { id: 'core', name: 'Agent Core', sub: 'The process scheduler', zone: { x: 3840, y: 300, w: 1520, h: 1060 } },
  { id: 'extend', name: 'Extend', sub: 'Syscalls & ABI', zone: { x: 240, y: 2260, w: 1520, h: 1060 } },
  { id: 'scale', name: 'Scale-Out', sub: 'The cluster', zone: { x: 3840, y: 2020, w: 1520, h: 1520 } },
  { id: 'ship', name: 'Ship & Govern', sub: 'The merge gate & policy', zone: { x: 2080, y: 2620, w: 1440, h: 560 } },
]

const CARD = { w: 640, h: 400, gapX: 80, gapY: 80, top: 110, left: 40 }

function slot(continent: ContinentId, index: number): Rect {
  const zone = continents.find((c) => c.id === continent)!.zone
  const col = index % 2
  const row = Math.floor(index / 2)
  return {
    x: zone.x + CARD.left + col * (CARD.w + CARD.gapX),
    y: zone.y + CARD.top + row * (CARD.h + CARD.gapY),
    w: CARD.w,
    h: CARD.h,
  }
}

export const nodes: WorldNode[] = [
  // ——— Agent Core (NE) ———
  {
    id: 'agent-loop',
    continent: 'core',
    rect: slot('core', 0),
    title: 'The Agent Harness',
    kicker: 'Instructions + tools + model — not “chat that writes code”',
    headline: 'One loop: gather context, act with tools, verify, repeat',
    points: [
      'Tools: read, search, edit, shell, browser — each call is observable',
      'Checkpoints snapshot state independently of git',
      'Queued messages wait; ⌘Enter jumps the queue',
    ],
    failureMode: 'Long sessions hit context compaction — old turns get summarized',
    tryIt: 'Watch the tool calls unfold on a real task, then restore a checkpoint',
    cite: [{ label: 'Agent overview', url: 'https://cursor.com/docs/agent/overview' }],
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'Add a month calendar view for club events' },
        { kind: 'tool', name: 'Search', detail: "grep 'events' → 12 files", status: 'ok' },
        { kind: 'tool', name: 'Edit', detail: 'src/app/events/calendar.tsx (+84)', status: 'ok' },
        { kind: 'tool', name: 'Shell', detail: 'npm test — 14 passed', status: 'ok' },
        { kind: 'agent', text: 'Calendar added. Checkpoint saved — roll back anytime, no git needed.' },
        { kind: 'banner', text: 'Harness = instructions + tools + model', tone: 'ok' },
      ],
    },
  },
  {
    id: 'modes',
    continent: 'core',
    rect: slot('core', 1),
    title: 'Modes',
    kicker: 'A mode is a tool policy',
    headline: 'Same prompt, four different permission sets',
    points: [
      'Ask = read-only · Plan = design before build',
      'Debug = hypothesize → instrument → reproduce → fix',
      'Agent = the full loop · ⇧Tab cycles, ⌘. opens the menu',
    ],
    failureMode: 'Running Agent when you wanted Ask: edits you didn’t ask for',
    tryIt: '⇧Tab → Plan a multi-file feature; don’t build yet',
    cite: [{ label: 'Plan & Debug modes', url: 'https://cursor.com/docs/agent/modes' }],
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'The RSVP button double-submits on slow wifi' },
        { kind: 'tool', name: 'Ask', detail: 'read-only — explains the race condition', status: 'ok' },
        { kind: 'tool', name: 'Plan', detail: 'writes the fix plan, touches nothing', status: 'ok' },
        { kind: 'tool', name: 'Debug', detail: 'adds logging, reproduces, verifies', status: 'ok' },
        { kind: 'tool', name: 'Agent', detail: 'applies fix + regression test', status: 'ok' },
        { kind: 'banner', text: 'Mode = policy over tools and process', tone: 'ok' },
      ],
    },
  },
  {
    id: 'models',
    continent: 'core',
    rect: slot('core', 2),
    title: 'Models & Auto',
    kicker: 'Pick intelligence, speed, and spend deliberately',
    headline: 'Cursor Models vs named frontier models, tuned per task',
    points: [
      'Auto modes: Cost, Balance, Intelligence',
      'Thinking models for hard rewrites; fast models to explore',
      'Switch mid-task once exploration is done',
    ],
    failureMode: 'Teaching Max Mode as universal — it’s legacy-plan-specific',
    tryIt: 'Cycle models mid-task after the exploration phase',
    cite: [{ label: 'Models & pricing', url: 'https://cursor.com/docs/models' }],
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: 'task: explore the calendar library options' },
        { kind: 'out', text: 'Auto (Balance) → fast model, low spend', tone: 'dim' },
        { kind: 'cmd', text: 'task: rewrite RSVP concurrency handling' },
        { kind: 'out', text: 'Auto (Intelligence) → thinking model, deep context', tone: 'dim' },
        { kind: 'banner', text: 'Max Mode: legacy plans only', tone: 'warn' },
      ],
    },
  },
  {
    id: 'context',
    continent: 'core',
    rect: slot('core', 3),
    title: 'Context Ring',
    kicker: 'Context is RAM — manage it like memory',
    headline: 'Everything you attach competes for the same window',
    points: [
      '@Files, @Folders, @Branch, @Docs, @Browser, @Terminals',
      'The ring shows what rules, skills, and MCP tools cost',
      'When unsure, let Agent search instead of pasting',
    ],
    failureMode: 'Stuffing the window: compaction silently summarizes old turns',
    tryIt: '@Branch, then ask for a review of the diff',
    cite: [{ label: 'Prompting & @ mentions', url: 'https://cursor.com/docs/agent/prompting' }],
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
  },

  // ——— Editor I/O (NW) ———
  {
    id: 'tab-advanced',
    continent: 'editor',
    rect: slot('editor', 0),
    title: 'Tab',
    kicker: 'Predicts the next edit, not the next token',
    headline: 'Trained on diffs — it follows your refactor across lines',
    points: [
      'Multi-line jumps, aware of your recent changes',
      'Hooks can fire on Tab accepts too',
      'Rules do not apply to Tab',
    ],
    tryIt: 'Zoom into the IDE and run the Tab hotspot live',
    cite: [{ label: 'Tab', url: 'https://cursor.com/docs/tab' }],
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: 'RsvpForm.tsx' },
        { kind: 'code', text: "const [error, setError] = useState('')" },
        { kind: 'out', text: "ghost: setError('') cleared on retry — predicted from your last diff", tone: 'dim' },
        { kind: 'banner', text: 'Accept with Tab · dismiss with Esc', tone: 'ok' },
      ],
    },
  },
  {
    id: 'inline-advanced',
    continent: 'editor',
    rect: slot('editor', 1),
    title: 'Inline Edit ⌘K',
    kicker: 'Surgical, local, diff-previewed',
    headline: 'Select code, describe the change, review the diff in place',
    points: [
      'Best for single-block rewrites; Agent for multi-file',
      'User Rules do not apply to ⌘K — keep prompts self-contained',
    ],
    tryIt: 'Zoom home and run the Inline Edit hotspot',
    cite: [{ label: 'Inline Edit', url: 'https://cursor.com/docs/inline-edit' }],
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: 'EventCard.tsx' },
        { kind: 'cmd', text: '⌘K: memoize the date formatting' },
        { kind: 'tool', name: 'Diff', detail: 'useMemo(() => formatDate(event.start), …)', status: 'ok' },
        { kind: 'banner', text: 'Preview, then apply', tone: 'ok' },
      ],
    },
  },
  {
    id: 'checkpoints',
    continent: 'editor',
    rect: slot('editor', 2),
    title: 'Checkpoints & Queue',
    kicker: 'Rollback without touching git',
    headline: 'Every agent step is restorable; messages queue while it works',
    points: [
      'Restore to before a bad refactor in one click',
      'Queue follow-ups; ⌘Enter interrupts and jumps the queue',
    ],
    gem: 'Power-user gem',
    tryIt: 'Queue two follow-ups during a long Agent run',
    cite: [{ label: 'Agent overview', url: 'https://cursor.com/docs/agent/overview' }],
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
  },

  // ——— Extend (SW) ———
  {
    id: 'rules',
    continent: 'extend',
    rect: slot('extend', 0),
    title: 'Rules & AGENTS.md',
    kicker: 'Persistent, scoped system guidance',
    headline: 'Teach conventions once; scope them precisely',
    points: [
      '.cursor/rules/*.mdc: always · glob · intelligent · @manual',
      'Nested AGENTS.md for monorepos; team rules take precedence',
    ],
    failureMode: 'Rules don’t apply to Tab; User Rules skip ⌘K',
    tryIt: '/create-rule for your team’s RSVP-form conventions',
    cite: [{ label: 'Rules', url: 'https://cursor.com/docs/rules' }],
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: '.cursor/rules/frontend.mdc' },
        { kind: 'code', text: 'globs: src/components/**' },
        { kind: 'code', text: 'RSVP forms must use useRsvp(); Tailwind only, no inline styles.' },
        { kind: 'banner', text: 'Loaded whenever a matching file is touched', tone: 'ok' },
      ],
    },
  },
  {
    id: 'skills',
    continent: 'extend',
    rect: slot('extend', 1),
    title: 'Skills',
    kicker: 'Procedures loaded on demand — progressive disclosure',
    headline: 'Only name + description live in context until invoked',
    points: [
      'SKILL.md plus scripts and references per skill',
      'disable-model-invocation → true slash commands',
      '/migrate-to-skills converts always-on rules',
    ],
    failureMode: 'Putting procedures in always-on rules burns your ring',
    tryIt: '/create-skill deploy-preview for campus-events',
    gem: 'Power-user gem',
    cite: [{ label: 'Skills', url: 'https://cursor.com/docs/agent/skills' }],
    vignette: {
      type: 'script',
      frame: 'file',
      steps: [
        { kind: 'file', name: '.cursor/skills/deploy-preview/SKILL.md' },
        { kind: 'code', text: 'name: deploy-preview' },
        { kind: 'code', text: 'description: Build & deploy a PR preview of campus-events' },
        { kind: 'banner', text: 'Only these two lines always loaded', tone: 'ok' },
        { kind: 'cmd', text: '/deploy-preview' },
        { kind: 'out', text: 'full body + scripts stream in on demand', tone: 'dim' },
      ],
    },
  },
  {
    id: 'hooks',
    continent: 'extend',
    rect: slot('extend', 2),
    title: 'Hooks',
    kicker: 'Intercept the agent loop with policy',
    headline: 'Observe, block, or modify every step',
    points: [
      'beforeShellExecution, afterFileEdit, MCP, subagent, stop',
      'Hooks fire on Tab and workspaceOpen too',
      'Cloud agents read hooks from the repo, not ~/.cursor',
    ],
    failureMode: 'Assuming local hooks.json follows you to cloud runs',
    tryIt: '/create-hook → prettier on afterFileEdit',
    cite: [{ label: 'Hooks', url: 'https://cursor.com/docs/agent/hooks' }],
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
  },
  {
    id: 'mcp',
    continent: 'extend',
    rect: slot('extend', 3),
    title: 'MCP',
    kicker: 'The external tool ABI for agents',
    headline: 'Tools beyond the filesystem, with an approval path',
    points: [
      'stdio · SSE · HTTP transports; project or user mcp.json',
      'Tools, prompts, resources — and MCP Apps with real UI',
      'Enterprise allowlists gate what students can wire up',
    ],
    failureMode: 'Prompt injection through tool results — treat outputs as untrusted',
    tryIt: 'Add a marketplace MCP, then read MCP Logs (⌘⇧U)',
    cite: [{ label: 'MCP', url: 'https://cursor.com/docs/mcp' }],
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: 'File the duplicate-RSVP bug in Linear' },
        { kind: 'tool', name: 'linear.create_issue', detail: 'awaiting approval…', status: 'run' },
        { kind: 'banner', text: 'Approval gate — Run Modes decide', tone: 'warn' },
        { kind: 'tool', name: 'linear.create_issue', detail: 'CS-142 “Duplicate RSVPs on double-click”', status: 'ok' },
      ],
    },
  },

  // ——— Scale-Out (SE) ———
  {
    id: 'subagents',
    continent: 'scale',
    rect: slot('scale', 0),
    title: 'Subagents & Multitask',
    kicker: 'Context isolation is a systems optimization',
    headline: 'Children flood their own windows; the parent stays small',
    points: [
      'Built-ins: Explore, Bash, Browser — plus .cursor/agents',
      '/multitask and Build in Parallel fan work out',
      'Explore can run a different model than the parent',
    ],
    failureMode: 'Serial exploration in the parent — the expensive window fills up',
    tryIt: '/create-subagent, then /multitask two independent tasks',
    cite: [{ label: 'Subagents', url: 'https://cursor.com/docs/agent/subagents' }],
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
  },
  {
    id: 'worktrees',
    continent: 'scale',
    rect: slot('scale', 1),
    title: 'Worktrees & best-of-n',
    kicker: 'Git worktrees as agent sandboxes',
    headline: 'Race models on isolated checkouts; keep the winner',
    points: [
      '/worktree · /apply-worktree · /delete-worktree',
      'worktrees.json bootstraps dependencies per checkout',
    ],
    failureMode: 'Two agents editing one checkout — races and clobbered diffs',
    tryIt: '/best-of-n composer,sonnet,gpt on the flaky RSVP test',
    gem: 'Power-user gem',
    cite: [{ label: 'Worktrees', url: 'https://cursor.com/docs/agent/worktrees' }],
    vignette: {
      type: 'race',
      task: '/best-of-n composer,sonnet,gpt — fix flaky rsvp.test.ts',
      contenders: [
        { model: 'composer-2.5', note: '20/20 passes' },
        { model: 'sonnet', note: '18/20 passes' },
        { model: 'gpt', note: '19/20 passes' },
      ],
      winner: 0,
    },
  },
  {
    id: 'cloud',
    continent: 'scale',
    rect: slot('scale', 2),
    title: 'Cloud Agents',
    kicker: 'Dedicated VMs — keep working while you sleep',
    headline: 'Distributed execution with real environments',
    points: [
      'environment.json + builds define the VM',
      'Computer use: a real browser, with video artifacts',
      'Trigger from Slack, @cursor on GitHub, web, iOS',
    ],
    failureMode: 'Secrets and hooks come from the repo/env — not your laptop',
    tryIt: 'Send one task to the cloud with & and close the lid',
    cite: [{ label: 'Cloud Agents', url: 'https://cursor.com/docs/cloud-agents' }],
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: '& build the month calendar view overnight' },
        { kind: 'out', text: 'Cloud Agent: VM up, campus-events cloned', tone: 'dim' },
        { kind: 'tool', name: 'Computer use', detail: 'verifies the UI in a real browser', status: 'ok' },
        { kind: 'out', text: 'PR #47 opened with a video artifact — laptop was closed', tone: 'ok' },
      ],
    },
  },
  {
    id: 'automations',
    continent: 'scale',
    rect: slot('scale', 3),
    title: 'Automations + Memories',
    kicker: 'Event-driven agents in production',
    headline: 'Cron, CI, Slack, Sentry — agents that trigger themselves',
    points: [
      'MEMORIES.md carries state across runs',
      'Team-owned identity; PR/Slack/MCP tools available',
    ],
    failureMode: 'Memories persist: untrusted Slack input can poison future runs',
    tryIt: '/automate “daily digest of main” for the club repo',
    cite: [{ label: 'Automations', url: 'https://cursor.com/docs/automations' }],
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'out', text: 'trigger: CI failed on main (02:14)', tone: 'dim' },
        { kind: 'tool', name: 'Automation', detail: 'triage-failing-tests runs', status: 'ok' },
        { kind: 'out', text: 'Fix PR opened + Slack summary posted', tone: 'ok' },
        { kind: 'tool', name: 'MEMORIES.md', detail: 'remembers which suites are flaky', status: 'ok' },
        { kind: 'banner', text: 'Cross-run state ≠ prompt policy', tone: 'warn' },
      ],
    },
  },
  {
    id: 'cli',
    continent: 'scale',
    rect: slot('scale', 4),
    title: 'CLI',
    kicker: 'Same harness, TTY-native',
    headline: 'Interactive sessions, print mode for CI, cloud handoff',
    points: [
      'agent -p for scripts and CI pipelines',
      '& hands the session to a Cloud Agent',
      'Sessions resume; sandbox applies here too',
    ],
    tryIt: 'curl https://cursor.com/install | bash, then agent',
    cite: [{ label: 'CLI', url: 'https://cursor.com/docs/cli' }],
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
  },
  {
    id: 'sdk',
    continent: 'scale',
    rect: slot('scale', 5),
    title: 'SDK',
    kicker: 'Embed the harness in your own software',
    headline: 'Agents as programmable infrastructure',
    points: [
      '@cursor/sdk: local or cloud runtime',
      'Skills, hooks, MCP, subagents carry over',
      'CI bots, kanban workers, product embeds',
    ],
    tryIt: 'npm install @cursor/sdk — 15 lines to a PR',
    cite: [{ label: 'SDK', url: 'https://cursor.com/docs/sdk' }],
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
  },

  // ——— Ship & Govern (South) ———
  {
    id: 'bugbot',
    continent: 'ship',
    rect: slot('ship', 0),
    title: 'Bugbot & /review',
    kicker: 'Agents in the merge gate',
    headline: 'Automated review before humans spend time',
    points: [
      '/review, /review-bugbot, /review-security on local diffs',
      'PR comments with one-click Fix in Cursor',
    ],
    failureMode: 'Treating a green agent review as proof — it’s a filter, not a verdict',
    tryIt: '/review before you push the demo-night changes',
    cite: [{ label: 'Bugbot', url: 'https://cursor.com/bugbot' }],
    vignette: {
      type: 'script',
      frame: 'chat',
      steps: [
        { kind: 'user', text: '/review before I push demo-night changes' },
        { kind: 'tool', name: 'Bugbot', detail: 'timezone bug: UTC date shown in local calendar', status: 'ok' },
        { kind: 'tool', name: 'Security review', detail: '/api/rsvp missing rate limit', status: 'ok' },
        { kind: 'banner', text: 'Fix in Cursor → one click from the PR', tone: 'ok' },
      ],
    },
  },
  {
    id: 'runmodes',
    continent: 'ship',
    rect: slot('ship', 1),
    title: 'Run Modes & Sandbox',
    kicker: 'Autonomy with a threat model',
    headline: 'Auto-review, allowlists, or run-everything — your call',
    points: [
      'Sandbox: Seatbelt (macOS) / Landlock (Linux)',
      '.cursorignore hides files — terminal and MCP can still leak',
      '.cursorindexingignore only affects search, not access',
    ],
    failureMode: 'Trusting ignore files as a security boundary',
    tryIt: 'Add a global ignore for **/.env*',
    cite: [{ label: 'Run modes & ignore files', url: 'https://cursor.com/docs/agent/security' }],
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
  },

  // ——— Challenges (north of home) ———
  {
    id: 'challenges',
    continent: null,
    rect: { x: 2480, y: 420, w: 640, h: 460 },
    title: 'Student Challenges',
    kicker: 'Take CampusEvents further on your own',
    headline: 'Six stretch problems for advanced students',
    points: [
      'Design a context budget: rules vs skills vs MCP',
      'Write a hook that blocks network shell unless allowlisted',
      'Custom subagent + skill — justify when to use each',
      '/best-of-n on a hard bug, with a winner rubric',
      'An Automation with Memories that is injection-safe',
      '20-line SDK script that opens a PR on a cloud run',
    ],
    tryIt: 'Pick one, bring your repo — workshops at cursor.com/workshops',
    cite: [{ label: 'Workshops', url: 'https://cursor.com/workshops' }],
    vignette: {
      type: 'script',
      frame: 'terminal',
      steps: [
        { kind: 'cmd', text: '/best-of-n composer,sonnet,gpt fix-the-hard-bug' },
        { kind: 'out', text: '…your turn.', tone: 'dim' },
      ],
    },
  },
]

export const nodeById = new Map(nodes.map((n) => [n.id, n]))

export const continentById = new Map(continents.map((c) => [c.id, c]))

export type WorldFocus =
  | { kind: 'world' }
  | { kind: 'continent'; id: ContinentId }
  | { kind: 'node'; id: string }

/** Parses instructor deep links like #/extend/skills, #/home, #/scale. */
export function parseWorldHash(hash: string): WorldFocus | null {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts.length === 0) return null

  const [first, second] = parts
  if (first === 'map') return { kind: 'world' }
  if (first === 'home') return { kind: 'node', id: 'home' }

  if (continentById.has(first as ContinentId)) {
    if (second && nodeById.has(second)) return { kind: 'node', id: second }
    return { kind: 'continent', id: first as ContinentId }
  }

  if (nodeById.has(first)) return { kind: 'node', id: first }
  return null
}

/** Guided tour: home → core → extend → scale → ship → challenges. */
export const tourOrder: string[] = [
  'home',
  'agent-loop',
  'modes',
  'models',
  'context',
  'rules',
  'skills',
  'hooks',
  'mcp',
  'subagents',
  'worktrees',
  'cloud',
  'automations',
  'bugbot',
  'runmodes',
  'cli',
  'sdk',
  'challenges',
]
