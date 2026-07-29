import { Platform, DeviceEventEmitter } from 'react-native';

import { getAccessToken, clearTokens } from '@/services/keycloak/token';
import { refreshAccessToken } from '@/services/keycloak/auth';

function getGatewayBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_GATEWAY_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:8080`;
}

export const GATEWAY_BASE_URL = getGatewayBaseUrl();

export class ApiError extends Error {
  status: number;
  path: string;

  constructor(status: number, message: string, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

/** Thrown when the refresh token is missing/expired — callers should route to login. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.');
    this.name = 'SessionExpiredError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Set to false for endpoints that don't require a bearer token. Defaults to true. */
  auth?: boolean;
  /** When true, body is FormData and Content-Type is left unset (browser sets boundary). */
  multipart?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, GATEWAY_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseErrorMessage(response: Response, path: string): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.message === 'string') return body.message;
  } catch {
    // Response wasn't JSON — fall through to a generic message.
  }
  return `Request to ${path} failed with status ${response.status}`;
}

async function performRequest<T>(path: string, options: RequestOptions, accessToken: string | null): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (options.body !== undefined && !options.multipart) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.multipart
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  if (response.status === 401) {
    const err = new ApiError(401, 'Unauthorized', path);
    throw err;
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response, path);
    throw new ApiError(response.status, message, path);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Typed fetch wrapper for the Nexora API gateway. Attaches the bearer token,
 * and on a 401 transparently refreshes the access token once before retrying.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const requiresAuth = options.auth !== false;
  const accessToken = requiresAuth ? await getAccessToken() : null;

  try {
    return await performRequest<T>(path, options, accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && requiresAuth) {
      try {
        const newAccessToken = await refreshAccessToken();
        return await performRequest<T>(path, options, newAccessToken);
      } catch {
        await clearTokens();
        if (Platform.OS === 'web') {
          window.dispatchEvent(new Event('session-expired'));
        } else {
          DeviceEventEmitter.emit('session-expired');
        }
        throw new SessionExpiredError();
      }
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => apiRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'POST', body, query }),
  put: <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'PUT', body, query }),
  patch: <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'PATCH', body, query }),
  delete: <T>(path: string, query?: RequestOptions['query']) => apiRequest<T>(path, { method: 'DELETE', query }),
  upload: <T>(path: string, formData: FormData) =>
    apiRequest<T>(path, { method: 'POST', body: formData, multipart: true }),
};

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
