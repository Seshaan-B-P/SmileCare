import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import {
  Mail,
  AlertTriangle,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

const PRESET_REASONS = [
  'Doctor on Emergency Medical Leave',
  'Public Holiday / Festival',
  'Weekly Holiday (Clinic Off)',
  'Clinic Renovation & Sterilization Maintenance',
  'Severe Weather / Emergency Closure'
];

export const ClinicClosureModal = ({ isOpen, onClose, initialDate = null }) => {
  const {
    clinicProfile,
    appointments,
    patients,
    toggleClinicStatus,
    notifyPatientsOfClosure,
    sendClinicClosedEmail,
    showToast
  } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
  const [status, setStatus] = useState(clinicProfile?.clinicStatus || 'Closed');
  const [reason, setReason] = useState(clinicProfile?.closedReason || PRESET_REASONS[0]);
  const [reopenDate, setReopenDate] = useState(clinicProfile?.reopenDate || 'Tomorrow 9:00 AM');
  const [customNote, setCustomNote] = useState('');
  const [previewLang, setPreviewLang] = useState('ta'); // 'ta' | 'en'

  // Affected appointments on the selected closure date
  const dayAppointments = (appointments || []).filter(
    a => a.date === selectedDate && a.status !== 'Cancelled'
  );

  // Map patient emails
  const patientEmailMap = {};
  (patients || []).forEach(p => {
    if (p.email) patientEmailMap[p.id] = p.email;
  });

  const [selectedAptIds, setSelectedAptIds] = useState(() =>
    dayAppointments.map(a => a.id)
  );

  const [isSending, setIsSending] = useState(false);
  const [sendReport, setSendReport] = useState(null);

  const toggleSelectAll = () => {
    if (selectedAptIds.length === dayAppointments.length) {
      setSelectedAptIds([]);
    } else {
      setSelectedAptIds(dayAppointments.map(a => a.id));
    }
  };

  const toggleAptSelect = (aptId) => {
    setSelectedAptIds(prev =>
      prev.includes(aptId) ? prev.filter(id => id !== aptId) : [...prev, aptId]
    );
  };

  const handleApplyAndNotify = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendReport(null);

    try {
      // 1. Update clinic status if setting to Closed
      await toggleClinicStatus(status, reason, reopenDate, false, selectedDate);

      // 2. Dispatch emails to selected patients
      if (status === 'Closed' && selectedAptIds.length > 0) {
        const targetPatientIds = dayAppointments
          .filter(a => selectedAptIds.includes(a.id))
          .map(a => a.patientId);

        const result = await notifyPatientsOfClosure({
          date: selectedDate,
          reason,
          reopenDate,
          customNote,
          patientIds: targetPatientIds
        });

        setSendReport(result);
        if (showToast) {
          showToast(`✉️ Closure emails sent to ${result?.sentCount || 0} patient(s)!`);
        }
      } else {
        if (showToast) {
          showToast(`Clinic status updated to "${status}"!`);
        }
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      alert(`Error updating closure notice: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clinic Closure & Patient Email Notification"
      subtitle="Mark clinic closed and automatically notify scheduled patients via Email"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleApplyAndNotify} className="space-y-5">
        {/* Status Mode Switcher */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Clinic Operational Mode</span>
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatus('Open')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${status === 'Open'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              🟢 Open
            </button>
            <button
              type="button"
              onClick={() => setStatus('Closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${status === 'Closed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              🔴 Closed (Holiday / Leave)
            </button>
          </div>
        </div>

        {/* Date and Reason Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Closure Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                const nextApts = (appointments || []).filter(a => a.date === e.target.value && a.status !== 'Cancelled');
                setSelectedAptIds(nextApts.map(a => a.id));
              }}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Expected Reopening
            </label>
            <input
              type="text"
              value={reopenDate}
              onChange={(e) => setReopenDate(e.target.value)}
              placeholder="e.g. Tomorrow 9:00 AM"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              required={status === 'Closed'}
            />
          </div>
        </div>

        {/* Preset Reasons Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Reason for Clinic Closure
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_REASONS.map(r => (
              <button
                type="button"
                key={r}
                onClick={() => setReason(r)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${reason === r
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Custom reason..."
            className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
            required={status === 'Closed'}
          />
        </div>

        {/* Affected Appointments Table */}
        <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              Scheduled Patients on {selectedDate} ({dayAppointments.length})
            </span>
            {dayAppointments.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                {selectedAptIds.length === dayAppointments.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {dayAppointments.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              No appointments are scheduled on {selectedDate}. No patients need notification.
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {dayAppointments.map(apt => {
                const patEmail = patientEmailMap[apt.patientId] || apt.patientEmail;
                const isSelected = selectedAptIds.includes(apt.id);

                return (
                  <div
                    key={apt.id}
                    onClick={() => toggleAptSelect(apt.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${isSelected
                      ? 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 opacity-60'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {apt.patientName} <span className="text-[10px] text-slate-400 font-normal">({apt.timeSlot})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {patEmail ? (
                            <span className="font-medium text-brand-700">{patEmail}</span>
                          ) : (
                            <span className="text-rose-500 italic">No email address on file</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Token #{apt.tokenNo || 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Email Template Preview (Bilingual) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 flex items-center justify-between border-b border-slate-200">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-tealbrand-600" /> Email Content Preview
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewLang('ta')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${previewLang === 'ta' ? 'bg-tealbrand-600 text-white' : 'text-slate-600'}`}
              >
                தமிழ் 🇮🇳
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${previewLang === 'en' ? 'bg-tealbrand-600 text-white' : 'text-slate-600'}`}
              >
                English
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/50 text-xs font-mono space-y-1.5 leading-relaxed text-slate-700">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Subject: ⚠️ Notice: SmileCare Clinic is Closed on {selectedDate} – Appointment Update
            </div>
            {previewLang === 'ta' ? (
              <div className="font-sans text-xs text-slate-700 pt-1 space-y-1">
                <p><strong>அன்பார்ந்த நோயாளிகள் அவர்களுக்கு,</strong></p>
                <p>SmileCare பல் மருத்துவமனை <strong>{selectedDate}</strong> அன்று விடுமுறை / இயங்காது என்பதைத் தெரிவித்துக் கொள்கிறோம்.</p>
                <p>📌 <strong>காரணம்:</strong> {reason}</p>
                <p>⏰ <strong>மீண்டும் இயங்கும் நேரம்:</strong> {reopenDate}</p>
                <p className="text-[11px] text-slate-500">முன்பதிவை மாற்றுத் தேதியில் மேற்கொள்ள எங்களை <strong>{clinicProfile?.phone || '+91 44 2621 8899'}</strong> என்ற எண்ணில் தொடர்பு கொள்ளலாம்.</p>
              </div>
            ) : (
              <div className="font-sans text-xs text-slate-700 pt-1 space-y-1">
                <p><strong>Dear Valued Patient,</strong></p>
                <p>Please be informed that <strong>SmileCare Speciality Dental Clinic</strong> will be CLOSED on <strong>{selectedDate}</strong>.</p>
                <p>📌 <strong>Reason:</strong> {reason}</p>
                <p>⏰ <strong>Expected Reopening:</strong> {reopenDate}</p>
                <p className="text-[11px] text-slate-500">Our medical team will contact you to reschedule your dental appointment. Contact: <strong>{clinicProfile?.phone || '+91 44 2621 8899'}</strong>.</p>
              </div>
            )}
          </div>
        </div>

        {/* Send Delivery Report Display */}
        {sendReport && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1 animate-fade-in">
            <div className="font-extrabold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Email Dispatch Complete: {sendReport.sentCount} / {sendReport.totalAppointments} emails sent!
            </div>
            <p className="text-[11px] text-emerald-700">
              Notification emails have been dispatched and recorded in Clinic Activity Logs.
            </p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <button
            type="submit"
            disabled={isSending}
            className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-2 transition-all ${status === 'Closed'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Emails...
              </>
            ) : status === 'Closed' ? (
              <>
                <Send className="w-4 h-4" /> Save & Send Closure Emails ({selectedAptIds.length})
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Save Clinic as Open
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
