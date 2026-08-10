/**
 * Content for the simulated Cursor session: one believable task carried through
 * the chat transcript, the file-change list, and the editor.
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

export const userPrompt =
  'Add a waitlist to the landing page — email field, validation, POST /api/waitlist, and a success toast.'

export const agentReply =
  'I’ll add a WaitlistForm component, an API route with Zod validation, and wire up a toast on success. Checking your existing form patterns first.'

export const changedFiles: ChangedFile[] = [
  { name: 'src/components/WaitlistForm.tsx', add: 47, del: 0 },
  { name: 'src/app/api/waitlist/route.ts', add: 32, del: 0 },
  { name: 'src/lib/validation.ts', add: 18, del: 0 },
  { name: 'src/app/page.tsx', add: 12, del: 3 },
  { name: 'src/components/Hero.tsx', add: 8, del: 2 },
]

export const followUpPrompt = 'Add rate limiting to /api/waitlist — 5 req/min per IP'

export const editorFile = 'WaitlistForm.tsx'

export const codeLines: CodeLine[] = [
  {
    n: 1,
    tokens: [
      { text: 'export function ', kind: 'kw' },
      { text: 'WaitlistForm', kind: 'fn' },
      { text: '() {' },
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
      { text: "'/api/waitlist'", kind: 'str' },
      { text: ', { method: ' },
      { text: "'POST'", kind: 'str' },
      { text: ' })' },
    ],
  },
  { n: 9, tokens: [{ text: '  }' }] },
  { n: 10, tokens: [{ text: '}' }] },
]

export const inlineEditPrompt = 'Add client-side email validation with an inline error'

/** The line Inline Edit inserts once its prompt is submitted. */
export const inlineEditResult: CodeToken[] = [
  { text: '    if', kind: 'kw' },
  { text: ' (!' },
  { text: 'isValidEmail', kind: 'fn' },
  { text: '(email)) ' },
  { text: 'return', kind: 'kw' },
  { text: ' ' },
  { text: 'setError', kind: 'fn' },
  { text: '(' },
  { text: "'Enter a valid email'", kind: 'str' },
  { text: ')' },
]

export const contextMentions = [
  { label: 'WaitlistForm.tsx', meta: 'File' },
  { label: 'src/lib/validation.ts', meta: 'File' },
  { label: 'Branch', meta: 'Diff with main' },
  { label: 'Docs', meta: 'Zod' },
]

export const modeNames = ['Agent', 'Ask', 'Plan', 'Debug'] as const

export const repos = [
  { name: 'acme-landing', active: true },
  { name: 'acme-api', active: false },
  { name: 'design-system', active: false },
]

export const automationRuns = [
  { name: 'Update dependencies', when: 'Every Monday, 9:00' },
  { name: 'Triage failing tests', when: 'On CI failure' },
]

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
