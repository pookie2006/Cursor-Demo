import { useCallback, useEffect, useState } from 'react'

import { IdeLayout } from './IdeLayout'
import { FeaturePanel } from './FeaturePanel'
import { CompletionCard } from './CompletionCard'
import { featureOrder, features, isFeatureId, type FeatureId } from '../features'

interface HomeIdeProps {
  /** True while the world camera is zoomed into the home continent. */
  focused: boolean
  reduceMotion: boolean
  initialFeature?: string | null
  /** Zoom back out to the world map. */
  onExit: () => void
  onRestart: () => void
}

/**
 * The original interactive IDE demo, now living as the home continent of the
 * Agent OS map. Owns the hotspot tour state and its keyboard shortcuts, which
 * are only active while the camera is zoomed in.
 */
export function HomeIde({ focused, reduceMotion, initialFeature, onExit, onRestart }: HomeIdeProps) {
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(() =>
    initialFeature && isFeatureId(initialFeature) ? initialFeature : null,
  )
  const [visited, setVisited] = useState<Set<FeatureId>>(
    () => new Set(activeFeature ? [activeFeature] : []),
  )
  const [completionDismissed, setCompletionDismissed] = useState(false)

  const selectFeature = useCallback((id: FeatureId) => {
    setActiveFeature(id)
    setVisited((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })
  }, [])

  const closeFeature = useCallback(() => setActiveFeature(null), [])

  const step = useCallback((delta: number) => {
    setActiveFeature((current) => {
      const currentIndex = current ? featureOrder.indexOf(current) : -1
      const nextIndex =
        currentIndex === -1
          ? delta > 0
            ? 0
            : featureOrder.length - 1
          : (currentIndex + delta + featureOrder.length) % featureOrder.length
      const next = featureOrder[nextIndex]

      setVisited((seen) => {
        if (seen.has(next)) return seen
        const updated = new Set(seen)
        updated.add(next)
        return updated
      })

      return next
    })
  }, [])

  const tourComplete = visited.size === featureOrder.length
  const showCompletion = focused && tourComplete && !activeFeature && !completionDismissed

  useEffect(() => {
    if (!focused) return

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        if (showCompletion) setCompletionDismissed(true)
        else if (activeFeature) closeFeature()
        else onExit()
        return
      }

      if (showCompletion) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
        return
      }

      const digit = Number.parseInt(event.key, 10)
      if (!Number.isNaN(digit) && digit >= 1 && digit <= featureOrder.length) {
        event.preventDefault()
        selectFeature(featureOrder[digit - 1])
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeFeature, closeFeature, focused, onExit, selectFeature, showCompletion, step])

  const activeIndex = activeFeature ? featureOrder.indexOf(activeFeature) : -1

  return (
    <>
      <IdeLayout
        activeFeature={activeFeature}
        visited={visited}
        scanning={focused && visited.size === 0}
        reduceMotion={reduceMotion}
        onSelectFeature={selectFeature}
        onRestart={onRestart}
      />

      {focused && (
        <FeaturePanel
          feature={activeFeature ? features[activeFeature] : null}
          index={activeIndex}
          total={featureOrder.length}
          reduceMotion={reduceMotion}
          onClose={closeFeature}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}

      {showCompletion && (
        <CompletionCard
          reduceMotion={reduceMotion}
          onReplay={() => {
            setActiveFeature(null)
            setVisited(new Set())
            setCompletionDismissed(false)
          }}
          onDismiss={() => setCompletionDismissed(true)}
        />
      )}
    </>
  )
}
