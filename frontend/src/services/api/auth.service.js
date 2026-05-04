import { apiRequest, clearAuthTokens } from './client';

export async function login(credentials) {
  // credentials: { email, password }
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(payload) {
  // payload: { name, email, password }
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout() {
  clearAuthTokens();
}

export default { login, register, logout };
