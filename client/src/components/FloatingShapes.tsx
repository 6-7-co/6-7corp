import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * Big wireframe geometric forms that float and parallax across the hero.
 * Pure SVG strokes — no images, no dependencies. Coloured via currentColor
 * so they follow the active theme.
 */
export function FloatingShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden text-fg"
      aria-hidden="true"
    >
      {/* Giant orbiting ring */}
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute right-[6%] top-[8%] h-[46vmin] w-[46vmin] opacity-50"
      >
        <Ring className="animate-spin-slow h-full w-full" />
      </motion.div>

      {/* Floating icosahedron */}
      <motion.div
        style={{ y: y2 }}
        className="absolute left-[4%] bottom-[6%] h-[34vmin] w-[34vmin] opacity-60"
      >
        <Icosahedron className="h-full w-full" />
      </motion.div>

      {/* Small drifting cube */}
      <motion.div
        animate={{ y: [0, -22, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[46%] top-[20%] h-[10vmin] w-[10vmin] opacity-50"
      >
        <Cube className="h-full w-full" />
      </motion.div>

      {/* Pulsing dot cluster */}
      <motion.div
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[18%] bottom-[14%] h-[8vmin] w-[8vmin]"
      >
        <DotGrid className="h-full w-full" />
      </motion.div>
    </div>
  );
}

function Ring({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="2" r="4" fill="currentColor" />
      <circle cx="100" cy="100" r="3" fill="currentColor" />
    </svg>
  );
}

function Icosahedron({ className }: { className?: string }) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const v = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const edges: [number, number][] = [
    [0,1],[1,7],[7,2],[2,8],[8,6],[6,11],[11,4],[4,9],[9,5],[5,0],
    [3,7],[7,6],[6,10],[10,3],[3,8],[8,4],[4,10],[10,5],[5,9],[9,1],
    [0,11],[1,5],[2,10],[3,4],[7,10],[8,9],[6,11],
  ];
  const p = 70;
  const project = (x: number, y: number, z: number) => {
    const scale = p / (p + z);
    return [100 + x * scale, 100 + y * scale];
  };
  const pts = v.map((a) => project(a[0], a[1], a[2]));
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 100px' }}
      >
        {edges.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="currentColor" strokeWidth="1" opacity="0.65" />
        ))}
        {pts.map((pt, i) => (
          <circle key={i} cx={pt[0]} cy={pt[1]} r="2" fill="currentColor" />
        ))}
      </motion.g>
    </svg>
  );
}

function Cube({ className }: { className?: string }) {
  const s = 50;
  const pts = [[100 - s, 100 - s], [100 + s, 100 - s], [100 + s, 100 + s], [100 - s, 100 + s]];
  const top = pts.map(([x, y]) => [x, y - s * 0.7]);
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {[[0,1],[1,2],[2,3],[3,0]].map(([a,b],i)=>(
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      ))}
      {top.map((p, i) => (
        <line key={`t${i}`} x1={pts[i][0]} y1={pts[i][1]} x2={top[i][0]} y2={top[i][1]} stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      ))}
      {[[0,1],[1,2],[2,3],[3,0]].map(([a,b],i)=>(
        <line key={`u${i}`} x1={top[a][0]} y1={top[a][1]} x2={top[b][0]} y2={top[b][1]} stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      ))}
    </svg>
  );
}

function DotGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={20 + i * 15} cy={20 + j * 15} r="2" fill="currentColor" opacity="0.7" />
        )),
      )}
    </svg>
  );
}
