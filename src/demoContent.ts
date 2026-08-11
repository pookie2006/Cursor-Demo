/**
 * Content for the simulated Cursor session: one believable student project —
 * Lion Events, an event planning site for Columbia clubs — carried through
 * the chat transcript, the file-change list, the editor, and every advanced
 * feature vignette in the tour.
 */

export type TokenKind = 'kw' | 'fn' | 'str' | 'type' | 'punc' | 'prop'

export interface CodeToken {
  text: string
  kind?: TokenKind
}

export interface CodeLine {
  n: number
  tokens: CodeToken[]
  /** Rendered as a pending Tab suggestion until accepted. */
  ghost?: boolean
}

export interface ChangedFile {
  name: string
  add: number
  del: number
}

export const projectName = 'lion-events'

export const userPrompt =
  'Build Lion Events for Columbia clubs: event list, NetID/email RSVP, and a month view of Lerner & Mudd rooms.'

export const agentReply =
  'I’ll scaffold an events page, an RsvpForm component, and a POST /api/rsvp route that sends confirmation emails. Checking your routing setup first.'

export const changedFiles: ChangedFile[] = [
  { name: 'src/components/RsvpForm.tsx', add: 54, del: 0 },
  { name: 'src/app/api/rsvp/route.ts', add: 38, del: 0 },
  { name: 'src/components/EventCard.tsx', add: 26, del: 0 },
  { name: 'src/app/events/page.tsx', add: 19, del: 4 },
  { name: 'src/lib/email.ts', add: 22, del: 0 },
]

export const followUpPrompt = 'Cap Mudd 233 at 40 — waitlist overflow for the ACM@CU kickoff'

export const editorFile = 'RsvpForm.tsx'

export const codeLines: CodeLine[] = [
  {
    n: 1,
    tokens: [
      { text: 'export function ', kind: 'kw' },
      { text: 'RsvpForm', kind: 'fn' },
      { text: '({ eventId }: ' },
      { text: 'RsvpProps', kind: 'type' },
      { text: ') {' },
    ],
  },
  {
    n: 2,
    tokens: [
      { text: '  const', kind: 'kw' },
      { text: ' [email, setEmail] = ' },
      { text: 'useState', kind: 'fn' },
      { text: '(' },
      { text: "''", kind: 'str' },
      { text: ')' },
    ],
  },
  {
    n: 3,
    tokens: [
      { text: '  const', kind: 'kw' },
      { text: ' [status, setStatus] = ' },
      { text: 'useState', kind: 'fn' },
      { text: '<' },
      { text: 'Status', kind: 'type' },
      { text: '>(' },
      { text: "'idle'", kind: 'str' },
      { text: ')' },
    ],
  },
  { n: 4, tokens: [{ text: '' }] },
  {
    n: 5,
    tokens: [
      { text: '  async function ', kind: 'kw' },
      { text: 'handleSubmit', kind: 'fn' },
      { text: '(e: ' },
      { text: 'FormEvent', kind: 'type' },
      { text: ') {' },
    ],
  },
  {
    n: 6,
    tokens: [
      { text: '    e.' },
      { text: 'preventDefault', kind: 'fn' },
      { text: '()' },
    ],
  },
  {
    n: 7,
    tokens: [
      { text: '    ' },
      { text: 'setStatus', kind: 'fn' },
      { text: '(' },
      { text: "'loading'", kind: 'str' },
      { text: ')' },
    ],
  },
  {
    n: 8,
    ghost: true,
    tokens: [
      { text: '    await ', kind: 'kw' },
      { text: 'fetch', kind: 'fn' },
      { text: '(' },
      { text: "'/api/rsvp'", kind: 'str' },
      { text: ', { method: ' },
      { text: "'POST'", kind: 'str' },
      { text: ', body: eventId })' },
    ],
  },
  { n: 9, tokens: [{ text: '  }' }] },
  { n: 10, tokens: [{ text: '}' }] },
]

export const inlineEditPrompt = 'Validate the Columbia email domain with an inline error'

/** The line Inline Edit inserts once its prompt is submitted. */
export const inlineEditResult: CodeToken[] = [
  { text: '    if', kind: 'kw' },
  { text: ' (!email.' },
  { text: 'endsWith', kind: 'fn' },
  { text: '(' },
  { text: "'@columbia.edu'", kind: 'str' },
  { text: ')) ' },
  { text: 'return', kind: 'kw' },
  { text: ' ' },
  { text: 'setError', kind: 'fn' },
  { text: '(' },
  { text: "'Use your Columbia email'", kind: 'str' },
  { text: ')' },
]

export const contextMentions = [
  { label: 'RsvpForm.tsx', meta: 'File' },
  { label: 'src/lib/email.ts', meta: 'File' },
  { label: 'Branch', meta: 'Diff with main' },
  { label: 'Docs', meta: 'Resend' },
]

export const modeNames = ['Agent', 'Ask', 'Plan', 'Debug'] as const

export const repos = [
  { name: 'lion-events', active: true },
  { name: 'acm-cu-site', active: false },
  { name: 'algo-study-notes', active: false },
]

export const automationRuns = [
  { name: 'Nightly event digest', when: 'Every day, 08:00' },
  { name: 'Triage failing tests', when: 'On CI failure' },
]

/**
 * Fake browser preview shown when the Browser feature runs. Second story
 * flavor: the room is full, so Agent verifies the RSVP → waitlist path
 * instead of the happy path.
 */
export const preview = {
  url: 'localhost:3000/events/devfest-kickoff',
  heading: 'ACM@CU DevFest Kickoff',
  sub: 'Fri 5:00 PM · Mudd 233 · 40 of 40 spots taken',
  emailPlaceholder: 'uni@columbia.edu',
  button: 'RSVP',
  toast: 'Room full — you’re #3 on the waitlist',
}

export function lineText(tokens: CodeToken[]): string {
  return tokens.map((token) => token.text).join('')
}

/** Slices a token list to the first `count` characters, preserving highlighting. */
export function sliceTokens(tokens: CodeToken[], count: number): CodeToken[] {
  const out: CodeToken[] = []
  let remaining = count

  for (const token of tokens) {
    if (remaining <= 0) break
    if (token.text.length <= remaining) {
      out.push(token)
      remaining -= token.text.length
    } else {
      out.push({ ...token, text: token.text.slice(0, remaining) })
      remaining = 0
    }
  }

  return out
}
