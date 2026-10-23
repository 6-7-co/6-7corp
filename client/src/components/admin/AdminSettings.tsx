import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AdminHeader, Field, TextInput, TextArea, SaveButton, useSaved } from './ui';
import { useI18n } from '../../i18n';

type Settings = {
  company_name: string;
  tagline: string;
  description: string;
  email: string;
  established: string;
  locale_default: string;
};

export function AdminSettings() {
  const { t } = useI18n();
  const [form, setForm] = useState<Settings | null>(null);
  const { saved, setSaved } = useSaved();

  useEffect(() => {
    api.get<Settings>('/api/settings').then(setForm).catch(() => undefined);
  }, []);

  if (!form) return <AdminHeader title={t('admin.settings')} />;

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    await api.put('/api/settings', form);
    setSaved(true);
  }

  return (
    <div>
      <AdminHeader title={t('admin.settings')} subtitle="Company information" />
      <div className="mt-8 grid gap-6 rounded-[22px] border border-line p-6 sm:grid-cols-2">
        <Field label={t('admin.title')} hint="Company name"><TextInput value={form.company_name} onChange={(e) => set('company_name', e.target.value)} /></Field>
        <Field label="Tagline"><TextInput value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
        <Field label={t('admin.email')}><TextInput value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Established"><TextInput value={form.established} onChange={(e) => set('established', e.target.value)} /></Field>
        <Field label="Default language">
          <select
            value={form.locale_default}
            onChange={(e) => set('locale_default', e.target.value)}
            className="mt-2 w-full border-b border-line-strong bg-ink-900/60 px-1 py-2.5 font-mono text-sm text-fg outline-none focus:border-white"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('admin.body')} hint="Short company description shown on the homepage">
            <TextArea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} />
          </Field>
        </div>
      </div>
      <div className="mt-8">
        <SaveButton onClick={save} label={t('common.save')} saved={saved} />
      </div>
    </div>
  );
}
