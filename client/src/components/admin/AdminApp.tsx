import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { ADMIN_URL } from '../../lib/adminRoute';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';

const NAV = [
  { to: ADMIN_URL, key: 'admin.dashboard', end: true },
  { to: `${ADMIN_URL}/posts`, key: 'admin.posts' },
  { to: `${ADMIN_URL}/projects`, key: 'admin.projects' },
  { to: `${ADMIN_URL}/team`, key: 'admin.team' },
  { to: `${ADMIN_URL}/messages`, key: 'admin.messages' },
  { to: `${ADMIN_URL}/media`, key: 'admin.media' },
  { to: `${ADMIN_URL}/settings`, key: 'admin.settings' },
];

export function AdminApp() {
  const { admin, loading, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="text-[12px] uppercase tracking-[0.2em] text-muted">{t('common.loading')}…</span>
      </div>
    );
  }

  if (!admin) return <AdminLogin />;

  async function doLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        <aside className="glass sticky top-4 z-30 rounded-[26px] p-3 lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[248px] lg:shrink-0">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[13px] border border-line-strong bg-surface text-[11px] font-semibold">
                6-7
              </span>
              <span className="font-display text-[14px] font-semibold">Панель</span>
            </div>
            <ThemeToggle />
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-[14px] px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-soft hover:text-fg'
                  }`
                }
              >
                {t(n.key)}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 space-y-2 border-t border-line px-2 pt-4 lg:absolute lg:bottom-4 lg:left-3 lg:right-3">
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="truncate text-[12px] text-muted">{admin.username}</span>
              <LanguageSwitcher compact />
            </div>
            <button
              onClick={doLogout}
              className="w-full rounded-[14px] border border-line px-3 py-2 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              {t('admin.signout')}
            </button>
            <a
              href="/"
              className="block rounded-[14px] px-3 py-2 text-center text-[12.5px] text-muted transition-colors hover:text-fg"
            >
              ← {t('admin.toSite')}
            </a>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-1 pb-10 sm:px-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err?.data?.error || 'Не удалось войти. Проверьте данные.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[90px]"
        style={{ background: 'linear-gradient(140deg, var(--accent-a), var(--accent-c))' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[380px] rounded-[28px] border border-line bg-surface p-7 backdrop-blur-xl sm:p-8"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[13px] border border-line-strong bg-surface text-[11px] font-semibold">
            6-7
          </span>
          <span className="font-display text-[14px] font-semibold">6-7 Corp</span>
        </div>

        <h1 className="display mt-7 text-[24px] font-medium">{t('admin.login')}</h1>
        <p className="mt-1.5 text-[13px] text-muted">
          Закрытый раздел. Доступ только для администраторов.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted/80">
              {t('admin.username')}
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-1.5 w-full rounded-[14px] border border-line bg-bg/60 px-4 py-3 text-[14px] outline-none transition-colors focus:border-line-strong"
            />
          </label>
          <label className="block">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted/80">
              {t('admin.password')}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-[14px] border border-line bg-bg/60 px-4 py-3 text-[14px] outline-none transition-colors focus:border-line-strong"
            />
          </label>

          {error && <p className="text-[12.5px] text-muted">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[14px] bg-fg px-5 py-3 text-[14px] font-semibold text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {busy ? '…' : t('admin.signin')}
          </button>
        </form>

        <a href="/" className="mt-5 block text-center text-[12.5px] text-muted transition-colors hover:text-fg">
          ← {t('admin.toSite')}
        </a>
      </motion.div>
    </div>
  );
}

export { AdminLogin };
