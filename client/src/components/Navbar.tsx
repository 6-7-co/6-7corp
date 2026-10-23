import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { href: '/#services', key: 'nav.services' },
  { href: '/#work', key: 'nav.projects' },
  { href: '/#team', key: 'nav.team' },
  { href: '/journal', key: 'nav.journal' },
  { href: '/#contact', key: 'nav.contact' },
];

export function Navbar() {
  const { t } = useI18n();
  const { admin } = useAuth();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? 'border-b border-white/10 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 font-mono text-xs font-bold text-white">
            6-7
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-white" />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight text-white sm:block">
            CORPORATION
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              className="relative font-mono text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full"
            >
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher compact />
          <Link
            to="/admin"
            className={`hidden border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors sm:block ${
              admin
                ? 'border-white/40 text-white'
                : 'border-white/20 text-white/70 hover:border-white hover:text-white'
            }`}
          >
            {admin ? t('admin.dashboard') : t('nav.admin')}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center border border-white/15 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <span className="font-mono text-xs">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-white/80"
                >
                  {t(l.key)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
