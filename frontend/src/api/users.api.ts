import { http } from './http';
import { SystemRole, User } from '../types';

export const updateMe = async (payload: { name?: string; bahadRole?: string }): Promise<{ user: User }> => {
  return http<{ user: User }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const changeMyPassword = async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
  await http('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const listUsers = async (role?: 'user' | 'admin' | 'superadmin'): Promise<{ users: User[] }> => {
  const qs = role ? `?role=${encodeURIComponent(role)}` : '';
  return http<{ users: User[] }>(`/users${qs}`, { method: 'GET' });
};

export const getUserById = async (id: string): Promise<{ user: User }> => {
  return http<{ user: User }>(`/users/${encodeURIComponent(id)}`, { method: 'GET' });
};

export const updateUserById = async (id: string, payload: { name?: string; bahadRole?: string; systemRole?: SystemRole }): Promise<{ user: User }> => {
  return http<{ user: User }>(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};
