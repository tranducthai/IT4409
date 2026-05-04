const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const ACCESS_KEY = 'it4409_access_token';
const REFRESH_KEY = 'it4409_refresh_token';

export function setAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (data?.accessToken) {
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken });
    return data.accessToken;
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
      clearAuthTokens();
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
