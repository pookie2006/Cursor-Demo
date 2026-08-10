import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Feature } from '../features'

type FeaturePanelProps = {
  feature: Feature | null
  index: number
  total: number
  reduceMotion: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const FOCUSABLE = 'button:not([disabled])'

function FeatureCaption({
  feature,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: Omit<FeaturePanelProps, 'feature' | 'reduceMotion'> & { feature: Feature }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    returnFocusTo.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    return () => {
      returnFocusTo.current?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      ref={panelRef}
      className="feature-caption"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-title"
      tabIndex={-1}
    >
      <div className="feature-caption__main" aria-live="polite">
        <div className="feature-caption__heading">
          <h2 id="feature-title" className="feature-caption__title">
            {feature.name}
          </h2>
          <span className="feature-caption__shortcut">{feature.shortcut}</span>
        </div>
        <p className="feature-caption__tagline">{feature.tagline}</p>
        <p className="feature-caption__body">{feature.description}</p>

        {showDetails && (
          <div className="feature-caption__details">
            <ul className="feature-caption__list">
              {feature.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="feature-caption__tip">
              <span>Tip</span>
              {feature.tip}
            </p>
          </div>
        )}
      </div>

      <div className="feature-caption__controls">
        <span className="feature-caption__count">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          className="feature-caption__details-toggle"
          onClick={() => setShowDetails((open) => !open)}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Less' : 'Details'}
        </button>
        <div className="feature-caption__nav">
          <button type="button" onClick={onPrev} aria-label="Previous feature">
            ←
          </button>
          <button type="button" onClick={onNext} aria-label="Next feature">
            →
          </button>
        </div>
        <button
          type="button"
          className="feature-caption__close"
          onClick={onClose}
          aria-label="Close feature details"
        >
          Esc
        </button>
      </div>
    </div>
  )
}

export function FeaturePanel({
  feature,
  index,
  total,
  reduceMotion,
  onClose,
  onPrev,
  onNext,
}: FeaturePanelProps) {
  return (
    <AnimatePresence>
      {feature && (
        <>
          <div className="feature-scrim" aria-hidden="true" onClick={onClose} />
          <motion.div
            className="feature-caption-wrap"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <FeatureCaption
              feature={feature}
              index={index}
              total={total}
              onClose={onClose}
              onPrev={onPrev}
              onNext={onNext}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
