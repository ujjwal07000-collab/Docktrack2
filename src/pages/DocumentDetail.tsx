import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { docService } from '../services/docService';
import { useAuth } from '../context/AuthContext';
import { Document, DocumentLog, DocumentStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, cn } from '../lib/utils';
import { 
  ArrowLeft, 
  FileText, 
  History, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Send,
  Calendar,
  Building2,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useAuth();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [logs, setLogs] = useState<DocumentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Listen to document changes
    const unsubDoc = onSnapshot(doc(db, 'documents', id), (snap) => {
      if (snap.exists()) {
        setDocument({ id: snap.id, ...snap.data() } as Document);
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    // Listen to logs
    const logsQuery = query(collection(db, 'documents', id, 'logs'), orderBy('timestamp', 'desc'));
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentLog)));
    });

    return () => {
      unsubDoc();
      unsubLogs();
    };
  }, [id, navigate]);

  const handleAction = async (newStatus: DocumentStatus, actionLabel: DocumentLog['action']) => {
    if (!id || !user || !document) return;
    
    setActionLoading(true);
    try {
      await docService.updateStatus(id, newStatus, user.uid, user.username, comment || `Status updated to ${newStatus}`, user.role === 'manager' ? user.uid : undefined);
      setComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading document details...</div>;
  if (!document) return <div className="text-center py-20">Document not found</div>;

  const canApprove = (isManager && user?.department === document.department) || isAdmin;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-start">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
           <a 
            href={document.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View File
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <StatusBadge status={document.status} className="mb-4 text-sm px-3 py-1" />
                <h1 className="text-3xl font-bold text-slate-900">{document.title}</h1>
              </div>
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl mb-8">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Submitted By</p>
                  <p className="font-medium text-slate-900">{document.uploaderName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Department</p>
                  <p className="font-medium text-slate-900">{document.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Submitted On</p>
                  <p className="font-medium text-slate-900">{formatDate(document.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Document ID</p>
                  <p className="font-mono text-xs text-slate-600">DOC-{document.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{document.description}</p>
            </div>
          </div>

          {/* Action Pane */}
          {canApprove && (
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-8 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Workflow Actions
              </h2>
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Comments or Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment about this action..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  rows={3}
                />
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => handleAction('Approved', 'Approved')}
                    disabled={actionLoading || document.status === 'Approved'}
                    className="flex-1 min-w-[150px] py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction('Rejected', 'Rejected')}
                    disabled={actionLoading || document.status === 'Rejected'}
                    className="flex-1 min-w-[150px] py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction('Under Review', 'Status Changed')}
                    disabled={actionLoading || document.status === 'Under Review'}
                    className="flex-1 min-w-[150px] py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100 disabled:opacity-50"
                  >
                    <History className="w-5 h-5" />
                    Mark Under Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - History Logs */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Movement History
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative border-l-2 border-slate-100 ml-3 py-2 space-y-8">
                {logs.map((log, idx) => (
                  <div key={log.id} className="relative pl-8">
                    <div className={cn(
                      "absolute -left-3 top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10",
                      log.action === 'Created' ? "bg-indigo-500" : 
                      log.action === 'Approved' ? "bg-emerald-500" :
                      log.action === 'Rejected' ? "bg-rose-500" : "bg-amber-500"
                    )}>
                      {log.action === 'Approved' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {formatDate(log.timestamp)}
                      </p>
                      <h4 className="font-bold text-slate-900">{log.action}</h4>
                      <p className="text-sm text-slate-600 my-1">{log.details}</p>
                      <p className="text-xs text-slate-500 italic">by {log.updaterName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
