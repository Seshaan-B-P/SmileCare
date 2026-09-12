import React, { useState } from 'react';
import { Smile, CalendarCheck, CheckCircle2, Sparkles, Clock, User, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AutoBookingPortal = ({ followUpId, onClose }) => {
  const { followUps, confirmWhatsAppAutoBooking } = useData();
  const followUp = followUps.find(f => f.id === followUpId) || followUps[0];
  const [isConfirmed, setIsConfirmed] = useState(followUp?.status === 'Confirmed via WhatsApp');

  if (!followUp) return null;

  const handleConfirm = () => {
    confirmWhatsAppAutoBooking(followUp.id);
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-tealbrand-950 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-tealbrand-400 mx-auto flex items-center justify-center text-white mb-2 shadow-lg">
            <Smile className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Smile<span className="text-tealbrand-400">Care</span> Dental Confirmation</h2>
          <p className="text-xs text-slate-300 font-medium mt-1">Official Patient WhatsApp Self-Booking Portal</p>
        </div>

        <div className="p-6 space-y-5">
          {isConfirmed ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you, <strong className="text-slate-900">{followUp.patientName}</strong>. Your dental follow-up has been reserved & synced with Dr. Tharma P' chair queue.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 text-left space-y-1 mt-4">
                <div><span className="text-slate-500 font-normal">Patient Name:</span> {followUp.patientName}</div>
                <div><span className="text-slate-500 font-normal">Procedure:</span> {followUp.reason}</div>
                <div><span className="text-slate-500 font-normal">Date & Time:</span> <span className="text-brand-600">{followUp.scheduledDate} at 10:00 AM</span></div>
                <div><span className="text-slate-500 font-normal">Doctor:</span> Dr. Tharma P, MDS</div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow mt-4"
              >
                Close Portal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-tealbrand-50 rounded-2xl border border-tealbrand-200 flex items-center gap-2 text-xs font-bold text-tealbrand-900">
                <Sparkles className="w-4 h-4 text-tealbrand-600 shrink-0" />
                <span>WhatsApp Appointment Reminder Invitation</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <User className="w-4 h-4 text-brand-600" /> Patient Details
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900">
                  {followUp.patientName} ({followUp.patientPhone})
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-tealbrand-600" /> Appointment Details
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-medium">
                  <div><strong className="text-slate-700">Reason:</strong> <span className="text-slate-900 font-bold">{followUp.reason}</span></div>
                  <div><strong className="text-slate-700">Recommended Date:</strong> <span className="text-tealbrand-700 font-bold">{followUp.scheduledDate}</span></div>
                  <div><strong className="text-slate-700">Suggested Time:</strong> <span className="text-tealbrand-700 font-bold">10:00 AM Slot</span></div>
                  <div><strong className="text-slate-700">Assigned Dentist:</strong> Dr. Tharma P, MDS</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-tealbrand-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" /> Confirm & Reserve My Appointment Now
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Encrypted SmileCare WhatsApp Self-Service API
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
