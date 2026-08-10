import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LogoIntro } from './components/LogoIntro'
import { IdeLayout } from './components/IdeLayout'
import { FeaturePanel } from './components/FeaturePanel'
import { CompletionCard } from './components/CompletionCard'
import { featureOrder, features, isFeatureId, type FeatureId } from './features'

type Stage = 'intro' | 'zooming' | 'ide'

function readUrl(): { stage: Stage; feature: FeatureId | null } {
  if (typeof window === 'undefined') return { stage: 'intro', feature: null }

  const params = new URLSearchParams(window.location.search)
  const requested = params.get('feature')

  if (requested && isFeatureId(requested)) return { stage: 'ide', feature: requested }
  if (params.has('ide')) return { stage: 'ide', feature: null }

  return { stage: 'intro', feature: null }
}

export default function App() {
  const initial = useMemo(readUrl, [])
  const reduceMotion = useReducedMotion() ?? false

  const [stage, setStage] = useState<Stage>(initial.stage)
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(initial.feature)
  const [visited, setVisited] = useState<Set<FeatureId>>(
    () => new Set(initial.feature ? [initial.feature] : []),
  )
  const [completionDismissed, setCompletionDismissed] = useState(false)

  const enter = useCallback(() => {
    setStage((current) => {
      if (current !== 'intro') return current
      return reduceMotion ? 'ide' : 'zooming'
    })
  }, [reduceMotion])

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

  const step = useCallback(
    (delta: number) => {
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
    },
    [],
  )

  const restartTour = useCallback(() => {
    setActiveFeature(null)
    setVisited(new Set())
    setCompletionDismissed(false)
    setStage('intro')
  }, [])

  const tourComplete = visited.size === featureOrder.length
  const showCompletion = stage === 'ide' && tourComplete && !activeFeature && !completionDismissed

  // Keep the URL shareable so a specific feature can be linked to mid-talk.
  useEffect(() => {
    if (typeof window === 'undefined' || stage !== 'ide') return

    const params = new URLSearchParams(window.location.search)
    params.delete('ide')

    if (activeFeature) params.set('feature', activeFeature)
    else params.delete('feature')

    const query = params.toString()
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
  }, [activeFeature, stage])

  useEffect(() => {
    if (stage !== 'ide') return

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        if (showCompletion) setCompletionDismissed(true)
        else closeFeature()
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
  }, [closeFeature, selectFeature, showCompletion, stage, step])

  const activeIndex = activeFeature ? featureOrder.indexOf(activeFeature) : -1

  return (
    <div className="app">
      {(stage === 'intro' || stage === 'zooming') && (
        <LogoIntro
          onEnter={enter}
          zooming={stage === 'zooming'}
          reduceMotion={reduceMotion}
          onZoomComplete={() => setStage('ide')}
        />
      )}

      {stage === 'ide' && (
        <>
          <IdeLayout
            activeFeature={activeFeature}
            visited={visited}
            scanning={visited.size === 0}
            reduceMotion={reduceMotion}
            onSelectFeature={selectFeature}
            onRestart={() => setStage('intro')}
          />

          <FeaturePanel
            feature={activeFeature ? features[activeFeature] : null}
            index={activeIndex}
            total={featureOrder.length}
            reduceMotion={reduceMotion}
            onClose={closeFeature}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />

          {showCompletion && (
            <CompletionCard
              reduceMotion={reduceMotion}
              onReplay={restartTour}
              onDismiss={() => setCompletionDismissed(true)}
            />
          )}
        </>
      )}
    </div>
  )
}
