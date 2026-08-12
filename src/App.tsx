import { useCallback, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { LogoIntro } from './components/LogoIntro'
import { IdeWorld } from './components/IdeWorld'
import { isStopId } from './tour'

type Stage = 'intro' | 'zooming' | 'ide'

interface InitialState {
  stage: Stage
  stopId: string | null
}

/**
 * Deep links: #/skills (or ?at=skills, or legacy ?feature=tab) zooms straight
 * to a stop, ?ide skips the intro to the overview, no params plays the intro.
 */
function readUrl(): InitialState {
  if (typeof window === 'undefined') return { stage: 'intro', stopId: null }

  const params = new URLSearchParams(window.location.search)
  const requested =
    window.location.hash.replace(/^#\/?/, '') || params.get('at') || params.get('feature') || ''

  if (requested && isStopId(requested)) return { stage: 'ide', stopId: requested }
  if (params.has('ide') || params.has('at')) return { stage: 'ide', stopId: null }

  return { stage: 'intro', stopId: null }
}

export default function App() {
  const initial = useMemo(readUrl, [])
  const reduceMotion = useReducedMotion() ?? false

  const [stage, setStage] = useState<Stage>(initial.stage)

  const enter = useCallback(() => {
    setStage((current) => {
      if (current !== 'intro') return current
      return reduceMotion ? 'ide' : 'zooming'
    })
  }, [reduceMotion])

  const showIde = stage === 'zooming' || stage === 'ide'

  return (
    <div className="app">
      {/* Mount the demo under the intro during the dive so black reveals the IDE. */}
      {showIde && (
        <IdeWorld
          initialStopId={initial.stopId}
          reduceMotion={reduceMotion}
          onRestart={() => setStage('intro')}
        />
      )}

      {(stage === 'intro' || stage === 'zooming') && (
        <LogoIntro
          onEnter={enter}
          zooming={stage === 'zooming'}
          reduceMotion={reduceMotion}
          onZoomComplete={() => setStage('ide')}
        />
      )}
    </div>
  )
}
