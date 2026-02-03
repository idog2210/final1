import { http } from './http';
import { RequestItem, RequestStatus, RequestType } from '../types';

export const createRequest = async (payload: { type: RequestType; title: string; reason: string }): Promise<{ request: RequestItem }> => {
  return http<{ request: RequestItem }>('/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getMyRequests = async (status?: RequestStatus | 'CLOSED' | 'ALL'): Promise<{ requests: RequestItem[] }> => {
  const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  return http<{ requests: RequestItem[] }>(`/requests/my${qs}`, { method: 'GET' });
};

export const getRequestById = async (id: string): Promise<{ request: RequestItem }> => {
  return http<{ request: RequestItem }>(`/requests/${encodeURIComponent(id)}`, { method: 'GET' });
};
