import { useMemo, useState } from 'react'

import { useSimProgress } from '../useSimProgress'
import type { VignetteSpec, VignetteStep } from '../world'

interface VignetteProps {
  spec: VignetteSpec
  active: boolean
  reduceMotion: boolean
}

/** Animated mini-demo inside a world node: typed prompts, tool calls, races. */
export function Vignette({ spec, active, reduceMotion }: VignetteProps) {
  const [replay, setReplay] = useState(0)

  return (
    <div className="vig-shell">
      {spec.type === 'script' && (
        <ScriptVignette spec={spec} active={active} reduceMotion={reduceMotion} replay={replay} />
      )}
      {spec.type === 'race' && (
        <RaceVignette spec={spec} active={active} reduceMotion={reduceMotion} replay={replay} />
      )}
      {spec.type === 'ring' && (
        <RingVignette spec={spec} active={active} reduceMotion={reduceMotion} replay={replay} />
      )}

      {active && !reduceMotion && (
        <button type="button" className="vig-replay" onClick={() => setReplay((n) => n + 1)}>
          ↻ Replay
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

const TYPED_MS: Partial<Record<VignetteStep['kind'], number>> = {
  cmd: 24,
  user: 16,
  code: 13,
  agent: 11,
}

const APPEAR_MS: Partial<Record<VignetteStep['kind'], number>> = {
  out: 420,
  tool: 560,
  banner: 620,
  file: 320,
}

interface TimedStep {
  step: VignetteStep
  start: number
  dur: number
}

function buildTimeline(steps: VignetteStep[]): { timed: TimedStep[]; total: number } {
  let clock = 250
  const timed = steps.map((step) => {
    const charMs = TYPED_MS[step.kind]
    const text = 'text' in step ? step.text : ''
    const dur = charMs ? Math.max(300, text.length * charMs) : (APPEAR_MS[step.kind] ?? 420)
    const entry = { step, start: clock, dur }
    clock += dur + (step.kind === 'banner' ? 320 : 180)
    return entry
  })
  return { timed, total: clock + 350 }
}

function ScriptVignette({
  spec,
  active,
  reduceMotion,
  replay,
}: {
  spec: Extract<VignetteSpec, { type: 'script' }>
  active: boolean
  reduceMotion: boolean
  replay: number
}) {
  const { timed, total } = useMemo(() => buildTimeline(spec.steps), [spec.steps])
  const progress = useSimProgress(active ? `script-${replay}` : null, total, reduceMotion)
  const t = progress * total

  return (
    <div className={`vig vig--${spec.frame}`} aria-hidden="true">
      {timed.map(({ step, start, dur }, i) => {
        const local = Math.min(1, Math.max(0, (t - start) / dur))
        if (local <= 0) return null
        return <StepRow key={i} step={step} local={local} />
      })}
    </div>
  )
}

function StepRow({ step, local }: { step: VignetteStep; local: number }) {
  const typing = local < 1

  switch (step.kind) {
    case 'cmd':
      return (
        <div className="vig-row vig-cmd">
          <span className="vig-prompt">$</span>
          <span>
            {slice(step.text, local)}
            {typing && <i className="vig-caret" />}
          </span>
        </div>
      )
    case 'code':
      return (
        <div className="vig-row vig-code">
          {slice(step.text, local)}
          {typing && <i className="vig-caret" />}
        </div>
      )
    case 'user':
      return (
        <div className="vig-row vig-user">
          {slice(step.text, local)}
          {typing && <i className="vig-caret" />}
        </div>
      )
    case 'agent':
      return <div className="vig-row vig-agent">{slice(step.text, local)}</div>
    case 'out':
      return (
        <div className={`vig-row vig-out vig-out--${step.tone ?? 'plain'}`} style={{ opacity: local }}>
          {step.text}
        </div>
      )
    case 'file':
      return (
        <div className="vig-row vig-file" style={{ opacity: local }}>
          {step.name}
        </div>
      )
    case 'tool':
      return (
        <div className={`vig-row vig-tool vig-tool--${step.status}`} style={{ opacity: local }}>
          <span className="vig-tool__dot" />
          <span className="vig-tool__name">{step.name}</span>
          <span className="vig-tool__detail">{step.detail}</span>
        </div>
      )
    case 'banner':
      return (
        <div
          className={`vig-row vig-banner vig-banner--${step.tone}`}
          style={{ opacity: local, transform: `translateY(${(1 - local) * 6}px)` }}
        >
          {step.text}
        </div>
      )
  }
}

function slice(text: string, local: number): string {
  return text.slice(0, Math.ceil(text.length * local))
}

/* ------------------------------------------------------------------ */

function RaceVignette({
  spec,
  active,
  reduceMotion,
  replay,
}: {
  spec: Extract<VignetteSpec, { type: 'race' }>
  active: boolean
  reduceMotion: boolean
  replay: number
}) {
  const total = 3600
  const progress = useSimProgress(active ? `race-${replay}` : null, total, reduceMotion)

  // Lanes finish at staggered times; the winner finishes first.
  const speeds = spec.contenders.map((_, i) => (i === spec.winner ? 1 / 0.72 : 1 / (0.85 + i * 0.07)))

  return (
    <div className="vig vig--race" aria-hidden="true">
      <div className="vig-race__task">{spec.task}</div>
      {spec.contenders.map((c, i) => {
        const fill = Math.min(1, progress * speeds[i])
        const isWinner = i === spec.winner && progress > 0.8
        return (
          <div key={c.model} className={`vig-race__lane${isWinner ? ' is-winner' : ''}`}>
            <span className="vig-race__model">worktree-{i + 1} · {c.model}</span>
            <span className="vig-race__track">
              <span className="vig-race__fill" style={{ width: `${fill * 100}%` }} />
            </span>
            <span className="vig-race__note">{fill >= 1 ? c.note : '…'}</span>
            {isWinner && <span className="vig-race__badge">winner</span>}
          </div>
        )
      })}
      {progress > 0.92 && (
        <div className="vig-banner vig-banner--ok">/apply-worktree keeps the winner</div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

const RING_COLORS = ['#a78bfa', '#7c5cfa', '#5b8def', '#38bdf8', '#f4a24c', '#3a3a46']

function RingVignette({
  spec,
  active,
  reduceMotion,
  replay,
}: {
  spec: Extract<VignetteSpec, { type: 'ring' }>
  active: boolean
  reduceMotion: boolean
  replay: number
}) {
  const total = 2800
  const progress = useSimProgress(active ? `ring-${replay}` : null, total, reduceMotion)
  const t = progress * total

  const r = 52
  const C = 2 * Math.PI * r
  let cumulative = 0

  return (
    <div className="vig vig--ring" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="vig-ring__svg">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#26262e" strokeWidth="14" />
        {spec.segments.map((seg, i) => {
          const offset = cumulative
          cumulative += seg.share
          const local = Math.min(1, Math.max(0, (t - i * 340) / 480))
          if (local <= 0) return null
          return (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={RING_COLORS[i % RING_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${seg.share * C * local} ${C}`}
              strokeDashoffset={-offset * C}
              transform="rotate(-90 70 70)"
            />
          )
        })}
        <text x="70" y="66" textAnchor="middle" className="vig-ring__label">context</text>
        <text x="70" y="82" textAnchor="middle" className="vig-ring__label">window</text>
      </svg>
      <ul className="vig-ring__legend">
        {spec.segments.map((seg, i) => {
          const local = Math.min(1, Math.max(0, (t - i * 340) / 480))
          return (
            <li key={seg.label} style={{ opacity: local }}>
              <span className="vig-ring__swatch" style={{ background: RING_COLORS[i % RING_COLORS.length] }} />
              {seg.label} <em>{seg.tokens}</em>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
