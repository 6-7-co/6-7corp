import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/** Button that is magnetically pulled toward the cursor. */
export function MagneticButton({
  children,
  href,
  onClick,
  className = '',
  strength = 0.4,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const motionProps = {
    href,
    onClick,
    onMouseMove,
    onMouseLeave: reset,
    ref,
    style: { x: sx, y: sy },
    className: `group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-black ${className}`,
  };

  return (
    <motion.a {...motionProps}>
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
