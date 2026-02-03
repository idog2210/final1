import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class HttpError extends Error {
  statusCode: number;
  details: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const http = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  let body: ApiResponse<any> | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new HttpError('Unauthorized', 401, body);
  }

  if (!res.ok) {
    const msg = body && 'message' in body ? body.message : 'Request failed';
    throw new HttpError(msg, res.status, body);
  }

  if (body && body.status === 'error') {
    throw new HttpError(body.message, res.status, body.details);
  }

  return (body?.data ?? body) as T;
};
