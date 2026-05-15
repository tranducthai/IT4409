import { clearMockCurrentUser, getMockCurrentUser, setMockCurrentUser } from '../../mocks/auth/mockSession';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const SESSION_KEY = 'it4409_current_user';

function readStoredUser() {
  const rawUser = localStorage.getItem(SESSION_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  if (USE_MOCK_DATA) return getMockCurrentUser();
  return readStoredUser();
}

export function setCurrentUser(user) {
  if (!user) return;
  if (USE_MOCK_DATA) {
    setMockCurrentUser(user);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  if (USE_MOCK_DATA) {
    clearMockCurrentUser();
    return;
  }
  localStorage.removeItem(SESSION_KEY);
}
