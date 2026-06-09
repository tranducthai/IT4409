import { mockUsers } from './mockUsers';

const allowedRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
const SESSION_KEY = 'it4409_mock_current_user';

const roleFromEnv = (import.meta.env.VITE_MOCK_SESSION_ROLE ?? 'STUDENT').toUpperCase();

function getStoredUser() {
  const rawUser = localStorage.getItem(SESSION_KEY);
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser);
    if (!parsed?.role || !allowedRoles.includes(String(parsed.role).toUpperCase())) {
      return null;
    }

    return {
      ...parsed,
      role: String(parsed.role).toUpperCase(),
    };
  } catch {
    return null;
  }
}

function resolveDefaultUser() {
  const resolvedRole = allowedRoles.includes(roleFromEnv)
    ? roleFromEnv
    : 'STUDENT';

  return mockUsers.find((user) => user.role === resolvedRole) ?? mockUsers[0];
}

export function getMockCurrentUser() {
  return getStoredUser() ?? resolveDefaultUser();
}

export function setMockCurrentUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearMockCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

// Quick switch role by env value: STUDENT | TEACHER | ADMIN
export const mockSessionRole = getMockCurrentUser().role;
