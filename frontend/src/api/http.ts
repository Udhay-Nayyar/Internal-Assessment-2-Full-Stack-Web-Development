import type { ApiErrorBody } from '../types';

const BASE_URL = '/api';
const TOKEN_KEY = 'shelflife_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// AuthContext registers a callback so an expired/invalid token logs the user out
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  auth?: boolean; // attach the JWT
  signal?: AbortSignal;
}

function isErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null && typeof (data as ApiErrorBody).error === 'string';
}

// Single typed entry point: request<ResponseType>(path, options)
export async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { method = 'GET', body, auth = false, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err; // cancelled on purpose, let caller ignore it
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) unauthorizedHandler?.();
    throw new ApiError(isErrorBody(data) ? data.error : `Request failed (${response.status})`, response.status);
  }

  return data as TResponse;
}
