import type { Lang } from '../i18n';

/** Human date, localised. Falls back to the raw ISO slice on bad input. */
export function formatDate(value: string | undefined | null, lang: Lang) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
