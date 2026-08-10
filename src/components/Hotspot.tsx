export type HotspotPlacement = 'right' | 'left' | 'top' | 'bottom'

type HotspotProps = {
  id: string
  label: string
  active: boolean
  visited: boolean
  /** Plays a one-time attention pulse while the tour is still undiscovered. */
  scanning?: boolean
  placement?: HotspotPlacement
  onSelect: (id: string) => void
}

export function Hotspot({
  id,
  label,
  active,
  visited,
  scanning = false,
  placement = 'right',
  onSelect,
}: HotspotProps) {
  const classes = [
    'hotspot',
    `hotspot--${placement}`,
    active && 'hotspot--active',
    visited && 'hotspot--visited',
    scanning && 'hotspot--scanning',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      data-feature={id}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      aria-label={`Learn about ${label}`}
      aria-pressed={active}
    >
      <span className="hotspot__dot" aria-hidden="true" />
      <span className="hotspot__label" aria-hidden="true">
        {label}
      </span>
    </button>
  )
}
