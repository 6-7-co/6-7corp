import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="grid min-h-[90vh] place-items-center px-5">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="display text-[22vw] leading-none sm:text-[14vw]"
        >
          404
        </motion.div>
        <p className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-white/50">
          This page drifted off the grid.
        </p>
        <Link
          to="/"
          className="mt-10 inline-block rounded-full border border-white px-7 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
