import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HeroScene } from '../components/HeroScene';
const Hero3D = lazy(() => import('../components/Hero3D').then((m) => ({ default: m.Hero3D })));
import { FloatingShapes } from '../components/FloatingShapes';
import { MagneticButton } from '../components/MagneticButton';
import { Marquee, MarqueeItem } from '../components/Marquee';
import { ScrambleText } from '../components/ScrambleText';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';

function Stat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref} className="border-l border-line pl-4">
      <div className="font-display text-3xl font-bold text-fg sm:text-4xl">
        {n}
        <span className="text-fg/50">{suffix}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
    </div>
  );
}

export function Hero() {
  const { t } = useI18n();
  const { fg, bg, muted } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background layers */}
      <HeroScene color={fg} />
      <Suspense fallback={null}>
        <Hero3D
          fg={fg}
          bg={bg}
          muted={muted}
          cameraZ={isDesktop ? 6 : 8.5}
          className="right-0 top-0 h-full w-full lg:w-[52%]"
        />
      </Suspense>
      <div className="bg-grid absolute inset-0 opacity-60" />
      <FloatingShapes />

      {/* Watermark */}
      <div className="watermark pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 select-none text-[34vw] leading-none sm:text-[26vw]">
        6-7
      </div>

      {/* Vignette + glow */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 80% at 75% 10%, color-mix(in oklab, ${fg} 10%, transparent), transparent 55%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 120% at 50% 50%, transparent 40%, color-mix(in oklab, var(--bg) 75%, transparent))' }}
      />

      {/* Content */}
      <motion.div
        style={{ y: yContent, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fg opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fg" />
          </span>
          <span className="eyebrow">{t('hero.eyebrow')}</span>
        </motion.div>

        {/* Giant monogram + title */}
        <motion.div style={{ y: yTitle }} className="mt-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="display text-[15vw] leading-[0.82] sm:text-[12vw] lg:text-[9.5vw]"
          >
            <span className="font-mono glitch text-fg" data-text="6-7">
              6-7
            </span>
            <span className="block text-fg">
              <ScrambleText text={t('hero.title1')} className="block" />
              <ScrambleText text={t('hero.title2')} className="block" />
            </span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-fg/65 sm:text-lg"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="/#work">{t('hero.cta1')}</MagneticButton>
          <MagneticButton href="/#contact" strength={0.25} className="border-dashed">
            {t('hero.cta2')}
          </MagneticButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-16 grid grid-cols-2 gap-8 border-t border-line pt-8 sm:grid-cols-4"
        >
          <Stat value={150} suffix="+" label="Projects shipped" />
          <Stat value={12} suffix="y" label="Years building" />
          <Stat value={99} suffix=".9%" label="Uptime" />
          <Stat value={0} suffix="" label="Security incidents" />
        </motion.div>
      </motion.div>

      {/* Bottom marquee */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-y border-line bg-bg/40 py-3 backdrop-blur-sm">
        <Marquee>
          <MarqueeItem className="gap-8 px-8">
            {['SECURITY', 'DISTRIBUTED SYSTEMS', 'PRODUCT DESIGN', 'WEB PLATFORMS', 'FRAUD DETECTION', 'DEVTOOLS'].map(
              (w) => (
                <span key={w} className="flex items-center gap-8">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-fg/70">{w}</span>
                  <span className="text-fg/30">✦</span>
                </span>
              ),
            )}
          </MarqueeItem>
        </Marquee>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-14 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Scroll</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-fg/30 p-1">
          <motion.span
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-fg"
          />
        </span>
      </motion.div>
    </section>
  );
}
