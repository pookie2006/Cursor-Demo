import { useCallback, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { LogoIntro } from './components/LogoIntro'
import { WorldCanvas } from './components/WorldCanvas'
import { isFeatureId } from './features'
import { parseWorldHash, type WorldFocus } from './world'

type Stage = 'intro' | 'zooming' | 'world'

interface InitialState {
  stage: Stage
  focus: WorldFocus
  ideFeature: string | null
}

/**
 * Deep links: #/extend/skills zooms straight to a node, #/home (or legacy
 * ?ide / ?feature=tab) enters the live IDE, no params plays the intro.
 */
function readUrl(): InitialState {
  if (typeof window === 'undefined') {
    return { stage: 'intro', focus: { kind: 'world' }, ideFeature: null }
  }

  const params = new URLSearchParams(window.location.search)
  const requestedFeature = params.get('feature')

  if (requestedFeature && isFeatureId(requestedFeature)) {
    return { stage: 'world', focus: { kind: 'node', id: 'home' }, ideFeature: requestedFeature }
  }

  // ?at=extend/skills works where hashes get stripped (e.g. some embeds).
  const fromUrl = parseWorldHash(window.location.hash) ?? parseWorldHash(`#/${params.get('at') ?? ''}`)
  if (fromUrl) return { stage: 'world', focus: fromUrl, ideFeature: null }

  if (params.has('ide')) {
    return { stage: 'world', focus: { kind: 'node', id: 'home' }, ideFeature: null }
  }

  return { stage: 'intro', focus: { kind: 'world' }, ideFeature: null }
}

export default function App() {
  const initial = useMemo(readUrl, [])
  const reduceMotion = useReducedMotion() ?? false

  const [stage, setStage] = useState<Stage>(initial.stage)

  const enter = useCallback(() => {
    setStage((current) => {
      if (current !== 'intro') return current
      return reduceMotion ? 'world' : 'zooming'
    })
  }, [reduceMotion])

  return (
    <div className="app">
      {(stage === 'intro' || stage === 'zooming') && (
        <LogoIntro
          onEnter={enter}
          zooming={stage === 'zooming'}
          reduceMotion={reduceMotion}
          onZoomComplete={() => setStage('world')}
        />
      )}

      {stage === 'world' && (
        <WorldCanvas
          initialFocus={initial.focus}
          initialIdeFeature={initial.ideFeature}
          reduceMotion={reduceMotion}
          onRestart={() => setStage('intro')}
        />
      )}
    </div>
  )
}
