import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  MessageSquareText, 
  Shield, 
  RefreshCw, 
  Trash2,
  Cloud,
  Database,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { downloadJSON } from '../utils/exportUtils';
import { ClinicClosureModal } from '../components/appointments/ClinicClosureModal';

export const Settings = () => {
  const { 
    clinicProfile, 
    updateClinicProfile, 
    restoreDatabase, 
    resetToSeed, 
    clearAllData, 
    rawDb, 
    cloudSyncStatus, 
    syncToCloud, 
    showToast,
    patients,
    appointments,
    consultations,
    invoices,
    sendClinicClosedEmail
  } = useData();

  const [name, setName] = useState(clinicProfile.name);
  const [tagline, setTagline] = useState(clinicProfile.tagline);
  const [address, setAddress] = useState(clinicProfile.address);
  const [phone, setPhone] = useState(clinicProfile.phone);
  const [email, setEmail] = useState(clinicProfile.email);
  const [registrationNo, setRegistrationNo] = useState(clinicProfile.registrationNo);
  const [defaultConsultationFee, setDefaultConsultationFee] = useState(clinicProfile.defaultConsultationFee);
  const [whatsAppPhoneNumber, setWhatsAppPhoneNumber] = useState(clinicProfile.whatsAppPhoneNumber);
  const [clinicStatus, setClinicStatus] = useState(clinicProfile.clinicStatus || 'Open');
  const [closedReason, setClosedReason] = useState(clinicProfile.closedReason || 'Doctor Emergency Leave / Public Holiday');
  const [reopenDate, setReopenDate] = useState(clinicProfile.reopenDate || 'Tomorrow 9:00 AM');
  const [autoEmailOnClosure, setAutoEmailOnClosure] = useState(clinicProfile.autoEmailOnClosure !== false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleTestSendMail = async () => {
    setIsSendingTestMail(true);
    try {
      const res = await sendClinicClosedEmail({
        patientEmail: email || 'chennai@smilecare.in',
        patientName: 'Test Patient (Admin Verification)',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        reason: closedReason,
        reopenDate: reopenDate
      });
      if (res && res.success) {
        if (showToast) showToast(`✅ Test email processed! Delivered to ${email || 'chennai@smilecare.in'}`);
      } else {
        alert(`Test email notice: ${res?.error || 'Email error'}`);
      }
    } catch (err) {
      alert(`Test email failed: ${err.message}`);
    } finally {
      setIsSendingTestMail(false);
    }
  };

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    const result = await syncToCloud();
    setIsSyncingCloud(false);
    if (result && result.success) {
      if (showToast) showToast('All clinic data successfully synchronized to MongoDB Atlas Cloud!');
    } else {
      alert(`Cloud sync warning: ${result?.error || 'Could not connect to MongoDB server.'}`);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateClinicProfile({
      name,
      tagline,
      address,
      phone,
      email,
      registrationNo,
      defaultConsultationFee: parseFloat(defaultConsultationFee) || 500,
      whatsAppPhoneNumber,
      clinicStatus,
      closedReason,
      reopenDate,
      autoEmailOnClosure
    });
    if (showToast) showToast('Clinic settings & operational status saved successfully!');
  };

  const handleExportBackup = () => {
    downloadJSON(rawDb, `SmileCare_Backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        restoreDatabase(json);
      } catch (err) {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600" /> Clinic Settings & System Config
        </h2>
        <p className="text-xs text-slate-500">Manage clinic profile, WhatsApp API configuration, fees, and database backups</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Clinic Master Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Clinic Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Registration #</label>
              <input
                type="text"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-tealbrand-600" /> WhatsApp API & Consultation Fees
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">WhatsApp Business Phone</label>
              <input
                type="text"
                value={whatsAppPhoneNumber}
                onChange={(e) => setWhatsAppPhoneNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Default Consultation Fee (₹)</label>
              <input
                type="number"
                value={defaultConsultationFee}
                onChange={(e) => setDefaultConsultationFee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Clinic Operational Status & Automated Email Closure System */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-600" /> Clinic Operational Status & Email Closure System
              </h3>
              <p className="text-xs text-slate-500">Automatically send email notifications to patients when the clinic is closed or on emergency leave</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClosureModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast Closure Email
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Current Operating Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClinicStatus('Open')}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center ${
                    clinicStatus === 'Open'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🟢 Open (Normal Operations)
                </button>
                <button
                  type="button"
                  onClick={() => setClinicStatus('Closed')}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center ${
                    clinicStatus === 'Closed'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🔴 Closed (Leave / Holiday)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Expected Reopening Time</label>
              <input
                type="text"
                value={reopenDate}
                onChange={(e) => setReopenDate(e.target.value)}
                placeholder="e.g. Tomorrow 9:00 AM"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Reason for Clinic Closure</label>
            <input
              type="text"
              value={closedReason}
              onChange={(e) => setClosedReason(e.target.value)}
              placeholder="e.g. Doctor Emergency Leave / Public Holiday"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoEmailClosureCheckbox"
                checked={autoEmailOnClosure}
                onChange={(e) => setAutoEmailOnClosure(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="autoEmailClosureCheckbox" className="font-bold text-slate-800 cursor-pointer">
                Automatically email scheduled patients when clinic status is set to Closed
              </label>
            </div>

            <button
              type="button"
              disabled={isSendingTestMail}
              onClick={handleTestSendMail}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
            >
              {isSendingTestMail ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-brand-600" /> Send Test Closure Email
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Clinic Settings
          </button>
        </div>
      </form>

      {/* MongoDB Atlas Cloud Database Sync Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-brand-600" /> MongoDB Atlas Cloud Database & Live Sync
            </h3>
            <p className="text-xs text-slate-500">Real-time persistence and multi-device sharing across MongoDB Atlas Cluster</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${
              cloudSyncStatus?.connected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${cloudSyncStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {cloudSyncStatus?.connected ? 'Connected to MongoDB Atlas' : 'Local Storage Cache (Auto-Sync)'}
            </span>
          </div>
        </div>

        {/* Database & Cloud Information Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Name</span>
            <span className="font-extrabold text-slate-800 font-mono text-xs">smilecare</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Patients</span>
            <span className="font-extrabold text-brand-600 text-xs">{patients?.length || 0} Records</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultations & Invoices</span>
            <span className="font-extrabold text-tealbrand-600 text-xs">{(consultations?.length || 0) + (invoices?.length || 0)} Records</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Synced</span>
            <span className="font-extrabold text-slate-700 text-xs">{cloudSyncStatus?.lastSync || 'Just now'}</span>
          </div>
        </div>

        {/* Sync Action Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 All modifications made in SmileCare automatically sync to MongoDB Atlas in real-time. You can also manually trigger a complete database push.
          </p>

          <button
            type="button"
            onClick={handleManualCloudSync}
            disabled={isSyncingCloud}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 shrink-0 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Syncing to Atlas Cloud...' : 'Sync All Data to MongoDB Atlas Now'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" /> Database Backup, Export & System Restore
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportBackup}
            className="p-4 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-2xl text-left text-xs font-bold text-brand-700 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="block font-black text-sm">Download JSON Backup</span>
              <span className="text-[10px] font-normal text-slate-500">Export full database dump</span>
            </div>
            <Download className="w-5 h-5 text-brand-600" />
          </button>

          <label className="p-4 bg-tealbrand-50 hover:bg-tealbrand-100 border border-tealbrand-200 rounded-2xl text-left text-xs font-bold text-tealbrand-700 transition-colors flex items-center justify-between cursor-pointer">
            <div>
              <span className="block font-black text-sm">Restore JSON Backup</span>
              <span className="text-[10px] font-normal text-slate-500">Upload JSON backup file</span>
            </div>
            <Upload className="w-5 h-5 text-tealbrand-600" />
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to remove all patients, appointments, consultations, and invoices? This action cannot be undone unless you have a backup.')) {
                clearAllData();
              }
            }}
            className="p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left text-xs font-bold text-rose-700 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="block font-black text-sm">Remove All Data</span>
              <span className="text-[10px] font-normal text-slate-500">Wipe all records & reset app</span>
            </div>
            <Trash2 className="w-5 h-5 text-rose-600" />
          </button>
        </div>
      </div>

      {showClosureModal && (
        <ClinicClosureModal
          isOpen={true}
          onClose={() => setShowClosureModal(false)}
        />
      )}
    </div>
  );
};
