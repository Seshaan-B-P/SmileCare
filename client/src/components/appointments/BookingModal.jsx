import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { STANDARD_SERVICES, CLINIC_SLOTS, getNextAvailableSlot } from '../../utils/dentalData';
import { useData } from '../../context/DataContext';
import { Sparkles, Check } from 'lucide-react';

export const BookingModal = ({ patients, isOpen, onClose, onBook, targetAppointment = null }) => {
  const { appointments } = useData();
  const todaySystemDate = new Date().toISOString().split('T')[0];
  const [patientId, setPatientId] = useState(targetAppointment?.patientId || (patients[0]?.id || ''));
  const [date, setDate] = useState(targetAppointment?.date || todaySystemDate);
  const [timeSlot, setTimeSlot] = useState(targetAppointment?.timeSlot || '10:00 AM');
  const [serviceName, setServiceName] = useState(targetAppointment?.serviceName || STANDARD_SERVICES[0].name);
  const [notes, setNotes] = useState(targetAppointment?.notes || '');

  const bookedSlots = (appointments || [])
    .filter(a => a.date === date && a.status !== 'Cancelled' && a.id !== targetAppointment?.id)
    .map(a => a.timeSlot);

  useEffect(() => {
    // If current timeSlot is booked on this newly selected date, auto-select next free slot
    if (bookedSlots.includes(timeSlot)) {
      const free = getNextAvailableSlot(date, appointments, '10:00 AM');
      setTimeSlot(free);
    }
  }, [date, appointments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === patientId) || { name: 'Walk-in Patient', phone: '+1 (555) 000-1122' };

    onBook({
      patientId,
      patientName: patientObj.name,
      patientPhone: patientObj.phone,
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Tharma P',
      date,
      timeSlot,
      serviceName,
      type: 'Dental Service',
      notes
    });
    onClose();
  };

  const slots = CLINIC_SLOTS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetAppointment ? 'Reschedule Appointment' : 'Book New Dental Appointment'}
      subtitle="Select patient, date, service, and available time slot"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Patient
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            required
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) • {p.phone}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Appointment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Service / Procedure
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {STANDARD_SERVICES.map(srv => (
                <option key={srv.id} value={srv.name}>
                  {srv.name} (₹{srv.defaultFee})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Available Time Slot
            </label>
            <span className="text-[11px] text-tealbrand-700 font-medium">
              Selected: <strong className="font-bold">{timeSlot}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map(s => {
              const isBooked = bookedSlots.includes(s);
              const isSelected = timeSlot === s;
              return (
                <button
                  type="button"
                  key={s}
                  disabled={isBooked}
                  onClick={() => setTimeSlot(s)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                    isBooked
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                      : isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-brand-300'
                  }`}
                  title={isBooked ? 'Slot already occupied' : 'Available slot'}
                >
                  <div>{s}</div>
                  {isBooked && <div className="text-[9px] no-underline font-normal text-rose-500">Booked</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for visit..."
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all"
          >
            {targetAppointment ? 'Confirm Reschedule' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
