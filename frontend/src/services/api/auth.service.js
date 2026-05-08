import { apiRequest, clearAuthTokens } from './client';
import { mockUsers } from '../../mocks/auth/mockUsers';
import { getMockCurrentUser, setMockCurrentUser, clearMockCurrentUser } from '../../mocks/auth/mockSession';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

function toMockUser(payload = {}) {
  const normalizedRole = String(payload.role ?? 'STUDENT').toUpperCase();
  const role = ['STUDENT', 'TEACHER', 'ADMIN'].includes(normalizedRole) ? normalizedRole : 'STUDENT';
  const fallbackUser = mockUsers.find((user) => user.role === role) ?? mockUsers[0];

  return {
    ...fallbackUser,
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    full_name: payload.name ?? fallbackUser.full_name,
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

export async function login(credentials) {
  // credentials: { email, password }
  if (USE_MOCK_DATA) {
    const matchedUser = mockUsers.find(
      (user) => user.email.toLowerCase() === String(credentials.email ?? '').toLowerCase(),
    );

    const user = matchedUser ?? getMockCurrentUser();
    const response = createMockAuthResponse(user);
    setMockCurrentUser(user);
    return response;
  }

  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(payload) {
  // payload: { name, email, password }
  if (USE_MOCK_DATA) {
    const user = toMockUser(payload);
    const response = createMockAuthResponse(user);
    setMockCurrentUser(user);
    return response;
  }

  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout() {
  clearAuthTokens();
  if (USE_MOCK_DATA) {
    clearMockCurrentUser();
  }
}

export default { login, register, logout };
