import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const WhatsAppSimulator = ({ followUp, onClose }) => {
  const { confirmWhatsAppAutoBooking } = useData();
  const [isBooked, setIsBooked] = useState(followUp.status === 'Confirmed via WhatsApp');
  const [lang, setLang] = useState('ta'); // Default language: Tamil ('ta')

  const handleBookNowClick = () => {
    confirmWhatsAppAutoBooking(followUp.id);
    setIsBooked(true);
  };

  const cleanPhone = (followUp.patientPhone || '').replace(/[^0-9]/g, '');
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const baseUrl = isLocal ? 'https://smile-care-rouge.vercel.app' : window.location.origin;
  const bookingLink = `${baseUrl}/#book?id=${followUp.id}`;

  const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const formattedWhatsAppTextTamil = [
    `🦷 SmileCare பல் மருத்துவமனை – பரிசோதனை நினைவூட்டல்`,
    `வணக்கம் ${followUp.patientName} அவர்களே,`,
    `SmileCare Dental Clinic-ல் இருந்து உங்களுக்கான அடுத்தகட்ட பல் பரிசோதனை நினைவூட்டல்:`,
    `📌 சிகிச்சை / காரணம்: ${followUp.reason || 'Post-procedure Checkup'}`,
    `📅 பரிந்துரைக்கப்பட்ட தேதி: ${formatDateToDMY(followUp.scheduledDate)}`,
    `⏰ பரிந்துரைக்கப்பட்ட நேரம்: காலை 10:00 மணி`,
    `உங்கள் Appointment-ஐ உறுதி செய்ய கீழே உள்ள இணைப்பை கிளிக் செய்யவும்:`,
    `🔗 ${bookingLink}`,
    `நன்றி!`,
    `SmileCare Speciality Dental Clinic 🦷`
  ].join('\n');

  const formattedWhatsAppTextEnglish = [
    `🦷 *SmileCare Dental Appointment Notice*`,
    ``,
    `Hello *${followUp.patientName}*, this is a reminder from *SmileCare Dental Clinic* for your upcoming dental follow-up:`,
    ``,
    `📋 *Reason / Procedure:* ${followUp.reason}`,
    `🗓️ *Recommended Date:* ${followUp.scheduledDate}`,
    `⏰ *Suggested Time:* 10:00 AM Slot`,
    ``,
    `Click below to confirm your appointment:`,
    `👉 ${bookingLink}`,
    ``,
    `Thank you,`,
    `🏥 *SmileCare Speciality Dental Clinic*`,
    `📍 No. 42, Anna Nagar West, Chennai`,
    `📞 +91 44 2621 8899`
  ].join('\n');

  const formattedWhatsAppText = lang === 'ta' ? formattedWhatsAppTextTamil : formattedWhatsAppTextEnglish;
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const whatsappUrl = isMobile
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formattedWhatsAppText)}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formattedWhatsAppText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden animate-fade-in">
        <div className="bg-emerald-700 px-5 py-4 flex items-center justify-between text-white border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              SC
            </div>
            <div>
              <h4 className="text-sm font-bold leading-tight">SmileCare Dental Bot</h4>
              <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Official Business WhatsApp
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-white/80 hover:text-white font-bold">
            ✕
          </button>
        </div>

        {/* Language Selection Tabs */}
        <div className="bg-[#111B21] px-5 py-2.5 flex items-center justify-between border-b border-[#222D34] text-xs">
          <span className="text-[11px] text-slate-400 font-medium">செய்தி மொழி / Language:</span>
          <div className="flex items-center bg-[#202C33] p-1 rounded-xl border border-[#2A3942]">
            <button
              onClick={() => setLang('ta')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'ta' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              தமிழ் 🇮🇳
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              English 🇬🇧
            </button>
          </div>
        </div>

        <div className="p-5 bg-[#0B141A] min-h-[360px] space-y-4 font-sans">
          <div className="text-center">
            <span className="text-[10px] font-bold bg-[#182229] text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Today • Automated Reminder Dispatch
            </span>
          </div>

          <div className="bg-[#202C33] text-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[95%] border border-[#2A3942] shadow-md space-y-2.5 text-xs">
            {lang === 'ta' ? (
              <>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>🦷 SmileCare பல் மருத்துவமனை – பரிசோதனை நினைவூட்டல்</span>
                </div>

                <p className="text-slate-200">
                  வணக்கம் <strong className="text-white">{followUp.patientName}</strong> அவர்களே,
                </p>

                <p className="text-slate-200">
                  SmileCare Dental Clinic-ல் இருந்து உங்களுக்கான அடுத்தகட்ட பல் பரிசோதனை நினைவூட்டல்:
                </p>

                <div className="bg-[#111B21] p-3 rounded-xl border border-[#222D34] text-xs space-y-1 font-medium">
                  <div>📌 <span className="text-slate-300">சிகிச்சை / காரணம்:</span> <strong className="text-white font-bold">{followUp.reason || 'Post-procedure Checkup'}</strong></div>
                  <div>📅 <span className="text-slate-300">பரிந்துரைக்கப்பட்ட தேதி:</span> <strong className="text-teal-300 font-bold">{formatDateToDMY(followUp.scheduledDate)}</strong></div>
                  <div>⏰ <span className="text-slate-300">பரிந்துரைக்கப்பட்ட நேரம்:</span> <strong className="text-teal-300 font-bold">காலை 10:00 மணி</strong></div>
                </div>

                <p className="text-[11px] text-slate-300">
                  உங்கள் Appointment-ஐ உறுதி செய்ய கீழே உள்ள இணைப்பை கிளிக் செய்யவும்:
                </p>

                <div className="text-[11px] text-teal-400 font-bold break-all flex items-center gap-1">
                  <span>🔗</span> <span className="underline">{bookingLink}</span>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  <div>நன்றி!</div>
                  <div className="font-bold text-white mt-0.5">SmileCare Speciality Dental Clinic 🦷</div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                  <Sparkles className="w-4 h-4" /> SmileCare Dental Appointment Notice
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  Hello <strong className="text-white">{followUp.patientName}</strong>, this is a reminder from <strong>SmileCare Dental Clinic</strong> for your upcoming dental follow-up:
                </p>

                <div className="bg-[#111B21] p-3.5 rounded-xl border border-[#222D34] text-xs space-y-1.5">
                  <div><span className="text-slate-400">Reason:</span> <strong className="text-white">{followUp.reason}</strong></div>
                  <div><span className="text-slate-400">Recommended Date:</span> <strong className="text-teal-300 font-bold">{followUp.scheduledDate}</strong></div>
                  <div><span className="text-slate-400">Suggested Time:</span> <strong className="text-teal-300 font-bold">10:00 AM Slot</strong></div>
                </div>

                <p className="text-[11px] text-slate-300">
                  Click below to automatically reserve & confirm your appointment.
                </p>
              </>
            )}

            <div className="pt-2 border-t border-[#2A3942]">
              {isBooked ? (
                <div className="w-full py-2.5 bg-emerald-600/30 border border-emerald-500/50 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {lang === 'ta' ? 'முன்பதிவு உறுதி செய்யப்பட்டது!' : 'Appointment Confirmed & Synced!'}
                </div>
              ) : (
                <button
                  onClick={handleBookNowClick}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <CalendarCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{lang === 'ta' ? 'இப்போதே முன்பதிவு செய்க (Book Now)' : 'Book Appointment Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-[9px] text-slate-400 text-right">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#111B21] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-slate-400">Send exact card message to WhatsApp:</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> {lang === 'ta' ? 'தமிழ் WhatsApp வழியே அனுப்பு' : 'Send via Real WhatsApp (wa.me)'}
          </a>
        </div>
      </div>
    </div>
  );
};
