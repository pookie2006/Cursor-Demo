import { motion } from 'framer-motion'
import { CursorMark } from './CursorMark'

type LogoIntroProps = {
  onEnter: () => void
  zooming: boolean
  reduceMotion: boolean
  onZoomComplete: () => void
}

export function LogoIntro({ onEnter, zooming, reduceMotion, onZoomComplete }: LogoIntroProps) {
  return (
    <motion.button
      type="button"
      className="logo-intro"
      onClick={onEnter}
      aria-label="Enter Cursor demo"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="logo-intro__stage"
        animate={{ scale: zooming ? 140 : 1 }}
        transition={{ duration: 1.5, ease: [0.75, 0, 0.25, 1] }}
        onAnimationComplete={() => {
          if (zooming) onZoomComplete()
        }}
      >
        <div className="logo-intro__logo-wrap">
          <CursorMark className="logo-intro__logo" />
        </div>
      </motion.div>

      {/* Dive into the black cursor, then hold black while the demo mounts underneath. */}
      <motion.div
        className="logo-intro__blackout"
        initial={{ opacity: 0 }}
        animate={{ opacity: zooming ? 1 : 0 }}
        transition={{ duration: 0.4, delay: zooming ? 1.05 : 0, ease: 'easeInOut' }}
      />

      {!zooming && (
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
