import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { HomeIde } from './HomeIde'
import { Vignette } from './Vignette'
import {
  HOME_RECT,
  WORLD,
  continentById,
  continents,
  nodeById,
  nodes,
  tourOrder,
  type Continent,
  type Rect,
  type WorldFocus,
  type WorldNode,
} from '../world'

function formatHash(focus: WorldFocus): string {
  if (focus.kind === 'world') return ''
  if (focus.kind === 'continent') return `#/${focus.id}`
  if (focus.id === 'home') return '#/home'
  const node = nodeById.get(focus.id)
  return node?.continent ? `#/${node.continent}/${node.id}` : `#/${focus.id}`
}

function rectFor(focus: WorldFocus): Rect {
  if (focus.kind === 'world') return { x: 0, y: 0, w: WORLD.w, h: WORLD.h }
  if (focus.kind === 'continent') return continentById.get(focus.id)!.zone
  if (focus.id === 'home') return HOME_RECT
  return nodeById.get(focus.id)!.rect
}

function parentOf(focus: WorldFocus): WorldFocus {
  if (focus.kind === 'node') {
    const node = nodeById.get(focus.id)
    if (node?.continent) return { kind: 'continent', id: node.continent }
    return { kind: 'world' }
  }
  return { kind: 'world' }
}

interface WorldCanvasProps {
  initialFocus: WorldFocus
  initialIdeFeature: string | null
  reduceMotion: boolean
  onRestart: () => void
}

/**
 * The Prezi-style Agent OS map: a large world layer moved by an animated
 * camera. The mock IDE sits at the center as the home continent; advanced
 * capability nodes with live vignettes surround it.
 */
export function WorldCanvas({ initialFocus, initialIdeFeature, reduceMotion, onRestart }: WorldCanvasProps) {
  const [focus, setFocus] = useState<WorldFocus>(initialFocus)
  const [tourIndex, setTourIndex] = useState<number | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1440 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }))
  const wheelAt = useRef(0)

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Shareable deep links: #/extend/skills, #/home, …
  useEffect(() => {
    const hash = formatHash(focus)
    const base = window.location.pathname + window.location.search
    window.history.replaceState(null, '', hash ? base + hash : base)
  }, [focus])

  const focusNode = useCallback((id: string) => {
    setFocus({ kind: 'node', id })
    const stop = tourOrder.indexOf(id)
    setTourIndex((current) => (current !== null && stop !== -1 ? stop : current))
  }, [])

  const zoomOut = useCallback(() => {
    setFocus((current) => parentOf(current))
  }, [])

  const goToStop = useCallback((index: number) => {
    const clamped = (index + tourOrder.length) % tourOrder.length
    setTourIndex(clamped)
    setFocus({ kind: 'node', id: tourOrder[clamped] })
  }, [])

  const stepTour = useCallback(
    (delta: number) => {
      if (tourIndex !== null) {
        goToStop(tourIndex + delta)
        return
      }
      // Free exploration: arrows still walk the recommended order.
      const currentId = focus.kind === 'node' ? focus.id : null
      const currentIndex = currentId ? tourOrder.indexOf(currentId) : -1
      goToStop(currentIndex === -1 ? (delta > 0 ? 0 : tourOrder.length - 1) : currentIndex + delta)
    },
    [focus, goToStop, tourIndex],
  )

  const toggleTour = useCallback(() => {
    if (tourIndex === null) {
      goToStop(0)
    } else {
      setTourIndex(null)
      setFocus({ kind: 'world' })
    }
  }, [goToStop, tourIndex])

  const homeFocused = focus.kind === 'node' && focus.id === 'home'

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '?') {
        setShowHelp((v) => !v)
        return
      }

      if (showHelp && event.key === 'Escape') {
        setShowHelp(false)
        return
      }

      // While zoomed into the IDE, HomeIde owns the keyboard.
      if (homeFocused) return

      if (event.key === 'Escape') {
        zoomOut()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        stepTour(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        stepTour(-1)
        return
      }
      if (event.key === 'g' || event.key === 'G') {
        toggleTour()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [homeFocused, showHelp, stepTour, toggleTour, zoomOut])

  // Scroll down = zoom out one level, throttled so a fling exits one step.
  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.deltaY < 40) return
      const now = performance.now()
      if (now - wheelAt.current < 600) return
      wheelAt.current = now
      zoomOut()
    },
    [zoomOut],
  )

  const rect = rectFor(focus)
  const pad = focus.kind === 'world' ? 1.03 : focus.kind === 'continent' ? 1.08 : 1.1
  const scale = Math.min(viewport.w / (rect.w * pad), viewport.h / (rect.h * pad))
  const tx = viewport.w / 2 - scale * (rect.x + rect.w / 2)
  const ty = viewport.h / 2 - scale * (rect.y + rect.h / 2)

  const crumbs = useMemo(() => buildCrumbs(focus), [focus])
  const tourStopTitle =
    tourIndex !== null
      ? tourOrder[tourIndex] === 'home'
        ? 'Home — the live IDE'
        : nodeById.get(tourOrder[tourIndex])?.title ?? ''
      : ''

  return (
    <div className="world" onWheel={onWheel}>
      <motion.div
        className="world-layer"
        style={{ width: WORLD.w, height: WORLD.h, transformOrigin: '0 0' }}
        initial={false}
        animate={{ x: tx, y: ty, scale }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'tween', duration: 0.68, ease: [0.24, 0.7, 0.25, 1] }
        }
        onClick={() => {
          if (focus.kind !== 'world') zoomOut()
        }}
      >
        <div className="world-title" aria-hidden="true">
          <h1>Cursor · Agent OS Map</h1>
          <p>One student project — CampusEvents — through every advanced capability</p>
        </div>

        {continents.map((continent) => (
          <ContinentZone
            key={continent.id}
            continent={continent}
            focused={focus.kind === 'continent' && focus.id === continent.id}
            onSelect={() => setFocus({ kind: 'continent', id: continent.id })}
          />
        ))}

        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            focused={focus.kind === 'node' && focus.id === node.id}
            reduceMotion={reduceMotion}
            onSelect={() => focusNode(node.id)}
          />
        ))}

        <div
          className={`world-home${homeFocused ? ' is-focused' : ''}`}
          style={{
            left: HOME_RECT.x,
            top: HOME_RECT.y,
            width: HOME_RECT.w,
            height: HOME_RECT.h,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="world-home__stage" inert={!homeFocused}>
            <HomeIde
              focused={homeFocused}
              reduceMotion={reduceMotion}
              initialFeature={initialIdeFeature}
              onExit={zoomOut}
              onRestart={onRestart}
            />
          </div>

          {!homeFocused && (
            <button
              type="button"
              className="world-home__enter"
              onClick={() => focusNode('home')}
              aria-label="Enter the live IDE demo"
            >
              <span className="world-home__chip">Home · the live IDE — click to enter</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ——— Screen-space HUD ——— */}
      <nav className="world-crumbs" aria-label="Map location">
        {crumbs.map((crumb, i) => (
          <span key={crumb.label} className="world-crumbs__item">
            {i > 0 && <span className="world-crumbs__sep">›</span>}
            {i < crumbs.length - 1 ? (
              <button type="button" onClick={() => setFocus(crumb.focus)}>
                {crumb.label}
              </button>
            ) : (
              <strong>{crumb.label}</strong>
            )}
          </span>
        ))}
      </nav>

      <div className="world-tourbar">
        {tourIndex === null ? (
          <>
            <button type="button" className="world-tourbar__start" onClick={toggleTour}>
              ▶ Guided tour
            </button>
            <span className="world-tourbar__hint">G tour · ← → stops · Esc out · ? keys</span>
          </>
        ) : (
          <>
            <button type="button" onClick={() => stepTour(-1)} aria-label="Previous stop">
              ←
            </button>
            <span className="world-tourbar__stop">
              {tourIndex + 1}/{tourOrder.length} · {tourStopTitle}
            </span>
            <button type="button" onClick={() => stepTour(1)} aria-label="Next stop">
              →
            </button>
            <button type="button" className="world-tourbar__end" onClick={toggleTour}>
              End
            </button>
          </>
        )}
      </div>

      <Minimap focus={focus} camera={{ tx, ty, scale }} viewport={viewport} onSelect={setFocus} />

      <div className="world-stamp" aria-hidden="true">
        Docs refreshed Aug 2026 · cursor.com/docs
      </div>

      {showHelp && <ShortcutOverlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function buildCrumbs(focus: WorldFocus): { label: string; focus: WorldFocus }[] {
  const root = { label: 'Agent OS', focus: { kind: 'world' } as WorldFocus }
  if (focus.kind === 'world') return [root]

  if (focus.kind === 'continent') {
    return [root, { label: continentById.get(focus.id)!.name, focus }]
  }

  if (focus.id === 'home') return [root, { label: 'Home IDE', focus }]

  const node = nodeById.get(focus.id)!
  if (!node.continent) return [root, { label: node.title, focus }]

  return [
    root,
    {
      label: continentById.get(node.continent)!.name,
      focus: { kind: 'continent', id: node.continent },
    },
    { label: node.title, focus },
  ]
}

function ContinentZone({
  continent,
  focused,
  onSelect,
}: {
  continent: Continent
  focused: boolean
  onSelect: () => void
}) {
  const { zone } = continent
  return (
    <div
      className={`world-zone${focused ? ' is-focused' : ''}`}
      style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      <div className="world-zone__label" aria-hidden="true">
        <span className="world-zone__name">{continent.name}</span>
        <span className="world-zone__sub">{continent.sub}</span>
      </div>
    </div>
  )
}

function NodeCard({
  node,
  focused,
  reduceMotion,
  onSelect,
}: {
  node: WorldNode
  focused: boolean
  reduceMotion: boolean
  onSelect: () => void
}) {
  return (
    <article
      className={`world-node${focused ? ' is-focused' : ''}`}
      style={{ left: node.rect.x, top: node.rect.y, width: node.rect.w, height: node.rect.h }}
      onClick={(event) => {
        event.stopPropagation()
        if (!focused) onSelect()
      }}
    >
      {node.gem && <span className="world-node__gem">{node.gem}</span>}

      {!focused && (
        <div className="world-node__far" aria-hidden="true">
          <h3>{node.title}</h3>
          <p>{node.kicker}</p>
        </div>
      )}

      {focused && (
        <div className="world-node__near">
          <header>
            <span className="world-node__kicker">{node.kicker}</span>
            <h3>{node.title}</h3>
            <p className="world-node__headline">{node.headline}</p>
          </header>

          <div className="world-node__body">
            <div className="world-node__info">
              <ul>
                {node.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {node.failureMode && (
                <p className="world-node__fail">
                  <strong>Failure mode</strong> {node.failureMode}
                </p>
              )}
              {node.tryIt && (
                <p className="world-node__try">
                  <strong>Try</strong> <code>{node.tryIt}</code>
                </p>
              )}
            </div>

            <div className="world-node__demo">
              <Vignette spec={node.vignette} active={focused} reduceMotion={reduceMotion} />
            </div>
          </div>

          <footer>
            {node.cite.map((c) => (
              <a key={c.url} href={c.url} target="_blank" rel="noreferrer">
                {c.label} ↗
              </a>
            ))}
          </footer>
        </div>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ */

const MINIMAP_W = 210

function Minimap({
  focus,
  camera,
  viewport,
  onSelect,
}: {
  focus: WorldFocus
  camera: { tx: number; ty: number; scale: number }
  viewport: { w: number; h: number }
  onSelect: (focus: WorldFocus) => void
}) {
  const k = MINIMAP_W / WORLD.w
  const view = {
    x: (-camera.tx / camera.scale) * k,
    y: (-camera.ty / camera.scale) * k,
    w: (viewport.w / camera.scale) * k,
    h: (viewport.h / camera.scale) * k,
  }

  return (
    <div
      className="world-minimap"
      style={{ width: MINIMAP_W, height: WORLD.h * k }}
      role="button"
      tabIndex={0}
      aria-label="Minimap — click a region to jump there"
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const wx = (event.clientX - bounds.left) / k
        const wy = (event.clientY - bounds.top) / k

        const hitContinent = continents.find(
          (c) =>
            wx >= c.zone.x && wx <= c.zone.x + c.zone.w && wy >= c.zone.y && wy <= c.zone.y + c.zone.h,
        )
        if (hitContinent) {
          onSelect({ kind: 'continent', id: hitContinent.id })
          return
        }
        if (
          wx >= HOME_RECT.x &&
          wx <= HOME_RECT.x + HOME_RECT.w &&
          wy >= HOME_RECT.y &&
          wy <= HOME_RECT.y + HOME_RECT.h
        ) {
          onSelect({ kind: 'node', id: 'home' })
          return
        }
        onSelect({ kind: 'world' })
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect({ kind: 'world' })
      }}
    >
      {continents.map((c) => (
        <span
          key={c.id}
          className={`world-minimap__zone${
            focus.kind === 'continent' && focus.id === c.id ? ' is-active' : ''
          }`}
          style={{ left: c.zone.x * k, top: c.zone.y * k, width: c.zone.w * k, height: c.zone.h * k }}
        />
      ))}
      <span
        className="world-minimap__home"
        style={{
          left: HOME_RECT.x * k,
          top: HOME_RECT.y * k,
          width: HOME_RECT.w * k,
          height: HOME_RECT.h * k,
        }}
      />
      <span
        className="world-minimap__view"
        style={{ left: view.x, top: view.y, width: view.w, height: view.h }}
      />
    </div>
  )
}

function ShortcutOverlay({ onClose }: { onClose: () => void }) {
  const shortcuts: [string, string][] = [
    ['G', 'Start / end the guided tour'],
    ['← →', 'Previous / next tour stop'],
    ['Esc', 'Zoom out one level (twice → map)'],
    ['Scroll down', 'Zoom out'],
    ['1–8', 'Jump to an IDE hotspot (inside the home IDE)'],
    ['?', 'Toggle this overlay'],
  ]

  return (
    <div className="world-help" role="dialog" aria-label="Keyboard shortcuts" onClick={onClose}>
      <div className="world-help__card" onClick={(event) => event.stopPropagation()}>
        <h2>Presenter shortcuts</h2>
        <dl>
          {shortcuts.map(([key, what]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
