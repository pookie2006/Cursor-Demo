import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { IdeLayout } from './IdeLayout'
import { CompletionCard } from './CompletionCard'
import { stopById, stops, type TourStop } from '../tour'

const IDE_W = 1440
const IDE_H = 900
const PANEL_W = 380
const MAX_ZOOM = 2.2

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
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(initialStopId ? [initialStopId] : []),
  )
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

  const activeStop: TourStop | null = activeId ? (stopById.get(activeId) ?? null) : null
  const index = activeId ? stops.findIndex((stop) => stop.id === activeId) : -1

  // Dots spawn in tour order: the first unvisited stop is the flashing call to action.
  const nextStop = stops.find((stop) => !visited.has(stop.id)) ?? null

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Shareable deep links: #/skills, #/worktrees, …
  useEffect(() => {
    const base = window.location.pathname + window.location.search
    window.history.replaceState(null, '', activeId ? `${base}#/${activeId}` : base)
  }, [activeId])

  const select = useCallback((id: string) => {
    setActiveId(id)
    setVisited((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })
  }, [])

  const zoomOut = useCallback(() => setActiveId(null), [])

  const step = useCallback(
    (delta: number) => {
      const current = activeId ? stops.findIndex((stop) => stop.id === activeId) : -1
      const next =
        current === -1
          ? delta > 0
            ? 0
            : stops.length - 1
          : (current + delta + stops.length) % stops.length
      select(stops[next].id)
    },
    [activeId, select],
  )

  const tourComplete = visited.size === stops.length
  const showCompletion = tourComplete && !activeId && !completionDismissed

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
        else select(stops[0].id)
        return
      }

      const digit = Number.parseInt(event.key, 10)
      if (!Number.isNaN(digit) && digit >= 1 && digit <= Math.min(9, stops.length)) {
        event.preventDefault()
        select(stops[digit - 1].id)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId, select, showCompletion, showHelp, step, zoomOut])

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

  // ——— Camera ———
  const overviewScale = Math.min(viewport.w / (IDE_W + 90), (viewport.h - 90) / IDE_H)
  const panelSide: 'left' | 'right' =
    activeStop && anchor ? (anchor.x + anchor.w / 2 >= IDE_W / 2 ? 'left' : 'right') : 'right'

  let scale = overviewScale
  let tx = (viewport.w - IDE_W * overviewScale) / 2
  let ty = (viewport.h - 56 - IDE_H * overviewScale) / 2 + 8

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
    // zoomed stops never show dead space around the IDE.
    if (IDE_W * scale >= viewport.w) {
      tx = Math.min(0, Math.max(viewport.w - IDE_W * scale, tx))
    }
    if (IDE_H * scale >= viewport.h) {
      ty = Math.min(0, Math.max(viewport.h - IDE_H * scale, ty))
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
  const zoomOutPulse = Boolean(activeStop && nextStop && !nextDotOnScreen)

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
            side={panelSide}
            nextTitle={nextStop && nextStop.id !== activeStop.id ? nextStop.title : null}
            nextDotOnScreen={nextDotOnScreen}
            reduceMotion={reduceMotion}
            onPrev={() => step(-1)}
            onClose={zoomOut}
          />
        )}
      </AnimatePresence>

      <div className="world-tourbar">
        {activeStop ? (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous stop">
              ←
            </button>
            <span className="world-tourbar__stop">
              {index + 1}/{stops.length} · {activeStop.title}
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
              onClick={() => select(stops[0].id)}
            >
              ▶ Guided tour
            </button>
            <span className="world-tourbar__hint">
              G tour · ← → stops · Esc out · 1–9 jump · ? keys
            </span>
          </>
        )}
      </div>

      <div className="world-stamp" aria-hidden="true">
        CampusEvents demo · Docs refreshed Aug 2026 · cursor.com/docs
      </div>

      {showHelp && <ShortcutOverlay onClose={() => setShowHelp(false)} />}

      {showCompletion && (
        <CompletionCard
          reduceMotion={reduceMotion}
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

function StopPanel({
  stop,
  index,
  side,
  nextTitle,
  nextDotOnScreen,
  reduceMotion,
  onPrev,
  onClose,
}: {
  stop: TourStop
  index: number
  side: 'left' | 'right'
  nextTitle: string | null
  nextDotOnScreen: boolean
  reduceMotion: boolean
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
          {index + 1} / {stops.length}
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
        <p className="stop-panel__try">
          <strong>Try</strong> <code>{stop.tryIt}</code>
        </p>
      )}

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
          <span className="stop-panel__next-hint">Tour complete — Esc for the overview</span>
        )}
      </div>
    </motion.aside>
  )
}

function ShortcutOverlay({ onClose }: { onClose: () => void }) {
  const shortcuts: [string, string][] = [
    ['G', 'Start the tour / back to overview'],
    ['← →', 'Previous / next stop'],
    ['Esc', 'Zoom out to the full IDE'],
    ['Scroll down', 'Zoom out'],
    ['1–9', 'Jump to a stop'],
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
