const ACCESS_KEY = 'it4409_access_token';
const REFRESH_KEY = 'it4409_refresh_token';
const CURRENT_USER_KEY = 'it4409_current_user';
const MOCK_CURRENT_USER_KEY = 'it4409_mock_current_user';

export function clearAuthState() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(MOCK_CURRENT_USER_KEY);
}

export const authStorageKeys = {
  accessToken: ACCESS_KEY,
  refreshToken: REFRESH_KEY,
  currentUser: CURRENT_USER_KEY,
  mockCurrentUser: MOCK_CURRENT_USER_KEY,
};