import { http } from './http';
import { User } from '../types';

export type AuthPayload = { token: string; user: User };

export const register = async (payload: { name: string; personalNumber: string; email: string; password: string; bahadRole: string }): Promise<AuthPayload> => {
  return http<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const login = async (payload: { email: string; password: string }): Promise<AuthPayload> => {
  return http<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const me = async (): Promise<{ user: User }> => {
  return http<{ user: User }>('/users/me', { method: 'GET' });
};

export const forgotPassword = async (payload: { email: string }): Promise<{ devResetToken?: string; message?: string; status?: string }> => {
  return http<any>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const resetPassword = async (payload: { token: string; newPassword: string }): Promise<{ message?: string; status?: string }> => {
  return http<any>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
