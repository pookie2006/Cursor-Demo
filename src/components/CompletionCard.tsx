import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { challenges, crashMission, starterClone, starterUrl, stops, type PathId } from '../tour'
import { CursorLogo } from './CursorLogo'

const UNLOCK_AT = 3

type CompletionCardProps = {
  path: PathId
  /** How many Try prompts the student marked as actually run. */
  ranCount: number
  reduceMotion: boolean
  onExploreAll: () => void
  onReplay: () => void
  onDismiss: () => void
}

export function CompletionCard({
  path,
  ranCount,
  reduceMotion,
  onExploreAll,
  onReplay,
  onDismiss,
}: CompletionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const crash = path === 'crash'
  const unlocked = ranCount >= UNLOCK_AT || crash

  return (
    <motion.div
      className="completion"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        ref={cardRef}
        className="completion__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        tabIndex={-1}
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      >
        <div className="completion__mark">
          <CursorLogo fill="#f54e00" />
        </div>

        <h2 id="completion-title" className="completion__title">
          {crash ? 'Crash course complete' : 'That’s the whole control plane'}
        </h2>
        <p className="completion__body">
          {crash ? (
            <>
              Mission accomplished: {crashMission} You’ve seen the core loop — now make it yours.
              Continue Lion Events, then open <em>your</em> Columbia repo and reuse the same loop.
            </>
          ) : (
            <>
              You’ve toured every stop — the local loop, modes and models, rules, skills, hooks,
              MCP, parallel agents, the cloud, and the merge gate. Continue Lion Events, then open{' '}
              <em>your</em> Columbia repo and reuse the same loop.
            </>
          )}
        </p>

        <div className="completion__handoff">
          <span className="completion__handoff-label">Take Lion Events home</span>
          <code className="completion__clone">{starterClone}</code>
          <div className="completion__handoff-actions">
            <button
              type="button"
              className="completion__secondary"
              onClick={() => {
                void navigator.clipboard?.writeText(starterClone)
                setCopied(true)
              }}
            >
              {copied ? 'Copied ✓' : 'Copy clone command'}
            </button>
            <a className="completion__secondary" href={starterUrl} target="_blank" rel="noreferrer">
              Starter on GitHub ↗
            </a>
          </div>
          <p className="completion__handoff-hint">
            Then <strong>File → Open</strong> the folder in Cursor and paste any Try prompt from the
            tour.
          </p>
        </div>

        {unlocked ? (
          <ul className="completion__challenges">
            {challenges.map((challenge) => (
              <li key={challenge}>{challenge}</li>
            ))}
          </ul>
        ) : (
          <p className="completion__locked">
            Stretch challenges unlock after you run {UNLOCK_AT} Try prompts for real — mark them
            with “I ran this in Cursor” on each stop. Progress: {ranCount}/{UNLOCK_AT}.
          </p>
        )}

        <div className="completion__actions">
          {crash ? (
            <button type="button" className="completion__cta" onClick={onExploreAll}>
              Explore all {stops.length} stops
            </button>
          ) : (
            <a className="completion__cta" href="https://cursor.com" target="_blank" rel="noreferrer">
              Download Cursor
            </a>
          )}
          <button type="button" className="completion__secondary" onClick={onReplay}>
            Replay tour
          </button>
        </div>

        <button type="button" className="completion__dismiss" onClick={onDismiss}>
          Keep exploring
        </button>
      </motion.div>
    </motion.div>
  )
}
