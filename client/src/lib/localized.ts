import type { Lang } from '../i18n';

/**
 * Pick a value from a RU/EN pair, falling back to the other language when the
 * preferred one is empty. Handy for CMS-managed content.
 */
export function pickPair(lang: Lang, ru = '', en = '') {
  return lang === 'ru' ? ru || en : en || ru;
}
