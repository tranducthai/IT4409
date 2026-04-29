import { mockUsers } from './mockUsers';

const roleFromEnv = (import.meta.env.VITE_MOCK_SESSION_ROLE ?? 'STUDENT').toUpperCase();
const allowedRoles = ['STUDENT', 'TEACHER', 'ADMIN'];

// Quick switch role by env value: STUDENT | TEACHER | ADMIN
export const mockSessionRole = allowedRoles.includes(roleFromEnv)
  ? roleFromEnv
  : 'STUDENT';

export const mockCurrentUser =
  mockUsers.find((user) => user.role === mockSessionRole) ?? mockUsers[0];
