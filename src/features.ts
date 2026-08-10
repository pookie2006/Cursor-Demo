export type FeatureId =
  | 'agent'
  | 'context'
  | 'modes'
  | 'diffs'
  | 'tab'
  | 'inline-edit'
  | 'browser'
  | 'automations'

export interface Feature {
  id: FeatureId
  name: string
  shortcut: string
  tagline: string
  description: string
  highlights: string[]
  tip: string
}

export const features: Record<FeatureId, Feature> = {
  agent: {
    id: 'agent',
    name: 'Agent',
    shortcut: '⌘I',
    tagline: 'Describe the outcome. Agent handles the rest.',
    description:
      'Describe a task in plain language. Agent searches your codebase, edits multiple files, runs terminal commands, and iterates until the work is done.',
    highlights: [
      'Builds features, refactors, and fixes bugs end-to-end',
      'Runs shell commands and reads the output',
      'Delegates to subagents for search, shell, and browser',
    ],
    tip: 'Be specific about the outcome — Agent figures out which files to touch.',
  },
  context: {
    id: 'context',
    name: '@ Mentions',
    shortcut: '@',
    tagline: '@ the files that matter',
    description:
      'Type @ to attach files, folders, docs, git state, or web results. Grounds the answer in your project instead of a pasted blob.',
    highlights: [
      '@Files, @Folders, @Docs, and @Web',
      '@Commit and @Branch for git diffs',
      'Works in chat and in inline prompts',
    ],
    tip: 'Prefer @ over long pasted snippets.',
  },
  modes: {
    id: 'modes',
    name: 'Modes',
    shortcut: '⇧Tab',
    tagline: 'Four loops for four kinds of work',
    description:
      'Agent edits. Ask reads. Plan proposes before touching code. Debug fixes with logs and repro steps — not guesses.',
    highlights: [
      'Agent — build and edit',
      'Ask — read-only answers',
      'Plan — approve before coding',
      'Debug — fix with evidence',
    ],
    tip: '⇧Tab cycles modes, ⌘. opens the mode menu.',
  },
  diffs: {
    id: 'diffs',
    name: 'Files Changed',
    shortcut: 'Review',
    tagline: 'Review before you commit',
    description:
      'Every created, edited, or deleted file shows up here. Open a diff, keep what works, revert the rest.',
    highlights: [
      'Lists every created, edited, or deleted file',
      'Open a file to inspect the full diff',
      'Review before you commit or push',
    ],
    tip: 'Skim the change list after big tasks — catch surprises early.',
  },
  tab: {
    id: 'tab',
    name: 'Tab',
    shortcut: 'Tab',
    tagline: 'Suggests the next edit, not the next word',
    description:
      'Cursor’s Tab model suggests the next edit — not just the next token — based on recent changes and surrounding context.',
    highlights: [
      'Low-latency multi-line suggestions',
      'Aware of your recent diffs',
      'Tab to accept, Esc to dismiss',
    ],
    tip: 'Keep coding naturally — Tab learns from the edits you accept.',
  },
  'inline-edit': {
    id: 'inline-edit',
    name: 'Inline Edit',
    shortcut: '⌘K',
    tagline: 'Select code. Describe the change.',
    description:
      'Select a block, press ⌘K, and describe the change. Cursor rewrites in place with a clear diff.',
    highlights: [
      'Ideal for focused, local edits',
      'Diff preview before applying',
      'Works on a selection or at the cursor',
    ],
    tip: 'Use ⌘K for surgical changes, Agent for multi-file work.',
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    shortcut: 'Panel',
    tagline: 'Agent opens the app and checks the UI',
    description:
      'Agent loads your app in a browser panel, clicks through flows, and reads the DOM — so frontend fixes get verified, not assumed.',
    highlights: [
      'Side-by-side preview with Agent chat',
      'Agent can click, type, and inspect pages',
      'Built for frontend verification loops',
    ],
    tip: 'Ask Agent to open the app and check the UI after a change.',
  },
  automations: {
    id: 'automations',
    name: 'Automations',
    shortcut: 'Sidebar',
    tagline: 'Agents that run without you',
    description:
      'Schedule agents or trigger them from events — dependency bumps, test runs, doc syncs. Same Agent, no manual kickoff.',
    highlights: [
      'Schedule recurring agent work',
      'Trigger from events and workflows',
      'Keep maintenance running on its own',
    ],
    tip: 'Use Automations for repetitive checks and upkeep.',
  },
}

/** Tour order: the chat loop first, then the editor tools, then scaling up. */
export const featureOrder: FeatureId[] = [
  'agent',
  'context',
  'modes',
  'diffs',
  'tab',
  'inline-edit',
  'browser',
  'automations',
]

export function isFeatureId(value: string): value is FeatureId {
  return (featureOrder as string[]).includes(value)
}
