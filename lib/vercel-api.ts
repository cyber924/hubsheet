import 'server-only';
import { headers } from 'next/headers';

const API_ORIGIN = 'https://hubsheet.herestay-4226.chatgpt.site';
const ALLOWED_COOKIES = new Set(['__Host-hubsheet-id', '__Host-hubsheet-refresh']);

type HubSheetApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: string;
};

// Vercel has no Cloudflare D1 binding. Use the existing authenticated
// Cloudflare API and forward only HubSheet Firebase session cookies.
export async function hubsheetApiFetch(path: string, options: HubSheetApiOptions = {}): Promise<Response> {
  if (!path.startsWith('/api/') || path.startsWith('//')) throw new Error('Invalid API path');
  const url = new URL(path, API_ORIGIN);
  if (url.origin !== API_ORIGIN) throw new Error('Invalid API origin');

  const incoming = await headers();
  const cookies = (incoming.get('cookie') || '')
    .split(';')
    .map(value => value.trim())
    .filter(value => ALLOWED_COOKIES.has(value.split('=', 1)[0]));

  const requestHeaders: Record<string, string> = {};
  if (cookies.length) requestHeaders.cookie = cookies.join('; ');
  if (options.body !== undefined) requestHeaders['content-type'] = 'application/json';

  try {
    return await fetch(url, {
      method: options.method || 'GET',
      headers: requestHeaders,
      body: options.body,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw Object.assign(new Error('Cloudflare D1 API 연결에 실패했습니다.'), { status: 502 });
  }
}

// Preserve the Cloudflare API's status and JSON result, including validation
// and rate-limit errors, while preventing intermediary caching.
export async function hubsheetApiReply(path: string, options: HubSheetApiOptions = {}): Promise<Response> {
  const upstream = await hubsheetApiFetch(path, options);
  const data = await upstream.json().catch(() => undefined);
  if (data === undefined) {
    return Response.json({ error: 'Cloudflare D1 API 응답 형식을 확인해주세요.' }, {
      status: 502,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
  const outgoingHeaders = new Headers({ 'Cache-Control': 'private, no-store' });
  const retryAfter = upstream.headers.get('retry-after');
  if (retryAfter) outgoingHeaders.set('Retry-After', retryAfter);
  return Response.json(data, { status: upstream.status, headers: outgoingHeaders });
}

export async function hubsheetApi<T>(path: string): Promise<T> {
  const response = await hubsheetApiFetch(path);
  if (!response.ok) throw new Error('HubSheet API error: ' + response.status);
  return response.json() as Promise<T>;
}
