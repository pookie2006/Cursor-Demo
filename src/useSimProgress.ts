import { useEffect, useState } from 'react'

/**
 * Drives a 0→1 progress value for the in-IDE feature simulations. Playing once
 * and holding the final frame keeps the end state readable during a live demo.
 * When `skip` is set the simulation jumps straight to its finished state.
 */
export function useSimProgress(key: string | null, duration: number, skip: boolean): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (key === null) {
      setProgress(0)
      return
    }

    if (skip || duration <= 0) {
      setProgress(1)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / duration)
      setProgress(elapsed)
      if (elapsed < 1) frame = requestAnimationFrame(tick)
    }

    setProgress(0)
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [key, duration, skip])

  return progress
}
