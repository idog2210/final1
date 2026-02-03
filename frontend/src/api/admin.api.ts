import { http } from './http';
import { RequestItem, RequestType, SystemRole, User } from '../types';

export const getAdminRequests = async (params?: { status?: 'OPEN' | 'CLOSED'; page?: number; type?: string; userId?: string; date?: string }): Promise<{ requests: RequestItem[] }> => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.type) qs.set('type', params.type);
  if (params?.userId) {
    const clean = String(params.userId).trim();
    if (clean) qs.set('userId', clean);
  }

  if (params?.date) {
    const d = String(params.date).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      qs.set('from', `${d}T00:00:00.000`);
      qs.set('to', `${d}T23:59:59.999`);
    }
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return http<{ requests: RequestItem[] }>(`/admin/requests${suffix}`, { method: 'GET' });
};

export const decideRequest = async (payload: { id: string; decision: 'APPROVE' | 'REJECT'; rejectionReason?: string }): Promise<{ request: RequestItem }> => {
  return http<{ request: RequestItem }>(`/admin/requests/${encodeURIComponent(payload.id)}/decide`, {
    method: 'PATCH',
    body: JSON.stringify({
      decision: payload.decision,
      rejectionReason: payload.rejectionReason,
    }),
  });
};

export const adminUpdateUser = async (payload: { id: string; name?: string; bahadRole?: string; systemRole?: SystemRole }): Promise<{ user: User }> => {
  return http<{ user: User }>(`/admin/users/${encodeURIComponent(payload.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: payload.name,
      bahadRole: payload.bahadRole,
      systemRole: payload.systemRole,
    }),
  });
};
