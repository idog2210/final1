export const SYSTEM_ROLES = ['user', 'admin', 'superadmin'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const REQUEST_TYPES = ['ENTRY_APPROVAL', 'BLACKENING', 'SHOS', 'MILITARY_ID_CODING'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_STATUSES = ['OPEN', 'APPROVED', 'REJECTED'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type User = {
  _id: string;
  name: string;
  personalNumber: string;
  email: string;
  bahadRole: string;
  systemRole: SystemRole;
  createdAt?: string;
  updatedAt?: string;
};

export type RequestItem = {
  _id: string;
  type: RequestType;
  title: string;
  reason: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: any;
  decidedBy?: any;
};

export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
};

export type ApiError = {
  status: 'error';
  message: string;
  details?: any;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
