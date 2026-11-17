import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Filter,
  FileCheck,
  Calendar,
  User,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { uploadPdfDocument, getPatientDocuments, deletePdfDocument } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const PatientDocumentManager = ({ patientId, patientName = 'Patient' }) => {
  const { currentUser, isDoctor } = useAuth();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Medical Report');
  const [docNotes, setDocNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const CATEGORIES = [
    'Medical Report',
    'Dental X-Ray & Scan',
    'Prescription',
    'Treatment Plan',
    'Other Records'
  ];

  const fetchDocuments = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await getPatientDocuments(patientId, currentUser?.id, currentUser?.role);
      if (res && res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.warn('Error loading patient documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadError('');

    // 1. Validation: Only PDF files allowed
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (!isPdf) {
      setUploadError('Invalid file format. Only official PDF documents are accepted.');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validation: Max 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(`File exceeds maximum limit of 15MB. (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadFile(file);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;

        const payload = {
          base64Data,
          originalName: uploadFile.name,
          fileName: docTitle.trim() || uploadFile.name,
          category: docCategory,
          notes: docNotes.trim(),
          patientId,
          uploaderId: currentUser?.id,
          uploaderRole: currentUser?.role || 'Doctor',
          uploaderName: currentUser?.name || 'SmileCare Clinical Staff'
        };

        const res = await uploadPdfDocument(payload);
        if (res && res.success) {
          setSuccessMsg(`Document "${payload.fileName}" uploaded successfully!`);
          setShowUploadModal(false);
          setUploadFile(null);
          setDocTitle('');
          setDocNotes('');
          await fetchDocuments();
        } else {
          setUploadError(res?.error || 'Failed to upload document');
        }
        setUploading(false);
      };

      reader.onerror = () => {
        setUploadError('Failed to read PDF file data.');
        setUploading(false);
      };

      reader.readAsDataURL(uploadFile);
    } catch (err) {
      setUploadError(err.message);
      setUploading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!confirm(`Are you sure you want to delete "${docName}"?`)) return;

    try {
      const res = await deletePdfDocument(docId, currentUser?.id, currentUser?.role);
      if (res && res.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        alert(res?.error || 'Failed to delete document');
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filteredDocs = selectedCategory === 'ALL'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'Medical Report': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dental X-Ray & Scan': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Prescription': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Treatment Plan': return 'bg-tealbrand-50 text-tealbrand-700 border-tealbrand-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            PDF Documents & Clinical Records
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Diagnostic reports, panoramic X-rays, prescriptions, and treatment plans for {patientName}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchDocuments}
            disabled={loading}
            title="Refresh documents list"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setShowUploadModal(true);
              setUploadError('');
              setSuccessMsg('');
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF Document
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-black'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Records ({documents.length})
        </button>

        {CATEGORIES.map(cat => {
          const count = documents.filter(d => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs font-black'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading patient documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 p-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-700">No PDF documents in this category.</p>
          <p className="text-[11px] text-slate-400">Click "Upload PDF Document" above to attach dental scans, medical history, or prescriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocs.map(doc => (
            <div
              key={doc.id || doc._id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-soft hover:border-brand-200 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-slate-900 truncate leading-tight group-hover:text-brand-600 transition-colors">
                      {doc.fileName || doc.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{doc.fileSizeFormatted || doc.fileSize || 'PDF'}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt || doc.date || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 ${getCategoryBadgeColor(doc.category || doc.type)}`}>
                  {doc.category || doc.type}
                </span>
              </div>

              {doc.notes && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  {doc.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <div className="text-slate-500 font-medium truncate">
                  By: <strong className="text-slate-700">{doc.uploadedBy || 'Clinical Staff'}</strong>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`/api/documents/download/${doc.id}?requesterId=${currentUser?.id}&requesterRole=${currentUser?.role}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-tealbrand-600 hover:bg-tealbrand-50 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {(isDoctor || currentUser?.role === 'Staff' || doc.uploaderId === currentUser?.id) && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.fileName || doc.name)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PDF MODAL */}
      {showUploadModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          title="Upload Patient PDF Document"
          subtitle={`Securely attach clinical records for ${patientName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* File Selection Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Select PDF File (Max 15MB)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  uploadFile 
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900' 
                    : 'border-slate-300 hover:border-brand-400 bg-slate-50/60 hover:bg-white text-slate-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="w-8 h-8 mx-auto mb-2 text-brand-600" />
                {uploadFile ? (
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{uploadFile.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-brand-600">Click to choose PDF</span> or drag and drop here
                    <p className="text-[10px] text-slate-400 mt-1">Accepts diagnostic scans, blood reports, and clinical prescriptions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Document Title / Name
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. OPG Panoramic Scan - Upper Jaw"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Notes / Findings (Optional)
              </label>
              <textarea
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Tooth #16 periapical radiolucency observed"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload PDF Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PDF PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{previewDoc.fileName || previewDoc.name}</h4>
                  <p className="text-xs text-slate-500">
                    {previewDoc.category} • {previewDoc.fileSizeFormatted || 'PDF'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/documents/download/${previewDoc.id}?requesterId=${currentUser?.id}&requesterRole=${currentUser?.role}`}
                  download
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF View with safe stream */}
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={`/api/documents/view/${previewDoc.id}?requesterId=${currentUser?.id}&requesterRole=${currentUser?.role}#toolbar=1`}
                title={previewDoc.fileName}
                className="w-full h-full rounded-2xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
