import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CursorMark } from './CursorMark'

type LogoIntroProps = {
  onEnter: () => void
  zooming: boolean
  /** Fade the black curtain out to reveal the IDE underneath. */
  exiting: boolean
  reduceMotion: boolean
  onZoomComplete: () => void
  onExitComplete: () => void
}

export function LogoIntro({
  onEnter,
  zooming,
  exiting,
  reduceMotion,
  onZoomComplete,
  onExitComplete,
}: LogoIntroProps) {
  const zoomFired = useRef(false)
  const exitFired = useRef(false)

  useEffect(() => {
    if (!zooming) zoomFired.current = false
  }, [zooming])

  useEffect(() => {
    if (!exiting) exitFired.current = false
  }, [exiting])

  return (
    <motion.button
      type="button"
      className="logo-intro"
      onClick={onEnter}
      aria-label="Enter Cursor demo"
      aria-hidden={exiting}
      tabIndex={exiting ? -1 : 0}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={
        exiting
          ? { duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.8 }
      }
      onAnimationComplete={() => {
        if (exiting && !exitFired.current) {
          exitFired.current = true
          onExitComplete()
        }
      }}
      style={{ pointerEvents: exiting ? 'none' : undefined }}
    >
      <motion.div
        className="logo-intro__stage"
        animate={{
          scale: zooming || exiting ? 140 : 1,
          opacity: exiting ? 0 : 1,
        }}
        transition={{
          scale: { duration: reduceMotion ? 0 : 1.5, ease: [0.75, 0, 0.25, 1] },
          opacity: { duration: 0.15 },
        }}
        onAnimationComplete={() => {
          if (zooming && !exiting && !zoomFired.current) {
            zoomFired.current = true
            onZoomComplete()
          }
        }}
      >
        <div className="logo-intro__logo-wrap">
          <CursorMark className="logo-intro__logo" />
        </div>
      </motion.div>

      {/* Solid black after the dive; the button opacity fade is what reveals the IDE. */}
      <motion.div
        className="logo-intro__blackout"
        initial={{ opacity: 0 }}
        animate={{ opacity: zooming || exiting ? 1 : 0 }}
        transition={{
          duration: 0.35,
          delay: zooming && !exiting && !reduceMotion ? 1.05 : 0,
          ease: 'easeInOut',
        }}
      />

      {!zooming && !exiting && (
        <motion.p
          className="logo-intro__hint"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Click here
        </motion.p>
      )}
    </motion.button>
  )
}
