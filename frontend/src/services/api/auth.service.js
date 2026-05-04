import { apiRequest, setAuthTokens, clearAuthTokens } from './client';

export async function login(credentials) {
  // credentials: { email, password }
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Expecting { accessToken, refreshToken, user }
  if (data?.accessToken) {
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }

  return data;
}

export async function register(payload) {
  // payload: { name, email, password }
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.accessToken) {
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }

  return data;
}

export function logout() {
  clearAuthTokens();
}

export default { login, register, logout };
import { apiRequest } from './client';

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refresh(refreshToken) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function me(accessToken) {
  return apiRequest('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
