import type { Layout } from '@/types/omr';

interface SaveLayoutParams {
  sessionId: string;
  layout: Layout;
  extra?: Record<string, unknown>;
}

const SESSION_ID_REGEX = /session_id=([^&]+)/i;

export function extractSessionId(source?: string | null): string | null {
  if (!source) return null;
  const match = source.match(SESSION_ID_REGEX);
  return match ? decodeURIComponent(match[1]) : null;
}

async function handleJsonResponse<T>(resp: Response): Promise<T> {
  let data: T | null = null;
  try {
    data = (await resp.json()) as T;
  } catch {
    // ignore parsing error and throw below on !ok
  }

  if (!resp.ok) {
    const message =
      (data as unknown as { message?: string })?.message ||
      resp.statusText ||
      'Request failed';
    throw new Error(message);
  }

  if (!data) {
    throw new Error('Empty response from server');
  }
  return data;
}

export async function saveLayoutToServer({
  sessionId,
  layout,
  extra = {},
}: SaveLayoutParams): Promise<unknown> {
  if (!sessionId) throw new Error('sessionId is required to save layout');
  if (!layout) throw new Error('layout payload is missing');

  const payload = {
    session_id: sessionId,
    layout,
    ...extra,
  };

  const resp = await fetch('/api/layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(resp);
}

export async function loadLayoutFromServer<T = Layout>(
  sessionId: string,
): Promise<T> {
  if (!sessionId) throw new Error('sessionId is required to load layout');
  const resp = await fetch(`/api/layout?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return handleJsonResponse<T>(resp);
}
