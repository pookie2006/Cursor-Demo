import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { IdeLayout } from './IdeLayout'
import { CompletionCard } from './CompletionCard'
import { TourList } from './TourList'
import {
  JUMP_KEYS,
  actTitle,
  isPathId,
  isStopId,
  pathStops,
  stopById,
  stops,
  tracks,
  type PathId,
  type TourStop,
} from '../tour'

const VISITED_KEY = 'cursor-tour-visited'
const PATH_KEY = 'lion-tour-path'
const RAN_KEY = 'lion-tour-ran'

/** Dev-server reloads and deep links must not lose already-spawned dots. */
function loadVisited(initialStopId: string | null): Set<string> {
  const set = new Set<string>()
  if (typeof window !== 'undefined') {
    try {
      const saved: unknown = JSON.parse(window.sessionStorage.getItem(VISITED_KEY) ?? '[]')
      if (Array.isArray(saved)) for (const id of saved) if (isStopId(id)) set.add(id)
    } catch {
      /* corrupt storage — start fresh */
    }
  }
  if (initialStopId) set.add(initialStopId)
  return set
}

function loadPath(initialStopId: string | null): PathId {
  if (typeof window !== 'undefined') {
    const saved = window.sessionStorage.getItem(PATH_KEY)
    if (saved && isPathId(saved)) {
      // A deep link outside the saved path widens the view instead of hiding the stop.
      if (initialStopId && !pathStops(saved).some((stop) => stop.id === initialStopId)) return 'all'
      return saved
    }
  }
  if (initialStopId && !pathStops('crash').some((stop) => stop.id === initialStopId)) return 'all'
  return 'crash'
}

/** Try prompts the student marked as actually run — survives sessions. */
function loadRan(): Set<string> {
  const set = new Set<string>()
  if (typeof window !== 'undefined') {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(RAN_KEY) ?? '[]')
      if (Array.isArray(saved)) for (const id of saved) if (isStopId(id)) set.add(id)
    } catch {
      /* corrupt storage — start fresh */
    }
  }
  return set
}

const IDE_W = 1440
const IDE_H = 900
const PANEL_W = 380
const MAX_ZOOM = 2.2
const NARROW_W = 900

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface IdeWorldProps {
  initialStopId: string | null
  reduceMotion: boolean
  onRestart: () => void
}

/**
 * The single-screen Prezi experience: one mock IDE, a camera that zooms into
 * whichever region the active tour stop lives in, and a docked side panel
 * describing the feature while it demos itself in place.
 */
export function IdeWorld({ initialStopId, reduceMotion, onRestart }: IdeWorldProps) {
  const [activeId, setActiveId] = useState<string | null>(initialStopId)
  const [visited, setVisited] = useState<Set<string>>(() => loadVisited(initialStopId))
  const [path, setPath] = useState<PathId>(() => loadPath(initialStopId))
  const [ran, setRan] = useState<Set<string>>(loadRan)
  const [showHelp, setShowHelp] = useState(false)
  const [completionDismissed, setCompletionDismissed] = useState(false)
  const [anchor, setAnchor] = useState<Rect | null>(null)
  const [nextDotRect, setNextDotRect] = useState<Rect | null>(null)
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1440 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }))
  const frameRef = useRef<HTMLDivElement>(null)
  const wheelAt = useRef(0)

  const narrow = viewport.w < NARROW_W

  const walk = pathStops(path)
  const activeStop: TourStop | null = activeId ? (stopById.get(activeId) ?? null) : null
  const index = activeId ? walk.findIndex((stop) => stop.id === activeId) : -1

  // Dots spawn in path order: the first unvisited stop is the flashing call to action.
  const nextStop = walk.find((stop) => !visited.has(stop.id)) ?? null

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  }, [visited])

  useEffect(() => {
    window.sessionStorage.setItem(PATH_KEY, path)
  }, [path])

  useEffect(() => {
    window.localStorage.setItem(RAN_KEY, JSON.stringify([...ran]))
  }, [ran])

  // Shareable deep links: #/skills, #/worktrees, …
  useEffect(() => {
    const base = window.location.pathname + window.location.search
    window.history.replaceState(null, '', activeId ? `${base}#/${activeId}` : base)
  }, [activeId])

  const select = useCallback(
    (id: string) => {
      setActiveId(id)
      // Selecting a stop outside the current path widens the view to All.
      setPath((current) =>
        pathStops(current).some((stop) => stop.id === id) ? current : 'all',
      )
      setVisited((current) => {
        if (current.has(id)) return current
        const next = new Set(current)
        next.add(id)
        return next
      })
    },
    [],
  )

  const toggleRan = useCallback((id: string) => {
    setRan((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const zoomOut = useCallback(() => setActiveId(null), [])

  const step = useCallback(
    (delta: number) => {
      const current = activeId ? walk.findIndex((stop) => stop.id === activeId) : -1
      const next =
        current === -1
          ? delta > 0
            ? 0
            : walk.length - 1
          : (current + delta + walk.length) % walk.length
      select(walk[next].id)
    },
    [activeId, select, walk],
  )

  const pathVisited = walk.filter((stop) => visited.has(stop.id)).length
  const tourComplete = pathVisited === walk.length
  const showCompletion = tourComplete && !activeId && !completionDismissed

  const switchPath = useCallback((next: PathId) => {
    setPath(next)
    setCompletionDismissed(false)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '?') {
        setShowHelp((value) => !value)
        return
      }

      if (event.key === 'Escape') {
        if (showHelp) setShowHelp(false)
        else if (showCompletion) setCompletionDismissed(true)
        else zoomOut()
        return
      }

      if (showHelp || showCompletion) return
      // Don't hijack keys while the user types in a real control (list fallback).
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

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
      if (event.key === 'g' || event.key === 'G') {
        if (activeId) zoomOut()
        else select(walk[0].id)
        return
      }

      // Jump keys cover every stop in the current path: 1–9, 0, then letters.
      const jump = JUMP_KEYS.indexOf(event.key.toLowerCase())
      if (jump >= 0 && jump < walk.length) {
        event.preventDefault()
        select(walk[jump].id)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId, select, showCompletion, showHelp, step, walk, zoomOut])

  // Measure the active stop's region in untransformed IDE coordinates.
  useLayoutEffect(() => {
    if (!activeStop || !frameRef.current) {
      setAnchor(null)
      return
    }

    const frame = frameRef.current
    const el = frame.querySelector(`[data-region="${activeStop.region}"]`)
    if (!el) {
      setAnchor(null)
      return
    }

    const frameRect = frame.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const scaleNow = frameRect.width / IDE_W

    setAnchor({
      x: (elRect.left - frameRect.left) / scaleNow,
      y: (elRect.top - frameRect.top) / scaleNow,
      w: elRect.width / scaleNow,
      h: elRect.height / scaleNow,
    })
  }, [activeStop, viewport])

  // Measure the flashing next dot in untransformed IDE coordinates so we can
  // tell whether the current camera framing actually shows it.
  useLayoutEffect(() => {
    if (!frameRef.current || !activeStop || !nextStop) {
      setNextDotRect(null)
      return
    }

    const frame = frameRef.current
    const el = frame.querySelector(`[data-feature="${nextStop.id}"]`)
    if (!el) {
      setNextDotRect(null)
      return
    }

    const frameRect = frame.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const scaleNow = frameRect.width / IDE_W

    setNextDotRect({
      x: (elRect.left - frameRect.left) / scaleNow,
      y: (elRect.top - frameRect.top) / scaleNow,
      w: elRect.width / scaleNow,
      h: elRect.height / scaleNow,
    })
  }, [activeStop, nextStop, viewport])

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

  // Below ~900px the scaled 1440×900 IDE is unusable — swap to a stop list.
  if (narrow) {
    return (
      <TourList
        walk={walk}
        path={path}
        visited={visited}
        ran={ran}
        onSwitchPath={switchPath}
        onVisit={(id) =>
          setVisited((current) => {
            if (current.has(id)) return current
            const next = new Set(current)
            next.add(id)
            return next
          })
        }
        onToggleRan={toggleRan}
      />
    )
  }

  // ——— Camera ———
  // Reserve headroom for the fixed path chips so they sit above the IDE chrome.
  const overviewScale = Math.min(viewport.w / (IDE_W + 90), (viewport.h - 130) / IDE_H)
  const panelSide: 'left' | 'right' =
    activeStop && anchor ? (anchor.x + anchor.w / 2 >= IDE_W / 2 ? 'left' : 'right') : 'right'

  let scale = overviewScale
  let tx = (viewport.w - IDE_W * overviewScale) / 2
  let ty = (viewport.h - 56 - IDE_H * overviewScale) / 2 + 28

  if (activeStop && anchor) {
    const areaX = panelSide === 'left' ? PANEL_W + 44 : 28
    const areaW = viewport.w - PANEL_W - 72
    const areaY = 28
    const areaH = viewport.h - 116

    const pad = 1.16
    scale = Math.min(areaW / (anchor.w * pad), areaH / (anchor.h * pad))
    scale = Math.max(Math.min(scale, MAX_ZOOM), overviewScale)
    tx = areaX + areaW / 2 - scale * (anchor.x + anchor.w / 2)
    ty = areaY + areaH / 2 - scale * (anchor.y + anchor.h / 2)

    // Keep the frame flush with the screen edges when it overflows them, so
    // zoomed stops never show dead space around the IDE. The bottom keeps a
    // band clear so the fixed tour bar never covers status-bar dots.
    const bottomReserve = 52
    if (IDE_W * scale >= viewport.w) {
      tx = Math.min(0, Math.max(viewport.w - IDE_W * scale, tx))
    }
    if (IDE_H * scale >= viewport.h - bottomReserve) {
      ty = Math.min(0, Math.max(viewport.h - bottomReserve - IDE_H * scale, ty))
    }
  }

  // Project the next dot through the target camera: it counts as visible only
  // if it lands inside the viewport and outside the band the panel docks over.
  let nextDotOnScreen = true
  if (activeStop && nextStop) {
    if (!nextDotRect) {
      nextDotOnScreen = false
    } else {
      const cx = tx + scale * (nextDotRect.x + nextDotRect.w / 2)
      const cy = ty + scale * (nextDotRect.y + nextDotRect.h / 2)
      const leftEdge = panelSide === 'left' ? PANEL_W + 44 : 16
      const rightEdge = viewport.w - (panelSide === 'right' ? PANEL_W + 44 : 16)
      nextDotOnScreen = cx >= leftEdge && cx <= rightEdge && cy >= 16 && cy <= viewport.h - 76
    }
  }
  // Pulse the way out when the next dot can't be seen — or, once the tour is
  // complete, to guide the presenter back to the overview (Esc does the same).
  const zoomOutPulse = Boolean(activeStop && (nextStop ? !nextDotOnScreen : true))

  return (
    <div
      className="ide-world"
      onWheel={onWheel}
      onClick={(event) => {
        if (event.target === event.currentTarget) zoomOut()
      }}
    >
      <motion.div
        ref={frameRef}
        className="ide-frame"
        style={{ width: IDE_W, height: IDE_H, transformOrigin: '0 0' }}
        initial={false}
        animate={{ x: tx, y: ty, scale }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'tween', duration: 0.7, ease: [0.24, 0.7, 0.25, 1] }
        }
      >
        <IdeLayout
          activeStop={activeStop}
          visited={visited}
          pathIds={new Set(walk.map((stop) => stop.id))}
          pathTotal={walk.length}
          nextId={nextStop?.id ?? null}
          scanning={!activeId && visited.size === 0}
          reduceMotion={reduceMotion}
          onSelectStop={select}
          onRestart={onRestart}
        />
      </motion.div>

      <AnimatePresence>
        {activeStop && (
          <StopPanel
            key={activeStop.id}
            stop={activeStop}
            index={index}
            total={walk.length}
            side={panelSide}
            nextTitle={nextStop && nextStop.id !== activeStop.id ? nextStop.title : null}
            nextDotOnScreen={nextDotOnScreen}
            ranIt={ran.has(activeStop.id)}
            reduceMotion={reduceMotion}
            onToggleRan={() => toggleRan(activeStop.id)}
            onPrev={() => step(-1)}
            onClose={zoomOut}
          />
        )}
      </AnimatePresence>

      {!activeStop && (
        <div className="world-paths">
          <PathChip current={path} id="crash" label="Crash course · 8" onPick={switchPath} />
          {tracks.map((track) => (
            <PathChip
              key={track.id}
              current={path}
              id={track.id}
              label={track.label}
              onPick={switchPath}
            />
          ))}
          <PathChip current={path} id="all" label={`Explore all · ${stops.length}`} onPick={switchPath} />
        </div>
      )}

      <div className="world-tourbar">
        {activeStop ? (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous stop">
              ←
            </button>
            <span className="world-tourbar__stop">
              {index + 1}/{walk.length} · {activeStop.title}
              <em className="world-tourbar__act">
                Act {activeStop.act} · {actTitle(activeStop.act)}
              </em>
            </span>
            <button
              type="button"
              className={`world-tourbar__end${zoomOutPulse ? ' is-pulsing' : ''}`}
              onClick={zoomOut}
            >
              Zoom out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="world-tourbar__start"
              onClick={() => select(walk[0].id)}
            >
              ▶ Guided tour
            </button>
            <span className="world-tourbar__hint">Esc to exit tour</span>
          </>
        )}
      </div>

      <div className="world-stamp" aria-hidden="true">
        Lion Events demo · Columbia University in the City of New York · cursor.com/docs
      </div>

      {showHelp && <ShortcutOverlay onClose={() => setShowHelp(false)} />}

      {showCompletion && (
        <CompletionCard
          path={path}
          ranCount={ran.size}
          reduceMotion={reduceMotion}
          onExploreAll={() => switchPath('all')}
          onReplay={() => {
            setVisited(new Set())
            setCompletionDismissed(false)
            setActiveId(null)
          }}
          onDismiss={() => setCompletionDismissed(true)}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function PathChip({
  current,
  id,
  label,
  onPick,
}: {
  current: PathId
  id: PathId
  label: string
  onPick: (id: PathId) => void
}) {
  return (
    <button
      type="button"
      className={`world-paths__chip${current === id ? ' is-active' : ''}`}
      aria-pressed={current === id}
      onClick={() => onPick(id)}
    >
      {label}
    </button>
  )
}

function StopPanel({
  stop,
  index,
  total,
  side,
  nextTitle,
  nextDotOnScreen,
  ranIt,
  reduceMotion,
  onToggleRan,
  onPrev,
  onClose,
}: {
  stop: TourStop
  index: number
  total: number
  side: 'left' | 'right'
  nextTitle: string | null
  nextDotOnScreen: boolean
  ranIt: boolean
  reduceMotion: boolean
  onToggleRan: () => void
  onPrev: () => void
  onClose: () => void
}) {
  const slide = side === 'right' ? 24 : -24

  return (
    <motion.aside
      className={`stop-panel stop-panel--${side}`}
      role="complementary"
      aria-label={`${stop.title} details`}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: slide }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: slide }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="stop-panel__meta">
        <span className="stop-panel__count">
          {index + 1} / {total} · Act {stop.act}
        </span>
        <span className="stop-panel__sim-badge" title="This demo is a scripted simulation">
          Simulated
        </span>
        {stop.gem && <span className="stop-panel__gem">Power-user gem</span>}
        <button type="button" className="stop-panel__close" onClick={onClose} aria-label="Back to overview">
          ✕
        </button>
      </div>

      <span className="stop-panel__kicker">{stop.kicker}</span>
      <h2>{stop.title}</h2>
      <p className="stop-panel__headline">{stop.headline}</p>

      <ul className="stop-panel__points">
        {stop.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      {stop.failureMode && (
        <p className="stop-panel__fail">
          <strong>Failure mode</strong> {stop.failureMode}
        </p>
      )}

      {stop.tryIt && (
        <TryLine text={stop.tryIt} ranIt={ranIt} onToggleRan={onToggleRan} />
      )}

      <details className="stop-panel__live">
        <summary>Run this live in Cursor</summary>
        <ol>
          <li>
            Install <a href="https://cursor.com" target="_blank" rel="noreferrer">Cursor</a> and
            grab the Lion Events starter (link on the completion card).
          </li>
          <li>Copy the Try prompt above and paste it into Agent chat.</li>
          <li>Watch the same loop run for real — diffs, terminal, verification.</li>
        </ol>
      </details>

      <a className="stop-panel__cite" href={stop.cite.url} target="_blank" rel="noreferrer">
        {stop.cite.label} ↗
      </a>

      <div className="stop-panel__controls">
        <button type="button" onClick={onPrev}>
          ← Prev
        </button>
        {nextTitle ? (
          <span className="stop-panel__next-hint">
            Next: <strong>{nextTitle}</strong> —{' '}
            {nextDotOnScreen ? 'click the flashing dot' : 'zoom out to find the flashing dot'}
          </span>
        ) : (
          <span className="stop-panel__next-hint stop-panel__next-hint--done">
            Path complete — press <kbd>Esc</kbd> for the overview
          </span>
        )}
      </div>
    </motion.aside>
  )
}

function TryLine({
  text,
  ranIt,
  onToggleRan,
}: {
  text: string
  ranIt: boolean
  onToggleRan: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <div className="stop-panel__try">
      <p>
        <strong>Try</strong> <code>{text}</code>
      </p>
      <div className="stop-panel__try-actions">
        <button
          type="button"
          className="stop-panel__copy"
          onClick={() => {
            void navigator.clipboard?.writeText(text)
            setCopied(true)
          }}
        >
          {copied ? 'Copied ✓' : 'Copy · paste into Cursor'}
        </button>
        <button
          type="button"
          className={`stop-panel__ran${ranIt ? ' is-done' : ''}`}
          aria-pressed={ranIt}
          onClick={onToggleRan}
        >
          {ranIt ? '✓ Ran it in Cursor' : 'I ran this in Cursor'}
        </button>
      </div>
    </div>
  )
}

function ShortcutOverlay({ onClose }: { onClose: () => void }) {
  const shortcuts: [string, string][] = [
    ['G', 'Start the tour / back to overview'],
    ['← →', 'Previous / next stop'],
    ['Esc', 'Zoom out to the full IDE'],
    ['Scroll down', 'Zoom out'],
    ['1–9, 0', 'Jump to stops 1–10 of the current path'],
    ['A–F, H–M', 'Jump to stops 11–22 (G is the tour key)'],
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
        <p className="world-help__note">
          Jump keys follow the selected path — crash course, a track, or all {stops.length} stops.
        </p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
