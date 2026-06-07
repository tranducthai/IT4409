import { io } from 'socket.io-client';
import { API_BASE_URL, getAccessToken } from './client';

function getSocketBaseUrl() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
}

export function createChatSocket() {
  const token = getAccessToken();
  if (!token) return null;

  return io(`${getSocketBaseUrl()}/chat`, {
    auth: { token },
    autoConnect: false,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
}

export function sendChatMessage(socket, payload, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error('Kết nối realtime chưa sẵn sàng.'));
      return;
    }

    socket.timeout(timeoutMs).emit('sendMessage', payload, (error, response) => {
      if (error) {
        reject(new Error('Không nhận được phản hồi realtime.'));
        return;
      }
      if (response?.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response);
    });
  });
}
