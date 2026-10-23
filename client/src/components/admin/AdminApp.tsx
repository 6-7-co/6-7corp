import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { api } from '../../lib/api';

const NAV = [
  { to: '/admin', label: 'Dashboard', key: 'admin.dashboard', end: true },
  { to: '/admin/posts', label: 'Journal', key: 'admin.posts' },
  { to: '/admin/projects', label: 'Projects', key: 'admin.projects' },
  { to: '/admin/team', label: 'Team', key: 'admin.team' },
  { to: '/admin/messages', label: 'Messages', key: 'admin.messages' },
  { to: '/admin/media', label: 'Media', key: 'admin.media' },
  { to: '/admin/settings', label: 'Settings', key: 'admin.settings' },
];

export function AdminApp() {
  const { admin, loading, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">{t('common.loading')}</span>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  async function doLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-ink-900/60 backdrop-blur-xl lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 font-mono text-[10px] font-bold">6-7</span>
            <span className="font-display text-sm font-semibold">Admin</span>
          </div>
          <button
            onClick={doLogout}
            className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:border-white hover:text-white"
          >
            {t('admin.signout')}
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b border-white/5 px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors lg:border-b-0 lg:rounded-lg ${
                  isActive ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10'
                }`
              }
            >
              {t(n.key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <Outlet />
        </div>
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
      setError(err?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 font-mono text-xs font-bold">6-7</span>
          <span className="font-display text-sm font-semibold tracking-tight">CORPORATION</span>
        </div>
        <h1 className="font-display text-2xl font-semibold">{t('admin.login')}</h1>
        <p className="mt-2 font-mono text-[11px] text-white/40">Secure sign-in · session protected</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="eyebrow">{t('admin.username')}</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 font-mono text-sm text-white outline-none focus:border-white"
            />
          </label>
          <label className="block">
            <span className="eyebrow">{t('admin.password')}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 font-mono text-sm text-white outline-none focus:border-white"
            />
          </label>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-white/60">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border border-white bg-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-transparent hover:text-white disabled:opacity-40"
          >
            {t('admin.signin')}
          </button>
        </form>
        <p className="mt-6 font-mono text-[10px] text-white/30">Default dev credentials: admin / admin12345</p>
      </motion.div>
    </div>
  );
}

// Re-exported for App.tsx.
export { AdminLogin };
