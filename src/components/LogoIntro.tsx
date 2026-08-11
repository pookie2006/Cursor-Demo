import { motion } from 'framer-motion'
import { CursorLogo } from './CursorLogo'

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
      <div className="logo-intro__atmosphere" />

      <motion.div
        className="logo-intro__stage"
        animate={{ scale: zooming ? 60 : 1 }}
        transition={{ duration: 1.4, ease: [0.7, 0, 0.3, 1] }}
        onAnimationComplete={() => {
          if (zooming) onZoomComplete()
        }}
      >
        <div className="logo-intro__logo-wrap">
          <CursorLogo className="logo-intro__logo" />
        </div>
      </motion.div>

      <motion.div
        className="logo-intro__brand"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: zooming ? 0 : 1, y: zooming ? -8 : 0 }}
        transition={{ delay: zooming ? 0 : 0.35, duration: 0.55 }}
      >
        <span className="logo-intro__wordmark">Cursor</span>
      </motion.div>

      <motion.div
        className="logo-intro__whiteout"
        initial={{ opacity: 0 }}
        animate={{ opacity: zooming ? 1 : 0 }}
        transition={{ duration: 0.5, delay: zooming ? 0.85 : 0, ease: 'easeInOut' }}
      />

      {!zooming && (
        <motion.div
          className="logo-intro__hint"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className="logo-intro__tagline">
            The agent control plane — not autocomplete. Click to build Lion Events for Columbia
            clubs.
          </p>
          <p className="logo-intro__identity">Columbia University in the City of New York</p>
        </motion.div>
      )}
    </motion.button>
  )
}
