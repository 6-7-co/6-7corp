import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/** Card with a subtle 3D tilt that follows the cursor. */
export function TiltCard({
  children,
  className = '',
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const gx = useTransform(ry, [-intensity, intensity], ['-12%', '12%']);
  const gy = useTransform(rx, [-intensity, intensity], ['12%', '-12%']);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * intensity * 2);
    rx.set(-py * intensity * 2);
  }

  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={`group card-hover relative h-full transform-style-preserve-3d rounded-2xl border border-white/10 bg-ink-900/60 p-6 backdrop-blur-sm ${className}`}
    >
      <motion.div style={{ x: gx, y: gy }} className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 [mask-image:radial-gradient(circle_at_var(--gx,50%),var(--gy,50%),black,transparent_70%)]" />
      {children}
    </motion.div>
  );
}
