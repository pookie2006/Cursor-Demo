import { useState } from 'react'

import {
  actTitle,
  crashMission,
  stops,
  tracks,
  type PathId,
  type TourStop,
} from '../tour'

interface TourListProps {
  walk: TourStop[]
  path: PathId
  visited: Set<string>
  ran: Set<string>
  onSwitchPath: (path: PathId) => void
  onVisit: (id: string) => void
  onToggleRan: (id: string) => void
}

/**
 * Small-screen fallback: below ~900px the scaled 1440×900 IDE is unreadable,
 * so the tour becomes a grouped, expandable list of the same stops.
 */
export function TourList({
  walk,
  path,
  visited,
  ran,
  onSwitchPath,
  onVisit,
  onToggleRan,
}: TourListProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const pathVisited = walk.filter((stop) => visited.has(stop.id)).length

  const chips: { id: PathId; label: string }[] = [
    { id: 'crash', label: 'Crash course · 8' },
    ...tracks.map((track) => ({ id: track.id as PathId, label: track.label })),
    { id: 'all', label: `All · ${stops.length}` },
  ]

  let lastAct = 0

  return (
    <div className="tour-list">
      <header className="tour-list__head">
        <h1>Cursor — the agent control plane</h1>
        <p>
          The full demo needs a wider screen, but every stop is here. Lion Events · Columbia
          University in the City of New York.
        </p>
        <div className="tour-list__chips">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={path === chip.id ? 'is-active' : undefined}
              aria-pressed={path === chip.id}
              onClick={() => onSwitchPath(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {path === 'crash' && <p className="tour-list__mission">{crashMission}</p>}
        <p className="tour-list__progress">
          {pathVisited}/{walk.length} explored
        </p>
      </header>

      <ol className="tour-list__stops">
        {walk.map((stop) => {
          const showAct = stop.act !== lastAct
          lastAct = stop.act
          const open = openId === stop.id

          return (
            <li key={stop.id}>
              {showAct && (
                <div className="tour-list__act">
                  Act {stop.act} · {actTitle(stop.act)}
                </div>
              )}
              <button
                type="button"
                className={`tour-list__row${visited.has(stop.id) ? ' is-visited' : ''}${
                  open ? ' is-open' : ''
                }`}
                aria-expanded={open}
                onClick={() => {
                  setOpenId(open ? null : stop.id)
                  if (!open) onVisit(stop.id)
                }}
              >
                <span className="tour-list__title">{stop.title}</span>
                <span className="tour-list__kicker">{stop.kicker}</span>
              </button>

              {open && (
                <div className="tour-list__detail">
                  <p className="tour-list__headline">{stop.headline}</p>
                  <ul>
                    {stop.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  {stop.failureMode && (
                    <p className="tour-list__fail">
                      <strong>Failure mode</strong> {stop.failureMode}
                    </p>
                  )}
                  {stop.tryIt && (
                    <div className="tour-list__try">
                      <code>{stop.tryIt}</code>
                      <div className="tour-list__try-actions">
                        <button
                          type="button"
                          onClick={() => void navigator.clipboard?.writeText(stop.tryIt!)}
                        >
                          Copy · paste into Cursor
                        </button>
                        <button
                          type="button"
                          className={ran.has(stop.id) ? 'is-done' : undefined}
                          aria-pressed={ran.has(stop.id)}
                          onClick={() => onToggleRan(stop.id)}
                        >
                          {ran.has(stop.id) ? '✓ Ran it' : 'I ran this'}
                        </button>
                      </div>
                    </div>
                  )}
                  <a href={stop.cite.url} target="_blank" rel="noreferrer">
                    {stop.cite.label} ↗
                  </a>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
