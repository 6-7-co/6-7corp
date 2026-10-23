import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { pickPair } from '../lib/localized';
import { ADMIN_URL } from '../lib/adminRoute';
import { FOOTER } from '../content';

const NAV = [
  { section: 'capabilities', key: 'nav.services' },
  { section: 'work', key: 'nav.projects' },
  { section: 'team', key: 'nav.team' },
  { section: 'contact', key: 'nav.contact' },
];

export function Footer() {
  const { t, pick, lang } = useI18n();
  const { admin } = useAuth();
  const { settings } = useContent();

  const email = settings.email || 'hello@6-7corp.com';
  const location = pickPair(lang, settings.location_ru, settings.location_en);

  function go(section: string) {
    if (window.location.pathname === '/') {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.assign(`/#${section}`);
    }
  }

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[13px] border border-line-strong bg-surface text-[11px] font-semibold">
                6-7
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight">
                6-7<span className="text-muted"> Corp</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-muted">{pick(FOOTER.tagline)}</p>
            <a href={`mailto:${email}`} className="link-soft mt-5 inline-block text-[14px]">
              {email}
            </a>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted/70">{t('footer.nav')}</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((l) => (
                <li key={l.section}>
                  <button
                    onClick={() => go(l.section)}
                    className="text-[14px] text-muted transition-colors hover:text-fg"
                  >
                    {t(l.key)}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/journal" className="text-[14px] text-muted transition-colors hover:text-fg">
                  {t('nav.journal')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted/70">
              {t('footer.contacts')}
            </p>
            <ul className="mt-4 space-y-2.5">
              {settings.telegram && (
                <li>
                  <a
                    href={settings.telegram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[14px] text-muted transition-colors hover:text-fg"
                  >
                    Telegram
                  </a>
                </li>
              )}
              {settings.github && (
                <li>
                  <a
                    href={settings.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[14px] text-muted transition-colors hover:text-fg"
                  >
                    GitHub
                  </a>
                </li>
              )}
              <li>
                <Link to="/contact" className="text-[14px] text-muted transition-colors hover:text-fg">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-muted/70">
            © {new Date().getFullYear()} 6-7 Corporation. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[12.5px] text-muted/50">{location}</span>
            {admin && (
              <Link to={ADMIN_URL} className="text-[12.5px] text-muted transition-colors hover:text-fg">
                {t('footer.admin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
