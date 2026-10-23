import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { scrollToSectionWhenReady } from '../lib/scroll';

type NavItem = { section: string; key: string };

const LINKS: NavItem[] = [
  { section: 'capabilities', key: 'nav.services' },
  { section: 'work', key: 'nav.projects' },
  { section: 'team', key: 'nav.team' },
  { section: 'journal', key: 'nav.journal' },
  { section: 'contact', key: 'nav.contact' },
];

export function Navbar() {
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === '/';

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  function goTo(section: string) {
    setOpen(false);
    if (section === 'journal') return; // handled by Link navigation
    if (onHome) {
      scrollToSectionWhenReady(section);
    } else {
      window.location.assign(`/#${section}`);
    }
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
    >
      <nav
        className={`glass mx-auto mt-3 flex max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 sm:mt-5 sm:px-4 ${
          scrolled ? 'shadow-[0_24px_70px_-45px_rgba(0,0,0,0.9)]' : 'shadow-none'
        }`}
      >
        <Link
          to="/"
          onClick={() => {
            setOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 pl-1.5"
          aria-label="6-7 Corporation"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[13px] border border-line-strong bg-surface text-[11px] font-semibold tracking-tight text-fg transition-colors group-hover:bg-surface-soft">
            6-7
          </span>
          <span className="hidden font-display text-[15px] font-semibold tracking-tight sm:block">
            6-7<span className="text-muted"> Corp</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.section}
              to={l.section === 'journal' ? '/journal' : `/#${l.section}`}
              onClick={(e) => {
                if (l.section === 'journal') return;
                e.preventDefault();
                goTo(l.section);
              }}
              className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-muted transition-colors hover:bg-surface-soft hover:text-fg"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <Link
            to="/contact"
            className="hidden rounded-full bg-fg px-4 py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-85 sm:inline-flex"
          >
            {t('nav.cta')}
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-fg transition-colors hover:bg-surface-soft md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Меню"
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-fg transition-all duration-300 ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-px w-4 bg-fg transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-fg transition-all duration-300 ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-2 max-w-6xl overflow-hidden rounded-[26px] p-2 md:hidden"
          >
            {LINKS.map((l) => (
              <Link
                key={l.section}
                to={l.section === 'journal' ? '/journal' : `/#${l.section}`}
                onClick={(e) => {
                  if (l.section === 'journal') {
                    setOpen(false);
                    return;
                  }
                  e.preventDefault();
                  goTo(l.section);
                }}
                className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-fg/80 transition-colors hover:bg-surface-soft hover:text-fg"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line px-2 pt-3">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher compact />
              </div>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="rounded-full bg-fg px-4 py-2.5 text-[13px] font-semibold text-bg"
              >
                {t('nav.cta')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
