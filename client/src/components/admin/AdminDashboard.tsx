import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { AdminHeader } from './ui';
import { useI18n } from '../../i18n';
import { ADMIN_URL } from '../../lib/adminRoute';

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
    { to: `${ADMIN_URL}/posts`, label: t('admin.posts'), n: counts.posts },
    { to: `${ADMIN_URL}/projects`, label: t('admin.projects'), n: counts.projects },
    { to: `${ADMIN_URL}/team`, label: t('admin.team'), n: counts.team },
    { to: `${ADMIN_URL}/messages`, label: t('admin.messages'), n: counts.messages },
  ];

  return (
    <div>
      <AdminHeader title={t('admin.dashboard')} subtitle="6-7 Corporation CMS" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-[22px] border border-line bg-surface p-6 transition-colors hover:border-line-strong"
          >
            <div className="font-display text-[34px] font-semibold tracking-[-0.03em] text-fg">{c.n}</div>
            <div className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-muted">{c.label}</div>
            <div className="mt-4 text-muted/70 transition-transform group-hover:translate-x-1">→</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-[22px] border border-line bg-surface p-6">
        <p className="eyebrow">Security</p>
        <ul className="mt-4 space-y-2 text-[13px] text-muted">
          <li className="flex items-center gap-2"><span className="text-fg">✓</span> Parameterised SQL — no injection surface</li>
          <li className="flex items-center gap-2"><span className="text-fg">✓</span> HTML escaping via z-md (XSS-safe rendering)</li>
          <li className="flex items-center gap-2"><span className="text-fg">✓</span> CSRF double-submit cookies on all mutations</li>
          <li className="flex items-center gap-2"><span className="text-fg">✓</span> bcrypt-hashed passwords, JWT sessions</li>
          <li className="flex items-center gap-2"><span className="text-fg">✓</span> Rate limiting + CSP headers</li>
        </ul>
      </div>
    </div>
  );
}
