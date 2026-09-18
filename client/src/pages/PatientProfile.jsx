import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Calendar, 
  Stethoscope, 
  ArrowLeft,
  Image as ImageIcon,
  Camera,
  Edit3,
  Pencil,
  MapPin,
  Save,
  Check,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/common/Modal';

const getPatientRegistrationMessage = (p) => {
  const patientName = p?.name || '';
  const patientId = p?.id || p?.patientId || p?._id || '';

  return [
    `வணக்கம் ${patientName} அவர்களே! 👋`,
    ``,
    `🦷 SmileCare Dental Clinic-க்கு உங்களை வரவேற்கிறோம்!`,
    ``,
    `உங்கள் patient registration வெற்றிகரமாக முடிந்துவிட்டது. ✅`,
    ``,
    `📋 Patient ID: ${patientId}`,
    ``,
    `உங்கள் dental care-ஐ சிறப்பாக கவனித்துக்கொள்ள SmileCare குழு எப்போதும் தயாராக உள்ளது. 💙`,
    ``,
    `SmileCare Dental Clinic`,
    `Your Smile, Our Care!`
  ].join('\n');
};

export const PatientProfile = ({ patient, onBack, onBookAppointment, onStartConsultation, onCreateInvoice }) => {
  const { consultations, invoices, dentalCharts, addPatientDocument, updatePatient, showToast } = useData();
  const [activeTab, setActiveTab] = useState('medical');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('X-Ray');
  const [docUrl, setDocUrl] = useState('');

  // Local synced patient state
  const [currentPatient, setCurrentPatient] = useState(patient);
  const [currentAvatar, setCurrentAvatar] = useState(patient?.avatar || '');
  const patientPhotoInputRef = useRef(null);

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('Female');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('B+');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editMedicalHistory, setEditMedicalHistory] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editDentalHistory, setEditDentalHistory] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (patient) {
      setCurrentPatient(patient);
      if (patient.avatar) {
        setCurrentAvatar(patient.avatar);
      }
    }
  }, [patient]);

  if (!patient || !currentPatient) return null;

  const currentPatientId = currentPatient.id || currentPatient._id || currentPatient.patientId || '';
  const patientConsultations = (consultations || []).filter(c => c.patientId === currentPatientId || (currentPatient.id && c.patientId === currentPatient.id) || (currentPatient._id && c.patientId === currentPatient._id));
  const patientInvoices = (invoices || []).filter(i => i.patientId === currentPatientId || (currentPatient.id && i.patientId === currentPatient.id) || (currentPatient._id && i.patientId === currentPatient._id));

  const handleOpenEditModal = () => {
    setEditName(currentPatient.name || '');
    setEditAge(currentPatient.age?.toString() || '');
    setEditGender(currentPatient.gender || 'Female');
    setEditPhone(currentPatient.phone || '');
    setEditEmail(currentPatient.email || '');
    setEditBloodGroup(currentPatient.bloodGroup || 'B+');
    setEditEmergencyContact(currentPatient.emergencyContact || '');
    setEditAddress(currentPatient.address || '');
    setEditStatus(currentPatient.status || 'Active');

    const medArr = Array.isArray(currentPatient.medicalHistory)
      ? currentPatient.medicalHistory
      : (currentPatient.medicalHistory ? [currentPatient.medicalHistory] : []);
    setEditMedicalHistory(medArr.join(', '));

    const algArr = Array.isArray(currentPatient.allergies)
      ? currentPatient.allergies
      : (currentPatient.allergies ? [currentPatient.allergies] : []);
    setEditAllergies(algArr.join(', '));

    const dntArr = Array.isArray(currentPatient.dentalHistory)
      ? currentPatient.dentalHistory
      : (currentPatient.dentalHistory ? [currentPatient.dentalHistory] : []);
    setEditDentalHistory(dntArr.join(', '));

    setEditNotes(currentPatient.notes || '');
    setShowEditModal(true);
  };

  const handleToggleConditionTag = (tag) => {
    const existing = editMedicalHistory ? editMedicalHistory.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (existing.includes(tag)) {
      setEditMedicalHistory(existing.filter(t => t !== tag).join(', '));
    } else {
      setEditMedicalHistory([...existing, tag].join(', '));
    }
  };

  const handleToggleAllergyTag = (tag) => {
    const existing = editAllergies ? editAllergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (existing.includes(tag)) {
      setEditAllergies(existing.filter(t => t !== tag).join(', '));
    } else {
      setEditAllergies([...existing, tag].join(', '));
    }
  };

  const handleSavePatientEdit = (e) => {
    e.preventDefault();
    const medArr = editMedicalHistory ? editMedicalHistory.split(',').map(s => s.trim()).filter(Boolean) : [];
    const algArr = editAllergies ? editAllergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    const dntArr = editDentalHistory ? editDentalHistory.split(',').map(s => s.trim()).filter(Boolean) : [];

    const updatedData = {
      name: editName.trim() || currentPatient.name,
      age: parseInt(editAge) || currentPatient.age || 30,
      gender: editGender,
      phone: editPhone.trim() || currentPatient.phone,
      email: editEmail.trim(),
      bloodGroup: editBloodGroup,
      emergencyContact: editEmergencyContact.trim(),
      address: editAddress.trim(),
      status: editStatus,
      medicalHistory: medArr,
      allergies: algArr,
      dentalHistory: dntArr,
      notes: editNotes.trim()
    };

    updatePatient(currentPatientId, updatedData);
    setCurrentPatient(prev => ({ ...prev, ...updatedData }));
    setShowEditModal(false);
  };

  const handleOpenWhatsApp = (e) => {
    e.preventDefault();
    const msg = getPatientRegistrationMessage(patient);
    const cleanPhone = (patient.phone || '').replace(/[^0-9]/g, '');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    if (showToast) {
      showToast('Opening WhatsApp... (Message copied to clipboard)');
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePatientPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          setCurrentAvatar(webpDataUrl);
          updatePatient(currentPatientId, { avatar: webpDataUrl });
        } catch (err) {
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCurrentAvatar(jpegDataUrl);
          updatePatient(currentPatientId, { avatar: jpegDataUrl });
        }
        if (showToast) showToast(`Updated photo for ${patient.name}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    addPatientDocument(currentPatientId, {
      id: `doc_${Date.now()}`,
      name: docName,
      type: docType,
      date: new Date().toISOString().split('T')[0],
      url: docUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80'
    });
    setDocName('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Directory
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-1.5 bg-white text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-xl text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Edit Patient Details"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-600" /> Edit Profile
          </button>
          <button
            onClick={() => onBookAppointment(currentPatient)}
            className="px-3.5 py-1.5 bg-tealbrand-50 text-tealbrand-700 hover:bg-tealbrand-100 rounded-xl text-xs font-bold border border-tealbrand-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Appointment
          </button>
          <button
            onClick={() => onStartConsultation(currentPatient)}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Start Consultation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Hidden File Input for Patient Photo */}
          <input
            type="file"
            ref={patientPhotoInputRef}
            accept="image/*"
            onChange={handlePatientPhotoUpload}
            className="hidden"
            id="patient-photo-input"
          />

          <div className="flex items-start gap-4">
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => patientPhotoInputRef.current?.click()}
              title="Click to update patient photo"
            >
              {(currentAvatar || currentPatient.avatar) ? (
                <img
                  src={currentAvatar || currentPatient.avatar}
                  alt={currentPatient.name}
                  onError={() => setCurrentAvatar('')}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md ring-2 ring-brand-500/30 group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 text-white font-black text-2xl flex items-center justify-center shadow-md group-hover:opacity-90 transition-all">
                  {(currentPatient.name || 'P').split(' ').map(n => n[0]).join('')}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5" />
              </div>

              <button 
                type="button" 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-900/90 hover:bg-brand-600 text-white border border-white flex items-center justify-center shadow transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  patientPhotoInputRef.current?.click();
                }}
                title="Change Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentPatient.name}</h1>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                  title="Quick Edit Profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  Blood Group: {currentPatient.bloodGroup || 'N/A'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                  currentPatient.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentPatient.status === 'In Treatment'
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : currentPatient.status === 'Completed'
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {currentPatient.status || 'Active'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-3">
                <span>ID: <strong className="text-slate-800">{currentPatientId}</strong></span>
                <span>•</span>
                <span>{currentPatient.gender}, {currentPatient.age} years</span>
                <span>•</span>
                <span>Joined {currentPatient.joinedDate || 'Recently'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-2 font-bold text-emerald-700 hover:underline cursor-pointer"
              title="Open WhatsApp Chat"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> {currentPatient.phone} (WhatsApp 💬)
            </button>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {currentPatient.email || 'No email provided'}
            </div>
            {currentPatient.address && (
              <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium max-w-xs truncate" title={currentPatient.address}>
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {currentPatient.address}
              </div>
            )}
            <div className="text-[11px] text-rose-600 font-bold pt-1 border-t border-slate-200">
              Emergency: {currentPatient.emergencyContact || 'None provided'}
            </div>
          </div>
        </div>

        {currentPatient.allergies && currentPatient.allergies.length > 0 && (
          <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Medical Alerts & Allergies: <span className="underline">{currentPatient.allergies.join(', ')}</span></span>
          </div>
        )}
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs space-x-1 overflow-x-auto">
        {[
          { id: 'medical', label: 'Medical & Dental History' },
          { id: 'treatments', label: 'Treatment History & Consultations' },
          { id: 'invoices', label: 'Billing Ledger & Invoices' },
          { id: 'documents', label: 'X-Rays & Uploaded Docs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'medical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-brand-600" /> General Medical Conditions
              </h4>
              <button
                onClick={handleOpenEditModal}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {currentPatient.medicalHistory && currentPatient.medicalHistory.length > 0 ? (
                currentPatient.medicalHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>• {item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No medical conditions reported</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-tealbrand-600" /> Past Dental History
              </h4>
              <button
                onClick={handleOpenEditModal}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {currentPatient.dentalHistory && currentPatient.dentalHistory.length > 0 ? (
                currentPatient.dentalHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    • {item}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No previous dental procedures recorded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Past Clinical Consultations ({patientConsultations.length})
          </h4>
          {patientConsultations.length > 0 ? (
            <div className="space-y-4">
              {patientConsultations.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                    <span>Consultation #{c.id}</span>
                    <span className="text-slate-500 font-normal">{c.date}</span>
                  </div>
                  <div><strong className="text-slate-700">Chief Complaint:</strong> {c.chiefComplaint}</div>
                  <div><strong className="text-slate-700">Diagnosis:</strong> {c.diagnosis}</div>
                  <div><strong className="text-slate-700">Treatment Plan:</strong> {c.treatmentPlan}</div>
                  {c.procedureNotes && <div><strong className="text-slate-700">Procedure Notes:</strong> {c.procedureNotes}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No past consultation records</p>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Patient Invoices & Payment Ledger ({patientInvoices.length})
            </h4>
            <button
              onClick={() => onCreateInvoice(currentPatient)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 cursor-pointer"
            >
              + Create Invoice
            </button>
          </div>
          {patientInvoices.length > 0 ? (
            <div className="space-y-3">
              {patientInvoices.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-extrabold text-slate-900">{inv.id} • {inv.date}</div>
                    <div className="text-slate-500 text-[11px]">Total: ₹{inv.totalAmount} • Paid: ₹{inv.paidAmount}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs border ${inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                    {inv.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No invoices issued yet</p>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Diagnostic X-Rays & Attached Files
            </h4>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold border border-brand-200 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentPatient.documents && currentPatient.documents.length > 0 ? (
              currentPatient.documents.map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 group">
                  <img
                    src={doc.url}
                    alt={doc.name}
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 group-hover:scale-[1.02] transition-transform"
                  />
                  <div className="text-xs font-bold text-slate-900 truncate">{doc.name}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>{doc.type}</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-xs text-slate-400">
                No uploaded X-Ray or lab document. Click Upload Document above.
              </div>
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          title="Upload Patient Document / X-Ray"
          subtitle="Add panoramic OPG, periapical X-Ray, or blood lab report"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="E.g., OPG Panoramic X-Ray"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="X-Ray">X-Ray Image</option>
                <option value="Lab Report">Lab Report</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Consent Form">Consent Form</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Image / File URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow cursor-pointer"
              >
                Upload File
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT PATIENT PROFILE MODAL */}
      {showEditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title={`Update Profile: ${currentPatient.name}`}
          subtitle={`Patient ID: ${currentPatientId} • Edit demographics, contact, emergency & medical info`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSavePatientEdit} className="space-y-5">
            {/* Section 1: Demographics & Core Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <UserCheck className="w-4 h-4 text-brand-600" /> Patient Demographics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="Patient Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="Age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Treatment Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Active">Active</option>
                    <option value="In Treatment">In Treatment</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Emergency */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Phone className="w-4 h-4 text-emerald-600" /> Contact & Emergency Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="+91 98401 23456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="patient@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="Spouse / Parent: +91 98401 00000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="Area, Chennai, Tamil Nadu"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical Conditions & Quick Tags */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Medical History & Clinical Conditions
              </h4>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">General Medical Conditions (Comma separated)</label>
                <input
                  type="text"
                  value={editMedicalHistory}
                  onChange={(e) => setEditMedicalHistory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  placeholder="E.g., Hypertension, Type 2 Diabetes, Asthma"
                />
                {/* Quick Toggle Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Quick Select:</span>
                  {[
                    'Hypertension',
                    'Type 2 Diabetes',
                    'Asthma',
                    'Cardiac Condition',
                    'Bleeding Disorder',
                    'Thyroid Disorder',
                    'Pregnant / Lactating'
                  ].map((tag) => {
                    const isSelected = (editMedicalHistory || '').toLowerCase().includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleConditionTag(tag)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Drug / Dental Allergies & Alerts</label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  placeholder="E.g., Penicillin Allergy, Latex Allergy"
                />
                {/* Quick Toggle Pills for Allergies */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Common Allergies:</span>
                  {[
                    'Penicillin Allergy',
                    'Local Anesthetic Allergy',
                    'Latex Allergy',
                    'Sulfa Drugs Allergy',
                    'Aspirin / NSAIDs Allergy'
                  ].map((alg) => {
                    const isSelected = (editAllergies || '').toLowerCase().includes(alg.toLowerCase());
                    return (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => handleToggleAllergyTag(alg)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{alg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Past Dental History & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Past Dental History</label>
                  <input
                    type="text"
                    value={editDentalHistory}
                    onChange={(e) => setEditDentalHistory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="E.g., Previous RCT #14, Scaling done"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Clinical / Doctor Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                    placeholder="Special preferences or instructions"
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
