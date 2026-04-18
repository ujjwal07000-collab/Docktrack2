import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Document, DocumentLog, DocumentStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const docService = {
  // Create a new document tracking entry
  async uploadDocument(data: {
    title: string;
    description: string;
    fileUrl: string;
    department: string;
  }, userId: string, userName: string) {
    const docData = {
      ...data,
      uploadedBy: userId,
      uploaderName: userName,
      status: 'Submitted' as DocumentStatus,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'documents'), docData);
    
    // Log the initial creation
    await this.logActivity(docRef.id, userId, userName, 'Created', 'Document submitted for tracking');
    
    return docRef.id;
  },

  // Update document status/assignment
  async updateStatus(
    documentId: string, 
    status: DocumentStatus, 
    userId: string, 
    userName: string,
    details: string,
    assigneeId?: string
  ) {
    const docRef = doc(db, 'documents', documentId);
    const updates: any = { status };
    if (assigneeId) updates.currentAssignee = assigneeId;

    await updateDoc(docRef, updates);
    await this.logActivity(documentId, userId, userName, 'Status Changed', details);
  },

  // Log activity
  async logActivity(
    documentId: string, 
    userId: string, 
    userName: string, 
    action: DocumentLog['action'], 
    details: string
  ) {
    await addDoc(collection(db, 'documents', documentId, 'logs'), {
      documentId,
      updatedBy: userId,
      updaterName: userName,
      action,
      details,
      timestamp: Date.now()
    });
  }
};

export function useDocuments() {
  const { user, isAdmin, isManager } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    } else if (isManager) {
      q = query(
        collection(db, 'documents'), 
        where('department', '==', user.department),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'documents'), 
        where('uploadedBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin, isManager]);

  return { documents, loading };
}
