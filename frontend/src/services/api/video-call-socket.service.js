import { io } from 'socket.io-client';
import { API_BASE_URL, getAccessToken } from './client';

function getSocketBaseUrl() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
}

export function createVideoCallSocket() {
  const token = getAccessToken();
  if (!token) return null;

  return io(`${getSocketBaseUrl()}/video-call`, {
    auth: { token },
    autoConnect: false,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
}
