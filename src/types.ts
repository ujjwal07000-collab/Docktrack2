export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: number;
}

export type DocumentStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadedBy: string; // User UID
  uploaderName: string;
  department: string;
  status: DocumentStatus;
  currentAssignee?: string; // User UID
  createdAt: number;
}

export interface WorkflowStage {
  id: string;
  documentId: string;
  stageName: string;
  assignedTo: string; // User UID
  status: DocumentStatus;
  updatedAt: number;
}

export interface DocumentLog {
  id: string;
  documentId: string;
  updatedBy: string; // User UID
  updaterName: string;
  action: 'Created' | 'Status Changed' | 'Assigned' | 'Forwarded' | 'Approved' | 'Rejected';
  details: string;
  timestamp: number;
}
