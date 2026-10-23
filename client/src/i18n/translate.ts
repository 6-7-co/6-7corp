/**
 * Client-side translation via the public Google Translate endpoint
 * (translate.googleapis.com). No API key required. Falls back gracefully.
 */

type Lang = string;

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

export async function googleTranslate(
  text: string,
  target: Lang,
  source: Lang = 'auto',
): Promise<string> {
  const clean = String(text ?? '').trim();
  if (!clean) return '';

  const url = `${ENDPOINT}?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(
    target,
  )}&dt=t&q=${encodeURIComponent(clean)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate failed ${res.status}`);
  const data = await res.json();

  // Response shape: [[["translated","source",null,null,1]], ...]
  const segments: string[] = [];
  if (Array.isArray(data) && Array.isArray(data[0])) {
    for (const seg of data[0]) {
      if (Array.isArray(seg) && typeof seg[0] === 'string') segments.push(seg[0]);
    }
  }
  return segments.join('') || clean;
}

/** In-memory + localStorage cache so we don't re-translate the same string. */
const memCache = new Map<string, string>();

export function makeTranslator(cacheKeyPrefix: string) {
  return async function translate(text: string, target: Lang): Promise<string> {
    const clean = String(text ?? '').trim();
    if (!clean) return '';
    const key = `${cacheKeyPrefix}|${target}|${clean}`;
    const hit = memCache.get(key);
    if (hit !== undefined) return hit;
    try {
      const out = await googleTranslate(clean, target);
      memCache.set(key, out);
      return out;
    } catch {
      memCache.set(key, clean);
      return clean;
    }
  };
}
