import { motion } from 'framer-motion'

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
        animate={{ scale: zooming ? 110 : 1 }}
        transition={{ duration: 1.45, ease: [0.72, 0, 0.28, 1] }}
        onAnimationComplete={() => {
          if (zooming) onZoomComplete()
        }}
      >
        <div className="logo-intro__logo-wrap">
          <img
            className="logo-intro__logo"
            src={`${import.meta.env.BASE_URL}cursor-mark.png`}
            alt=""
            draggable={false}
          />
        </div>
      </motion.div>

      <motion.div
        className="logo-intro__whiteout"
        initial={{ opacity: 0 }}
        animate={{ opacity: zooming ? 1 : 0 }}
        transition={{ duration: 0.45, delay: zooming ? 0.95 : 0, ease: 'easeInOut' }}
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
