/**
 * Tiny API client. Sends cookies (credentials: include), keeps a CSRF token
 * in memory, and attaches it to every mutating request.
 */

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

async function fetchCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = fetch('/api/csrf', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => (csrfToken = d.csrfToken as string))
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

/** Reset cached CSRF — called after logout. */
export function resetCsrf() {
  csrfToken = null;
  csrfPromise = null;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const init: RequestInit = { method, credentials: 'include', headers };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (method !== 'GET') {
    headers['x-csrf-token'] = await fetchCsrf();
  }

  const res = await fetch(url, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `HTTP ${res.status}`) as Error & {
      status: number;
      data?: any;
    };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  del: <T>(url: string) => request<T>('DELETE', url),
  upload: async (file: File): Promise<{ ok: boolean; url: string }> => {
    const token = await fetchCsrf();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': token },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.error || 'upload failed'), { status: res.status, data });
    return data;
  },
};
