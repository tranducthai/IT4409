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

/**
 * Build ICE server list.
 * - Luôn có 3 Google STUN (cho LAN/đơn giản)
 * - Nếu set VITE_TURN_* thì thêm TURN (cần thiết khi deploy trên internet)
 *
 * Lấy TURN miễn phí: https://www.metered.ca/tools/openrelay/
 */
export function getIceServers() {
  const servers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  const turnUrls      = import.meta.env.VITE_TURN_URLS;
  const turnUsername  = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrls && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrls.split(',').map((u) => u.trim()),
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return servers;
}
