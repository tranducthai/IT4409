import { mockUsers } from '../../mocks/auth/mockUsers';
import { apiRequest } from './client';
import { clearAuthState } from './authState';
import { getCurrentUser, setCurrentUser } from './session';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

function toMockUser(payload = {}) {
  const normalizedRole = String(payload.role ?? 'STUDENT').toUpperCase();
  const role = ['STUDENT', 'TEACHER', 'ADMIN'].includes(normalizedRole) ? normalizedRole : 'STUDENT';
  const fallbackUser = mockUsers.find((user) => user.role === role) ?? mockUsers[0];

  return {
    ...fallbackUser,
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    full_name: payload.full_name ?? payload.name ?? fallbackUser.full_name,
    email: payload.email ?? fallbackUser.email,
    role,
  };
}

function createMockAuthResponse(user) {
  const shortId = user.id.slice(0, 8);
  return {
    accessToken: `mock-access-${shortId}`,
    refreshToken: `mock-refresh-${shortId}`,
    user,
  };
}

function mapBackendAuthResponse(payload) {
  if (!payload) return null;
  return {
    accessToken: payload.access_token ?? payload.accessToken ?? null,
    refreshToken: payload.refresh_token ?? payload.refreshToken ?? null,
    user: payload.user ?? null,
  };
}

export async function login(credentials) {
  // credentials: { email, password }
  if (USE_MOCK_DATA) {
    const matchedUser = mockUsers.find(
      (user) => user.email.toLowerCase() === String(credentials.email ?? '').toLowerCase(),
    );

    const user = matchedUser ?? getCurrentUser();
    const response = createMockAuthResponse(user);
    setCurrentUser(user);
    return response;
  }

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  const normalized = mapBackendAuthResponse(data);
  if (normalized?.user) setCurrentUser(normalized.user);
  return normalized;
}

export async function register(payload) {
  // payload: { full_name, email, password, role }
  if (USE_MOCK_DATA) {
    const user = toMockUser(payload);
    const response = createMockAuthResponse(user);
    setCurrentUser(user);
    return response;
  }

  const normalizedPayload = {
    full_name: payload.full_name ?? payload.name,
    email: payload.email,
    password: payload.password,
    role: String(payload.role ?? 'STUDENT').toUpperCase(),
  };

  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });

  const normalized = mapBackendAuthResponse(data);
  if (normalized?.user) setCurrentUser(normalized.user);
  return normalized;
}

export async function changePassword(payload) {
  if (USE_MOCK_DATA) {
    return { changed: true };
  }

  return apiRequest('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify({
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    }),
  });
}

export async function getCurrentUserFromApi() {
  if (USE_MOCK_DATA) {
    return getCurrentUser();
  }

  try {
    const user = await apiRequest('/auth/me', {
      method: 'GET',
    });

    if (user) setCurrentUser(user);
    return user;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      clearAuthState();
    }
    throw error;
  }
}

export function logout() {
  clearAuthState();
}

export default { login, register, changePassword, getCurrentUserFromApi, logout };
