import 'server-only';
import { headers } from 'next/headers';

const API_ORIGIN = 'https://hubsheet.herestay-4226.chatgpt.site';
const ALLOWED_COOKIES = new Set(['__Host-hubsheet-id', '__Host-hubsheet-refresh']);

// Forward only HubSheet session cookies to the existing service, never arbitrary headers.
export async function hubsheetApi<T>(path: string): Promise<T> {
  if (!path.startsWith('/api/') || path.startsWith('//')) throw new Error('Invalid API path');
  const url = new URL(path, API_ORIGIN);
  if (url.origin !== API_ORIGIN) throw new Error('Invalid API origin');
  const incoming = await headers();
  const cookies = (incoming.get('cookie') || '').split(';').map(x => x.trim()).filter(x => ALLOWED_COOKIES.has(x.split('=', 1)[0]));
  const response = await fetch(url, { headers: cookies.length ? { cookie: cookies.join('; ') } : {}, cache: 'no-store', redirect: 'error' });
  if (!response.ok) throw new Error('HubSheet API error: ' + response.status);
  return response.json() as Promise<T>;
}
