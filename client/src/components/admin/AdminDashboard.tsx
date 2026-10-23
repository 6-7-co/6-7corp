import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { AdminHeader } from './ui';
import { useI18n } from '../../i18n';

export function AdminDashboard() {
  const { t } = useI18n();
  const [counts, setCounts] = useState({ posts: 0, projects: 0, team: 0, messages: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/posts'),
      api.get('/api/projects'),
      api.get('/api/team'),
      api.get('/api/messages'),
    ])
      .then(([posts, projects, team, messages]) => {
        setCounts({
          posts: (posts as any[]).length,
          projects: (projects as any[]).length,
          team: (team as any[]).length,
          messages: (messages as any[]).length,
        });
      })
      .catch(() => undefined);
  }, []);

  const cards = [
    { to: '/admin/posts', label: t('admin.posts'), n: counts.posts },
    { to: '/admin/projects', label: t('admin.projects'), n: counts.projects },
    { to: '/admin/team', label: t('admin.team'), n: counts.team },
    { to: '/admin/messages', label: t('admin.messages'), n: counts.messages },
  ];

  return (
    <div>
      <AdminHeader title={t('admin.dashboard')} subtitle="6-7 Corporation CMS" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-white/10 p-6 transition-colors hover:border-white"
          >
            <div className="font-display text-4xl font-bold text-white">{c.n}</div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">{c.label}</div>
            <div className="mt-4 text-white/30 transition-transform group-hover:translate-x-1">→</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 p-6">
        <p className="eyebrow">Security</p>
        <ul className="mt-4 space-y-2 font-mono text-xs text-white/60">
          <li className="flex items-center gap-2"><span className="text-white">✓</span> Parameterised SQL — no injection surface</li>
          <li className="flex items-center gap-2"><span className="text-white">✓</span> HTML escaping via z-md (XSS-safe rendering)</li>
          <li className="flex items-center gap-2"><span className="text-white">✓</span> CSRF double-submit cookies on all mutations</li>
          <li className="flex items-center gap-2"><span className="text-white">✓</span> bcrypt-hashed passwords, JWT sessions</li>
          <li className="flex items-center gap-2"><span className="text-white">✓</span> Rate limiting + CSP headers</li>
        </ul>
      </div>
    </div>
  );
}
