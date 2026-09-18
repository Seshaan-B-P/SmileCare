import React, { useState, useEffect } from 'react';
import { Smile, CalendarCheck, CheckCircle2, Sparkles, Clock, User, ShieldCheck, Phone, MapPin, AlertCircle, X, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AutoBookingPortal = ({ followUpId, onClose }) => {
  const { followUps, appointments, clinicSlots, getNextAvailableSlot, confirmWhatsAppAutoBooking, clinicProfile } = useData();
  const [isLoading, setIsLoading] = useState(!followUps || followUps.length === 0);

  const cleanTargetId = (followUpId || '').trim();
  const followUp = (followUps || []).find(f => f.id === cleanTargetId || f._id === cleanTargetId) || (followUps && followUps.length > 0 ? followUps.find(f => f.id?.includes(cleanTargetId) || cleanTargetId.includes(f.id)) : null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');

  // Compute booked slots on the target date
  const bookedSlots = (appointments || [])
    .filter(a => a.date === followUp?.scheduledDate && a.status !== 'Cancelled')
    .map(a => a.timeSlot);

  const slotsList = clinicSlots || [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  // Resolve best available default slot
  useEffect(() => {
    if (followUps && followUps.length > 0) {
      setIsLoading(false);
    }
  }, [followUps]);

  useEffect(() => {
    if (followUp) {
      if (followUp.status === 'Confirmed via WhatsApp') {
        setIsConfirmed(true);
      }
      if (followUp.confirmedSlot) {
        setSelectedSlot(followUp.confirmedSlot);
      } else if (getNextAvailableSlot && followUp.scheduledDate) {
        const nextFree = getNextAvailableSlot(followUp.scheduledDate, followUp.preferredSlot || '10:00 AM');
        setSelectedSlot(nextFree);
      } else {
        const preferred = followUp.preferredSlot || '10:00 AM';
        if (!bookedSlots.includes(preferred)) {
          setSelectedSlot(preferred);
        } else {
          const fallback = slotsList.find(s => !bookedSlots.includes(s)) || '05:30 PM';
          setSelectedSlot(fallback);
        }
      }
    }
  }, [followUp, appointments]);

  const handleConfirm = () => {
    if (followUp?.id) {
      confirmWhatsAppAutoBooking(followUp.id, selectedSlot);
      setIsConfirmed(true);
    }
  };

  const confirmedApt = (appointments || []).find(
    a => a.date === followUp?.scheduledDate && 
         (a.patientId === followUp?.patientId || a.patientName === followUp?.patientName) &&
         a.status !== 'Cancelled'
  );
  const finalConfirmedSlot = followUp?.confirmedSlot || confirmedApt?.timeSlot || selectedSlot;

  const clinicName = clinicProfile?.name || 'SmileCare Speciality Dental Clinic & Implant Centre';
  const clinicPhone = clinicProfile?.phone || '+91 44 2621 8899';
  const clinicAddress = clinicProfile?.address || 'No. 42, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-fade-in my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-tealbrand-950 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-tealbrand-400 mx-auto flex items-center justify-center text-white mb-2.5 shadow-lg">
            <Smile className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Smile<span className="text-tealbrand-400">Care</span> Dental Clinic</h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">பல் மருத்துவ பரிசோதனை முன்பதிவு உறுதிப்படுத்தல் (Online Confirmation)</p>
        </div>

        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-tealbrand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-extrabold text-slate-800">மருத்துவமனை தகவல்கள் பெறப்படுகின்றன...</p>
              <p className="text-xs text-slate-400">Connecting to SmileCare Cloud Database...</p>
            </div>
          ) : !followUp ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">பரிசோதனை விபரம் கிடைக்கவில்லை (Not Found)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Reference ID ({followUpId || 'FLP'}) ஏற்கனவே உறுதி செய்யப்பட்டு இருக்கலாம் அல்லது காலாவதியாகியிருக்கலாம்.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="font-bold text-slate-800">நேரடி உதவிக்கு மருத்துவமனையை தொடர்பு கொள்ளவும்:</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <a href={`tel:${clinicPhone.replace(/[^0-9+]/g, '')}`} className="font-bold text-emerald-700 hover:underline">
                    {clinicPhone}
                  </a>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{clinicAddress}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="w-full py-3 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : isConfirmed ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Appointment Confirmed! ✅</h3>
                <p className="text-xs text-emerald-700 font-bold mt-1">
                  உங்கள் பல் பரிசோதனை முன்பதிவு வெற்றிகரமாக உறுதி செய்யப்பட்டது!
                </p>
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                வணக்கம் <strong className="text-slate-900">{followUp.patientName}</strong>, உங்கள் வருகைக்கான நேரம் மருத்துவர் அட்டவணையில் பதிவு செய்யப்பட்டுவிட்டது.
              </p>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-800 text-left space-y-2">
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-slate-500 font-normal">Patient Name:</span>
                  <span className="text-slate-900">{followUp.patientName}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-slate-500 font-normal">Treatment / Reason:</span>
                  <span className="text-slate-900">{followUp.reason}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-slate-500 font-normal">Confirmed Date:</span>
                  <span className="text-emerald-800 font-black">{followUp.scheduledDate}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span className="text-slate-500 font-normal">Confirmed Time Slot:</span>
                  <span className="text-emerald-800 font-black bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                    {finalConfirmedSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-normal">Attending Doctor:</span>
                  <span className="text-slate-900">Dr. Tharma P, MDS</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1">
                <div className="font-extrabold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Clinic Location:
                </div>
                <div>{clinicAddress}</div>
                <div className="text-emerald-700 font-bold">Helpline: {clinicPhone}</div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="w-full py-3 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-tealbrand-50 rounded-2xl border border-tealbrand-200 flex items-center gap-2 text-xs font-bold text-tealbrand-900">
                <Sparkles className="w-4 h-4 text-tealbrand-600 shrink-0" />
                <span>அடுத்தகட்ட பல் பரிசோதனை நினைவூட்டல் (Dental Follow-up Notice)</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <User className="w-4 h-4 text-brand-600" /> Patient Details / நோயாளி விபரம்
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900">
                  {followUp.patientName} {followUp.patientPhone ? `(${followUp.patientPhone})` : ''}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-tealbrand-600" /> Appointment Details / தேதி & நேரம்
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-medium">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <strong className="text-slate-700">Reason / சிகிச்சை:</strong> 
                    <span className="text-slate-900 font-bold">{followUp.reason || 'Post-procedure checkup'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <strong className="text-slate-700">Scheduled Date / தேதி:</strong> 
                    <span className="text-tealbrand-700 font-bold">{followUp.scheduledDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <strong className="text-slate-700">Selected Slot / நேரம்:</strong> 
                    <span className="text-emerald-700 font-extrabold bg-emerald-100/60 px-2 py-0.5 rounded-lg">
                      {selectedSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <strong className="text-slate-700">Dentist / மருத்துவர்:</strong> 
                    <span className="text-slate-900">Dr. Tharma P, MDS</span>
                  </div>
                </div>
              </div>

              {/* Slot Chooser to prevent colliding into booked slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <span>Available Time Slots ({followUp.scheduledDate})</span>
                  <span className="text-[10px] text-emerald-600 lowercase font-medium">
                    (Auto-selected next open slot)
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsList.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 text-[11px] rounded-xl font-bold border transition-all text-center relative ${
                          isBooked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                            : isSelected
                              ? 'bg-tealbrand-600 text-white border-tealbrand-600 shadow-md ring-2 ring-tealbrand-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-tealbrand-400 hover:bg-tealbrand-50/50'
                        }`}
                        title={isBooked ? 'Slot already booked by another patient' : 'Available slot'}
                      >
                        <div>{slot}</div>
                        {isBooked ? (
                          <div className="text-[9px] no-underline font-normal text-rose-500">Booked</div>
                        ) : isSelected ? (
                          <div className="text-[9px] font-bold text-teal-100 flex items-center justify-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Selected
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleConfirm}
                  type="button"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-tealbrand-600 to-brand-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <CalendarCheck className="w-4 h-4" /> Confirm & Reserve My Slot at {selectedSlot} (முன்பதிவை உறுதி செய்)
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified SmileCare Dental Business Portal • No Double Booking
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
