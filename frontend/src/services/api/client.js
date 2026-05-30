import { authStorageKeys, clearAuthState } from './authState';
import { setCurrentUser } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function setAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(authStorageKeys.accessToken, accessToken);
  if (refreshToken) localStorage.setItem(authStorageKeys.refreshToken, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(authStorageKeys.accessToken);
  localStorage.removeItem(authStorageKeys.refreshToken);
}

export function getAccessToken() {
  return localStorage.getItem(authStorageKeys.accessToken);
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem(authStorageKeys.refreshToken);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (data?.access_token) {
    setAuthTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
    });
    if (data.user) setCurrentUser(data.user);
    return data.access_token;
  }
  return null;
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // try refresh once on 401
  if (response.status === 401 && !options._retry) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        _retry: true,
      });
    } else {
      clearAuthState();
    }
  }

  const hasBody = response.status !== 204;
  const data = hasBody ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export { API_BASE_URL };
