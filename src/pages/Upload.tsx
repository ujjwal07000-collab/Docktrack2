import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { docService } from '../services/docService';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants';
import { ArrowLeft, Upload as UploadIcon, FileText, Info } from 'lucide-react';

export function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: user?.department || 'General',
    fileUrl: 'https://picsum.photos/seed/document/800/600' // Mock file URL for demo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const docId = await docService.uploadDocument(formData, user.uid, user.username);
      navigate(`/document/${docId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Upload New Document</h1>
          <p className="text-slate-500 mt-1">Initiate a new document tracking workflow</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Document Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="e.g. Q1 Budget Report, Marketing Strategy v1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                placeholder="Briefly describe the purpose of this document..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Department</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment URL (Demo)</label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none opacity-60 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100 mt-4">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              The document will be submitted to the <span className="font-bold">{formData.department}</span> department for initial review.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  Submit Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
