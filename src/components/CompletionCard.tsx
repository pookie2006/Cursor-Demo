import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { userPrompt } from '../demoContent'
import { CursorLogo } from './CursorLogo'

type CompletionCardProps = {
  reduceMotion: boolean
  onReplay: () => void
  onDismiss: () => void
}

export function CompletionCard({ reduceMotion, onReplay, onDismiss }: CompletionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

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
          <CursorLogo fill="#863bff" />
        </div>

        <h2 id="completion-title" className="completion__title">
          That’s the loop
        </h2>
        <p className="completion__body">
          You’ve seen all eight. Prompt, ground it in context, pick the right mode, review the diff,
          and let Tab and ⌘K handle the rest. Now run it on your own codebase.
        </p>

        <div className="completion__actions">
          <a className="completion__cta" href="https://cursor.com" target="_blank" rel="noreferrer">
            Download Cursor
          </a>
          <button
            type="button"
            className="completion__secondary"
            onClick={() => navigator.clipboard?.writeText(userPrompt)}
          >
            Copy the demo prompt
          </button>
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
