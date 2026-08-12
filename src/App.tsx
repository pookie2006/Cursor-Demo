import { useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { LogoIntro } from './components/LogoIntro'
import { IdeWorld } from './components/IdeWorld'
import { isStopId } from './tour'

type Stage = 'intro' | 'zooming' | 'revealing' | 'ide'

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

  const showIntro = stage === 'intro' || stage === 'zooming' || stage === 'revealing'
  const showIde = stage === 'zooming' || stage === 'revealing' || stage === 'ide'
  // Keep the IDE invisible under the dive, then ease it in as the black curtain lifts.
  const ideReady = stage === 'revealing' || stage === 'ide'

  return (
    <div className="app">
      {showIde && (
        <motion.div
          className="app__ide"
          initial={false}
          animate={{ opacity: ideReady ? 1 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: ideReady ? 0.05 : 0 }
          }
        >
          <IdeWorld
            initialStopId={initial.stopId}
            reduceMotion={reduceMotion}
            onRestart={() => setStage('intro')}
          />
        </motion.div>
      )}

      {showIntro && (
        <LogoIntro
          onEnter={enter}
          zooming={stage === 'zooming'}
          exiting={stage === 'revealing'}
          reduceMotion={reduceMotion}
          onZoomComplete={() => setStage('revealing')}
          onExitComplete={() => setStage('ide')}
        />
      )}
    </div>
  )
}
