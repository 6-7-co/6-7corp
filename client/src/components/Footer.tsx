import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative mt-px border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 font-mono text-xs font-bold">
                6-7
              </span>
              <span className="font-display text-sm font-semibold tracking-tight">CORPORATION</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">{t('about.body')}</p>
          </div>

          <div className="space-y-3">
            <p className="eyebrow">Navigate</p>
            {[
              { href: '/#services', key: 'nav.services' },
              { href: '/#work', key: 'nav.projects' },
              { href: '/#team', key: 'nav.team' },
              { href: '/journal', key: 'nav.journal' },
            ].map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="block text-sm text-white/70 transition-colors hover:text-white"
              >
                {t(l.key)}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <p className="eyebrow">Contact</p>
            <a href="mailto:hello@6-7corp.com" className="block text-sm text-white/70 transition-colors hover:text-white">
              hello@6-7corp.com
            </a>
            <Link to="/#contact" className="block text-sm text-white/70 transition-colors hover:text-white">
              {t('nav.contact')}
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            © {new Date().getFullYear()} 6-7 Corporation — {t('footer.rights')}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{t('footer.built')}</p>
        </div>
      </div>
    </footer>
  );
}
