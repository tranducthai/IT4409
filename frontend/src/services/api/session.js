import { clearMockCurrentUser, getMockCurrentUser, setMockCurrentUser } from '../../mocks/auth/mockSession';
import { authStorageKeys } from './authState';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

function readStoredUser() {
  const rawUser = localStorage.getItem(authStorageKeys.currentUser);
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
  localStorage.setItem(authStorageKeys.currentUser, JSON.stringify(user));
}

export function clearCurrentUser() {
  if (USE_MOCK_DATA) {
    clearMockCurrentUser();
    return;
  }
  localStorage.removeItem(authStorageKeys.currentUser);
}
