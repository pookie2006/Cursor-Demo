import { motion } from 'framer-motion'
import {
  agentReply,
  automationRuns,
  changedFiles,
  codeLines,
  contextMentions,
  editorFile,
  followUpPrompt,
  inlineEditPrompt,
  inlineEditResult,
  lineText,
  modeNames,
  preview,
  projectName,
  repos,
  sliceTokens,
  userPrompt,
  type CodeToken,
} from '../demoContent'
import { featureOrder, type FeatureId } from '../features'
import { useSimProgress } from '../useSimProgress'
import { Hotspot } from './Hotspot'

type IdeLayoutProps = {
  activeFeature: FeatureId | null
  visited: Set<FeatureId>
  scanning: boolean
  reduceMotion: boolean
  onSelectFeature: (id: FeatureId) => void
  onRestart: () => void
}

const SIM_DURATIONS: Record<FeatureId, number> = {
  agent: 4200,
  context: 3200,
  modes: 3600,
  diffs: 3000,
  tab: 3400,
  'inline-edit': 4200,
  browser: 3200,
  automations: 3000,
}

const FILE_REVEAL_AT = [0.62, 0.7, 0.78, 0.86, 0.94]

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function Tokens({ tokens }: { tokens: CodeToken[] }) {
  return (
    <>
      {tokens.map((token, index) =>
        token.kind ? (
          <span key={index} className={`tok-${token.kind}`}>
            {token.text}
          </span>
        ) : (
          <span key={index}>{token.text}</span>
        ),
      )}
    </>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.2 10.2L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" fill="currentColor" />
    </svg>
  )
}

function IconSliders() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 5h10M5 3v4M8 11h5M11 9v4M3 11h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IdeLayout({
  activeFeature,
  visited,
  scanning,
  reduceMotion,
  onSelectFeature,
  onRestart,
}: IdeLayoutProps) {
  const duration = activeFeature ? SIM_DURATIONS[activeFeature] : 0
  const progress = useSimProgress(activeFeature, duration, reduceMotion)

  /** Normalised progress inside a sub-window of the active simulation. */
  const phase = (from: number, to: number) => clamp((progress - from) / (to - from))
  const isSim = (id: FeatureId) => activeFeature === id

  // Agent: the reply types itself in, then the changed files land one by one.
  const replyChars = isSim('agent')
    ? Math.floor(phase(0, 0.55) * agentReply.length)
    : agentReply.length
  const isTyping = isSim('agent') && replyChars < agentReply.length
  const filesShown = isSim('agent')
    ? FILE_REVEAL_AT.filter((threshold) => progress >= threshold).length
    : changedFiles.length

  // Files Changed: each row lights up in turn.
  const diffRow = isSim('diffs')
    ? Math.min(changedFiles.length - 1, Math.floor(phase(0.05, 0.95) * changedFiles.length))
    : -1

  // Tab: the ghost suggestion types in, then gets accepted.
  const ghostLine = codeLines.find((line) => line.ghost)
  const ghostLength = ghostLine ? lineText(ghostLine.tokens).length : 0
  const ghostChars = isSim('tab') ? Math.floor(phase(0, 0.5) * ghostLength) : ghostLength
  const showTabHint = isSim('tab') && progress > 0.5 && progress < 0.82
  const tabAccepted = isSim('tab') && progress >= 0.82

  // Inline Edit: the ⌘K pill expands, the prompt types, then the edit lands.
  const inlineOpen = isSim('inline-edit') && progress > 0.06
  const inlinePromptChars = isSim('inline-edit')
    ? Math.floor(phase(0.1, 0.55) * inlineEditPrompt.length)
    : 0
  const inlineGenerating = isSim('inline-edit') && progress >= 0.55 && progress < 0.72
  const inlineApplied = isSim('inline-edit') && progress >= 0.72

  // Modes: the pills cycle Agent → Ask → Plan → Debug.
  const modeIndex = isSim('modes')
    ? Math.min(modeNames.length - 1, Math.floor(phase(0, 0.88) * modeNames.length))
    : 0

  // @ Mentions: the menu opens, an item is picked, a chip attaches to the prompt.
  const mentionMenuOpen = isSim('context') && progress > 0.08 && progress < 0.86
  const mentionIndex = isSim('context')
    ? Math.min(contextMentions.length - 1, Math.floor(phase(0.12, 0.58) * contextMentions.length))
    : 0
  const mentionAttached = isSim('context') && progress >= 0.6

  // Browser: the panel switches to a live preview and Agent verifies it.
  const browserActive = isSim('browser') && progress > 0.12
  const previewTyped = isSim('browser') ? Math.floor(phase(0.25, 0.72) * 15) : 0
  const previewVerified = isSim('browser') && progress > 0.86

  // Automations: the sidebar entry lights up and scheduled runs slide in.
  const automationsLit = isSim('automations') && progress > 0.06
  const automationCards = isSim('automations')
    ? [0.28, 0.55].filter((threshold) => progress >= threshold).length
    : 0
  const automationRunning = isSim('automations') && progress > 0.78

  const tourProgress = Math.round((visited.size / featureOrder.length) * 100)

  const hotspot = (id: FeatureId) => ({
    id,
    active: activeFeature === id,
    visited: visited.has(id),
    scanning,
    onSelect: onSelectFeature,
  })

  return (
    <motion.div
      className="cursor-ui"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ——— Agents sidebar ——— */}
      <aside className="agents-bar">
        <div className="agents-bar__top">
          <div className="agents-bar__nav">
            <div className="agents-nav agents-nav--active" aria-hidden="true">
              <IconPlus />
              <span>New Chat</span>
            </div>
            <div className="agents-nav" aria-hidden="true">
              <IconSearch />
              <span>Search</span>
            </div>
            <div className={`agents-nav hotspot-anchor${automationsLit ? ' is-lit' : ''}`}>
              <span className="agents-nav__content" aria-hidden="true">
                <IconBolt />
                <span>Automations</span>
              </span>
              <Hotspot {...hotspot('automations')} label="Automations" placement="right" />
            </div>
            <div className="agents-nav" aria-hidden="true">
              <IconSliders />
              <span>Customize</span>
            </div>
          </div>

          {automationCards > 0 && (
            <ul className="automation-runs" aria-hidden="true">
              {automationRuns.slice(0, automationCards).map((run, index) => (
                <li key={run.name}>
                  <span
                    className={`automation-runs__dot${
                      automationRunning && index === 0 ? ' is-running' : ''
                    }`}
                  />
                  <span className="automation-runs__body">
                    <span className="automation-runs__name">{run.name}</span>
                    <span className="automation-runs__when">{run.when}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="agents-bar__repos" aria-hidden="true">
          <div className="agents-bar__section-label">Repositories</div>
          <ul className="agents-bar__repo-list">
            {repos.map((repo) => (
              <li key={repo.name} className={repo.active ? 'is-active' : undefined}>
                <span className="agents-bar__repo-icon" />
                {repo.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="agents-bar__footer">
          <div className="agents-bar__progress-block">
            <span>Tour progress</span>
            <div
              className="agents-bar__progress"
              role="progressbar"
              aria-valuenow={visited.size}
              aria-valuemin={0}
              aria-valuemax={featureOrder.length}
              aria-label="Features explored"
            >
              <i style={{ width: `${tourProgress}%` }} />
            </div>
            <span className="agents-bar__progress-count">
              {visited.size}/{featureOrder.length}
            </span>
          </div>
          <div className="agents-bar__profile" aria-hidden="true">
            <div className="agents-bar__avatar">P</div>
            <div>
              <div className="agents-bar__name">Pooja Prabakaran</div>
              <div className="agents-bar__plan">Ultra</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ——— Main Agent chat ——— */}
      <main className="agent-main">
        <header className="agent-main__header">
          <div className="agent-main__title">{projectName}</div>
          <button type="button" className="agent-main__restart" onClick={onRestart}>
            Replay intro
          </button>
        </header>

        <div className="agent-main__scroll">
          <div className="agent-msg agent-msg--user">{userPrompt}</div>

          <div className="agent-msg agent-msg--ai">
            <div className="agent-msg__text hotspot-anchor">
              <p>
                {agentReply.slice(0, replyChars)}
                {isTyping && <span className="agent-caret" aria-hidden="true" />}
              </p>
              <Hotspot {...hotspot('agent')} label="Agent" placement="left" />
            </div>

            {filesShown > 0 && (
              <div className="agent-files-wrap hotspot-anchor">
                <div className="agent-files">
                  <div className="agent-files__head">
                    <span>{filesShown} Files Changed</span>
                    <span className={`agent-files__meta${diffRow >= 0 ? ' is-lit' : ''}`}>
                      Review
                    </span>
                  </div>
                  <ul>
                    {changedFiles.slice(0, filesShown).map((file, index) => (
                      <li key={file.name} className={index === diffRow ? 'is-lit' : undefined}>
                        <span className="agent-files__name">{file.name}</span>
                        <span className="agent-files__diff">
                          <em className="add">+{file.add}</em>
                          <em className="del">-{file.del}</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Hotspot {...hotspot('diffs')} label="Files Changed" placement="left" />
              </div>
            )}
          </div>
        </div>

        <div className="agent-input">
          {scanning && (
            <p className="cursor-ui__hint">
              Click a hotspot to start, or press <kbd>→</kbd> to take the tour
            </p>
          )}

          {mentionMenuOpen && (
            <div className="mention-menu" aria-hidden="true">
              <div className="mention-menu__label">Add context</div>
              <ul>
                {contextMentions.map((mention, index) => (
                  <li
                    key={mention.label}
                    className={index === mentionIndex ? 'is-active' : undefined}
                  >
                    <span className="mention-menu__name">@{mention.label}</span>
                    <span className="mention-menu__meta">{mention.meta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="agent-input__box">
            <div className="agent-input__plus hotspot-anchor">
              <span aria-hidden="true">@</span>
              <Hotspot {...hotspot('context')} label="@ Mentions" placement="top" />
            </div>
            <div className="agent-input__field">
              {mentionAttached && (
                <span className="mention-chip" aria-hidden="true">
                  @{contextMentions[mentionIndex].label}
                </span>
              )}
              <span className="agent-input__text">{followUpPrompt}</span>
            </div>
          </div>

          <div className="agent-input__toolbar">
            <div className="hotspot-anchor">
              <div className="agent-input__modes" aria-hidden="true">
                {modeNames.map((mode, index) => (
                  <span key={mode} className={index === modeIndex ? 'is-active' : undefined}>
                    {mode}
                  </span>
                ))}
              </div>
              {isSim('modes') && (
                <kbd className="mode-hint" aria-hidden="true">
                  ⇧Tab
                </kbd>
              )}
              <Hotspot {...hotspot('modes')} label="Modes" placement="top" />
            </div>
            <div className="agent-input__model" aria-hidden="true">
              Cursor Grok 4.5
            </div>
            <div className="agent-input__send" aria-hidden="true">
              ↵
            </div>
          </div>
        </div>
      </main>

      {/* ——— Editor / browser panel ——— */}
      <section className="code-panel">
        <div className="code-panel__tabs">
          <div className={`code-panel__tab${browserActive ? '' : ' is-active'}`} aria-hidden="true">
            {editorFile}
          </div>
          <div className="code-panel__tab" aria-hidden="true">
            page.tsx
          </div>
          <div className={`code-panel__tab hotspot-anchor${browserActive ? ' is-active' : ''}`}>
            <span aria-hidden="true">Browser</span>
            <Hotspot {...hotspot('browser')} label="Browser" placement="bottom" />
          </div>
        </div>

        <div className="code-panel__breadcrumb" aria-hidden="true">
          src <span>›</span> components <span>›</span> {editorFile}
        </div>

        {browserActive ? (
          <div className="browser-preview" aria-hidden="true">
            <div className="browser-preview__bar">
              <span className="browser-preview__url">{preview.url}</span>
              {previewVerified && <span className="browser-preview__check">Verified by Agent</span>}
            </div>
            <div className="browser-preview__page">
              <div className="browser-preview__heading">{preview.heading}</div>
              <div className="browser-preview__sub">{preview.sub}</div>
              <div className="browser-preview__form">
                <div className="browser-preview__input">
                  {preview.emailPlaceholder.slice(0, previewTyped)}
                  <i />
                </div>
                <div className="browser-preview__button">{preview.button}</div>
              </div>
              {previewVerified && <div className="browser-preview__toast">{preview.toast}</div>}
            </div>
          </div>
        ) : (
          <div className="code-panel__editor">
            <div className="code-panel__gutter" aria-hidden="true">
              {codeLines.map((line) => (
                <div key={line.n} className={line.ghost && !tabAccepted ? 'is-ghost' : undefined}>
                  {line.n}
                </div>
              ))}
              {inlineApplied && <div className="is-added">+</div>}
            </div>

            <div className="code-panel__code">
              {codeLines.map((line) => {
                if (!line.ghost) {
                  return (
                    <div key={line.n} className="code-line" aria-hidden="true">
                      <Tokens tokens={line.tokens} />
                    </div>
                  )
                }

                const visible = tabAccepted ? line.tokens : sliceTokens(line.tokens, ghostChars)

                return (
                  <div
                    key={line.n}
                    className={`code-line hotspot-anchor${
                      tabAccepted ? ' code-line--accepted' : ' code-line--ghost'
                    }`}
                  >
                    <span aria-hidden="true">
                      <Tokens tokens={visible} />
                    </span>
                    {showTabHint && (
                      <kbd className="tab-hint" aria-hidden="true">
                        Tab
                      </kbd>
                    )}
                    <Hotspot {...hotspot('tab')} label="Tab" placement="left" />
                  </div>
                )
              })}

              {inlineApplied && (
                <div className="code-line code-line--added" aria-hidden="true">
                  <Tokens tokens={inlineEditResult} />
                </div>
              )}

              <div className={`code-inline hotspot-anchor${inlineOpen ? ' is-open' : ''}`}>
                <span className="code-inline__content" aria-hidden="true">
                  {inlineOpen ? (
                    <>
                      <span className="code-inline__prompt">
                        {inlineEditPrompt.slice(0, inlinePromptChars)}
                        {inlinePromptChars < inlineEditPrompt.length && (
                          <span className="agent-caret" />
                        )}
                      </span>
                      {inlineGenerating && <span className="code-inline__status">Generating…</span>}
                      {inlineApplied && (
                        <span className="code-inline__status is-done">Applied</span>
                      )}
                    </>
                  ) : (
                    <span className="code-inline__idle">Inline edit</span>
                  )}
                  <kbd>⌘K</kbd>
                </span>
                <Hotspot {...hotspot('inline-edit')} label="Inline Edit" placement="top" />
              </div>
            </div>
          </div>
        )}

        <div className="code-panel__status" aria-hidden="true">
          <span>main*</span>
          <span>TypeScript React</span>
          <span>Ln 8, Col 1</span>
        </div>
      </section>
    </motion.div>
  )
}
