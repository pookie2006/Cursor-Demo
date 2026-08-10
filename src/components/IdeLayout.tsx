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
import type { FeatureId } from '../features'
import { stops, type TourStop } from '../tour'
import { useSimProgress } from '../useSimProgress'
import { Hotspot, type HotspotPlacement } from './Hotspot'
import { Vignette } from './Vignette'

type IdeLayoutProps = {
  activeStop: TourStop | null
  visited: Set<string>
  /** The next unvisited stop in tour order — its dot flashes as the call to action. */
  nextId: string | null
  scanning: boolean
  reduceMotion: boolean
  onSelectStop: (id: string) => void
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

/**
 * The mock Cursor IDE — the only screen of the demo. The Prezi camera zooms
 * into its regions (data-region attributes); each tour stop either drives one
 * of the built-in simulations or renders a scripted vignette into its slot
 * (terminal, editor file, chat card, popover).
 */
export function IdeLayout({
  activeStop,
  visited,
  nextId,
  scanning,
  reduceMotion,
  onSelectStop,
  onRestart,
}: IdeLayoutProps) {
  const activeFeature = (activeStop?.sim ?? null) as FeatureId | null
  const duration = activeFeature ? SIM_DURATIONS[activeFeature] : 0
  const progress = useSimProgress(activeFeature ? activeStop!.id : null, duration, reduceMotion)

  const slot = activeStop?.slot ?? null
  const slotVignette = activeStop?.vignette ?? null

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

  const tourProgress = Math.round((visited.size / stops.length) * 100)

  /**
   * Dots spawn in tour order: only visited stops keep their dot, and the next
   * unvisited stop flashes as the call to action. Everything else stays hidden.
   */
  const spot = (id: string, label: string, placement: HotspotPlacement) => {
    const isActive = activeStop?.id === id
    const isVisited = visited.has(id)
    const isNext = nextId === id
    if (!isActive && !isVisited && !isNext) return null
    return (
      <Hotspot
        id={id}
        label={label}
        placement={placement}
        active={isActive}
        visited={isVisited}
        next={isNext}
        onSelect={onSelectStop}
      />
    )
  }

  const showEditorFile = slot === 'editor-file' && slotVignette

  return (
    <motion.div
      className="cursor-ui"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ——— Agents sidebar ——— */}
      <aside className="agents-bar">
        <div className="agents-bar__top" data-region="sidebar">
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
              {spot('automations', 'Automations', 'right')}
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
              aria-valuemax={stops.length}
              aria-label="Features explored"
            >
              <i style={{ width: `${tourProgress}%` }} />
            </div>
            <span className="agents-bar__progress-count">
              {visited.size}/{stops.length}
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
          <span className="hotspot-anchor">
            {spot('checkpoints', 'Checkpoints', 'left')}
            <button type="button" className="agent-main__restart" onClick={onRestart}>
              Replay intro
            </button>
          </span>
        </header>

        <div className="agent-main__scroll" data-region="chat">
          <div className="agent-msg agent-msg--user hotspot-anchor">
            {userPrompt}
            {spot('mcp', 'MCP', 'left')}
          </div>

          <div className="agent-msg agent-msg--ai">
            <div className="agent-msg__text hotspot-anchor">
              <p>
                {agentReply.slice(0, replyChars)}
                {isTyping && <span className="agent-caret" aria-hidden="true" />}
              </p>
              {spot('agent', 'Agent', 'left')}
              {spot('subagents', 'Subagents', 'right')}
            </div>

            {filesShown > 0 && (
              <div className="agent-files-wrap hotspot-anchor" data-region="files">
                <div className="agent-files">
                  <div className="agent-files__head">
                    <span>{filesShown} Files Changed</span>
                    <span
                      className={`agent-files__meta hotspot-anchor${diffRow >= 0 ? ' is-lit' : ''}`}
                    >
                      Review
                      {spot('bugbot', 'Bugbot', 'top')}
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
                {spot('diffs', 'Files Changed', 'left')}
                {spot('worktrees', 'Worktrees', 'right')}

                {slot === 'files' && slotVignette && (
                  <div className="files-vig" aria-hidden="true">
                    <Vignette spec={slotVignette} active reduceMotion={reduceMotion} />
                  </div>
                )}
              </div>
            )}

            {slot === 'chat' && slotVignette && (
              <div className="chat-vig" aria-hidden="true">
                <div className="chat-vig__label">{activeStop?.title}</div>
                <Vignette spec={slotVignette} active reduceMotion={reduceMotion} />
              </div>
            )}
          </div>
        </div>

        <div className="agent-input" data-region="input">
          {scanning && (
            <p className="cursor-ui__hint">
              Click the flashing dot to start the tour, or press <kbd>→</kbd>
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

          {slot === 'popover-ring' && slotVignette && (
            <div className="ring-pop" aria-hidden="true">
              <div className="ring-pop__title">Context window</div>
              <Vignette spec={slotVignette} active reduceMotion={reduceMotion} />
            </div>
          )}

          <div className="agent-input__box">
            <div className="agent-input__plus hotspot-anchor">
              <span aria-hidden="true">@</span>
              {spot('context', '@ Mentions', 'top')}
            </div>
            <div className="agent-input__field hotspot-anchor">
              {spot('context-ring', 'Context Ring', 'top')}
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
              {spot('modes', 'Modes', 'top')}
            </div>
            <div className="agent-input__model hotspot-anchor">
              <span aria-hidden="true">Cursor Grok 4.5</span>
              {spot('models', 'Models', 'top')}

              {slot === 'popover-model' && slotVignette && (
                <div className="model-pop" aria-hidden="true">
                  <div className="model-pop__title">Model</div>
                  <Vignette spec={slotVignette} active reduceMotion={reduceMotion} />
                </div>
              )}
            </div>
            <div className="agent-input__send" aria-hidden="true">
              ↵
            </div>
          </div>
        </div>
      </main>

      {/* ——— Editor / browser / terminal panel ——— */}
      <section className="code-panel" data-region="code-panel">
        <div className="code-panel__tabs">
          <div
            className={`code-panel__tab hotspot-anchor${
              browserActive || showEditorFile ? '' : ' is-active'
            }`}
          >
            <span aria-hidden="true">{editorFile}</span>
            {spot('skills', 'Skills', 'bottom')}
          </div>
          {showEditorFile && (
            <div className="code-panel__tab is-active is-temp" aria-hidden="true">
              {activeStop?.fileName}
            </div>
          )}
          <div className={`code-panel__tab hotspot-anchor${browserActive ? ' is-active' : ''}`}>
            <span aria-hidden="true">Browser</span>
            {spot('browser', 'Browser', 'bottom')}
          </div>
        </div>

        <div className="code-panel__breadcrumb hotspot-anchor">
          <span aria-hidden="true">
            {showEditorFile ? (
              <>
                .cursor <span>›</span> {activeStop?.fileName}
              </>
            ) : (
              <>
                src <span>›</span> components <span>›</span> {editorFile}
              </>
            )}
          </span>
          {spot('rules', 'Rules', 'bottom')}
        </div>

        <div className="code-panel__body" data-region="editor">
          {browserActive ? (
            <div className="browser-preview" aria-hidden="true">
              <div className="browser-preview__bar">
                <span className="browser-preview__url">{preview.url}</span>
                {previewVerified && (
                  <span className="browser-preview__check">Verified by Agent</span>
                )}
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
          ) : showEditorFile ? (
            <div className="editor-vig" aria-hidden="true">
              <Vignette spec={slotVignette!} active reduceMotion={reduceMotion} />
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
                      {spot('tab', 'Tab', 'left')}
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
                        {inlineGenerating && (
                          <span className="code-inline__status">Generating…</span>
                        )}
                        {inlineApplied && (
                          <span className="code-inline__status is-done">Applied</span>
                        )}
                      </>
                    ) : (
                      <span className="code-inline__idle">Inline edit</span>
                    )}
                    <kbd>⌘K</kbd>
                  </span>
                  {spot('inline-edit', 'Inline Edit', 'top')}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ide-terminal" data-region="terminal">
          <div className="ide-terminal__head hotspot-anchor">
            <span aria-hidden="true">Terminal</span>
            <span className="ide-terminal__shell hotspot-anchor">
              <span aria-hidden="true">zsh — {projectName}</span>
              {spot('cli', 'CLI', 'top')}
            </span>
            {spot('hooks', 'Hooks', 'top')}
          </div>
          <div className="ide-terminal__body hotspot-anchor">
            {spot('cloud', 'Cloud Agents', 'left')}
            {spot('runmodes', 'Run Modes', 'right')}
            <div className="ide-terminal__content" aria-hidden="true">
              {slot === 'terminal' && slotVignette ? (
                <Vignette spec={slotVignette} active reduceMotion={reduceMotion} />
              ) : (
                <div className="ide-terminal__idle">
                  <div className="vig-row vig-cmd">
                    <span className="vig-prompt">$</span>
                    <span>npm run dev</span>
                  </div>
                  <div className="vig-row vig-out--dim">➜ CampusEvents ready on localhost:3000</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="code-panel__status">
          <span aria-hidden="true">main*</span>
          <span className="hotspot-anchor">
            <span aria-hidden="true">TypeScript React</span>
            {spot('sdk', 'SDK', 'top')}
          </span>
          <span aria-hidden="true">Ln 8, Col 1</span>
        </div>
      </section>
    </motion.div>
  )
}
