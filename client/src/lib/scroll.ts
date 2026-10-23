/**
 * Section navigation helpers.
 *
 * The site is a single-page app with hash links (e.g. `/#work`) that must scroll
 * to a section instead of jumping to a new route. Because sections mount and
 * animate in, a single `scrollIntoView` call is often too early — we poll for
 * the target element for a short window and then scroll with a header offset.
 */

export const HEADER_OFFSET = 96;

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

/** Retry until the element exists or the timeout expires. */
export function scrollToSectionWhenReady(id: string, timeout = 1400) {
  const started = performance.now();

  const attempt = () => {
    if (scrollToSection(id)) return;
    if (performance.now() - started < timeout) {
      requestAnimationFrame(attempt);
    }
  };

  attempt();
}

export function hashId(hash: string) {
  return hash.replace(/^#/, '');
}
