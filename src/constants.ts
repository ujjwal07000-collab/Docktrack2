import { UserRole, DocumentStatus } from './types';

export const DEPARTMENTS = [
  'General',
  'HR',
  'Finance',
  'Legal',
  'Operations',
  'IT',
  'Sales',
  'Marketing'
];

export const ROLES: UserRole[] = ['employee', 'manager', 'admin'];

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  'Submitted': 'bg-blue-100 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-100 text-amber-700 border-amber-200',
  'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-rose-100 text-rose-700 border-rose-200'
};
