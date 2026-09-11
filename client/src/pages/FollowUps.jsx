import React, { useState } from 'react';
import { Sparkles, ExternalLink, Eye } from 'lucide-react';
import { useData } from '../context/DataContext';
import { WhatsAppSimulator } from '../components/whatsapp/WhatsAppSimulator';

export const FollowUps = () => {
  const { followUps, sendWhatsAppReminder } = useData();
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  const handleOpenRealWhatsApp = (f) => {
    sendWhatsAppReminder(f.id);
    const cleanPhone = (f.patientPhone || '').replace(/[^0-9]/g, '');
    const bookingLink = `${window.location.origin}/#book?id=${f.id}`;

    const formattedMessage =
      `*SmileCare பல் மருத்துவமனை - பரிசோதனை நினைவூட்டல்* 🦷

வணக்கம் *${f.patientName}* அவர்களே, 

*SmileCare Dental Clinic*-ல் இருந்து உங்களுக்கான அடுத்தகட்ட பல் பரிசோதனை நினைவூட்டல்:

• *சிகிச்சை / காரணம்:* ${f.reason}
• *பரிந்துரைக்கப்பட்ட தேதி:* ${f.scheduledDate}
• *பரிந்துரைக்கப்பட்ட நேரம்:* காலை 10:00 மணி

உங்கள் முன்பதிவை (Appointment) உறுதி செய்ய கீழே உள்ள இணைப்பை கிளிக் செய்யவும்:
${bookingLink}

நன்றி,
*SmileCare Speciality Dental Clinic* 🏥`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOpenSimulator = (f) => {
    sendWhatsAppReminder(f.id);
    setSelectedFollowUp(f);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-tealbrand-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-tealbrand-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> WhatsApp Business API Automated Suite
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Patient Follow-up & Reminder System</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Dispatch formatted WhatsApp notice cards (`wa.me`) directly to patient mobile numbers with 1-click appointment booking.
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-2xl font-black text-tealbrand-300">{followUps.length}</div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Total Follow-ups</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Upcoming Dental Follow-ups List
          </h3>
          <span className="text-xs font-bold text-slate-400">Auto-sync with Doctor & Staff Calendars</span>
        </div>

        {followUps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Phone / WhatsApp</th>
                  <th className="p-4">Reason / Procedure</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {followUps.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{f.patientName}</td>
                    <td className="p-4 text-slate-600">{f.patientPhone}</td>
                    <td className="p-4 font-semibold text-brand-700">{f.reason}</td>
                    <td className="p-4 font-bold text-slate-800">{f.scheduledDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${f.status === 'Confirmed via WhatsApp' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          f.whatsAppSent ? 'bg-tealbrand-50 text-tealbrand-700 border-tealbrand-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenRealWhatsApp(f)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-all inline-flex items-center gap-1.5"
                        title="Send formatted WhatsApp card notice to patient"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Send Real WhatsApp
                      </button>
                      <button
                        onClick={() => handleOpenSimulator(f)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1"
                        title="Preview interactive WhatsApp bot simulator"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Bot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-600 text-sm">No Active WhatsApp Follow-ups Pending</p>
            <p>Follow-up reminders are automatically created when saving patient consultations in the <strong className="text-slate-800">Consultation</strong> tab.</p>
          </div>
        )}
      </div>

      {selectedFollowUp && (
        <WhatsAppSimulator
          followUp={selectedFollowUp}
          onClose={() => setSelectedFollowUp(null)}
        />
      )}
    </div>
  );
};
