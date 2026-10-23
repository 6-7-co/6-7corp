import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin accent progress line fixed to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[70] h-px w-full origin-left"
      aria-hidden="true"
    >
      <div className="h-full w-full" style={{ background: 'var(--grad-accent)' }} />
    </motion.div>
  );
}
