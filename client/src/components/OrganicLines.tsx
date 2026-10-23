import { motion, useReducedMotion } from 'framer-motion';

/**
 * Soft organic line art in the background of the hero — long, slowly drifting
 * curves instead of sharp technical dashes. Deliberately low-contrast so it
 * reads as texture, never as content.
 */
export function OrganicLines() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Iridescent halo behind the headline */}
      <div
        className="absolute -top-[34%] left-[2%] h-[72vmin] w-[72vmin] rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background:
            'conic-gradient(from 120deg at 50% 50%, var(--accent-a), var(--accent-b), var(--accent-c), transparent 78%)',
        }}
      />
      <div
        className="absolute right-[-12%] top-[18%] h-[46vmin] w-[46vmin] rounded-full opacity-[0.1] blur-[110px]"
        style={{ background: 'linear-gradient(140deg, var(--accent-b), var(--accent-c))' }}
      />

      <motion.svg
        viewBox="0 0 1200 820"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full text-fg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <motion.g
          animate={reduce ? undefined : { x: [0, 14, -8, 0], y: [0, -10, 6, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <path d="M-80 600C150 470 300 690 520 600S800 380 1010 470s210 40 300-20" opacity="0.1" />
          <path d="M-60 640C180 520 320 730 540 640S810 430 1020 520s200 40 290-24" opacity="0.05" />
          <path d="M640-60c120 90 40 190 160 240s180 10 210 120-40 190 60 240" opacity="0.08" />
          <path d="M980 250c60 0 96 40 96 92s-42 92-96 92-96-40-96-92 42-92 96-92Z" opacity="0.07" />
          <path d="M120 190c46 0 74 30 74 70s-32 70-74 70-74-30-74-70 28-70 74-70Z" opacity="0.05" />
        </motion.g>
      </motion.svg>

      {/* Fade the texture out at the edges so nothing feels clipped */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 30%, color-mix(in oklab, var(--bg) 92%, transparent) 100%)',
        }}
      />
    </div>
  );
}
