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

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  if (value instanceof FormData) return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Blob) return false;
  if (value instanceof ArrayBuffer) return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeRequestBody(options = {}) {
  if (!Object.prototype.hasOwnProperty.call(options, 'body')) {
    return { body: undefined, headers: options.headers ?? {} };
  }

  const headers = { ...(options.headers ?? {}) };
  const body = options.body;

  if (body == null) {
    return { body, headers };
  }

  if (isFormData(body)) {
    delete headers['Content-Type'];
    delete headers['content-type'];
    return { body, headers };
  }

  if (typeof body === 'string') {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    return { body, headers };
  }

  if (isPlainObject(body)) {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    return { body: JSON.stringify(body), headers };
  }

  return { body, headers };
}

function formatApiErrorMessage(data, status) {
  const message = data?.message;
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ') || `API request failed with status ${status}`;
  }
  if (typeof message === 'string' && message.trim()) return message;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (Array.isArray(data?.error)) {
    return data.error.filter(Boolean).join(', ') || `API request failed with status ${status}`;
  }

  return `API request failed with status ${status}`;
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
  const { body, headers } = normalizeRequestBody(options);

  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
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
    const message = formatApiErrorMessage(data, response.status);
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export async function apiUpload(path, formData, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers ?? {}),
  };

  delete headers['Content-Type'];
  delete headers['content-type'];

  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    ...options,
    headers,
    body: formData,
  });

  if (response.status === 401 && !options._retry) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        ...options,
        headers: retryHeaders,
        body: formData,
        _retry: true,
      });
    } else {
      clearAuthState();
    }
  }

  const hasBody = response.status !== 204;
  const data = hasBody ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = formatApiErrorMessage(data, response.status);
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export { API_BASE_URL };
