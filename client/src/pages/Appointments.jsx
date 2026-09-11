import React, { useState } from 'react';
import { CalendarView } from '../components/appointments/CalendarView';
import { QueueWidget } from '../components/appointments/QueueWidget';
import { BookingModal } from '../components/appointments/BookingModal';
import { useData } from '../context/DataContext';

export const Appointments = ({ onStartConsultation }) => {
  const { appointments, patients, bookAppointment, updateAppointmentStatus, rescheduleAppointment } = useData();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [targetApt, setTargetApt] = useState(null);

  const handleBook = (aptObj) => {
    if (targetApt) {
      rescheduleAppointment(targetApt.id, aptObj.date, aptObj.timeSlot);
      setTargetApt(null);
    } else {
      bookAppointment(aptObj);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Appointment Management & Live Queue</h2>
          <p className="text-xs text-slate-500">Interactive slot calendar, token generation, and chair assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <QueueWidget
            appointments={appointments}
            onUpdateStatus={updateAppointmentStatus}
            onStartConsultation={onStartConsultation}
          />
        </div>

        <div className="lg:col-span-7">
          <CalendarView
            appointments={appointments}
            onBookClick={() => { setTargetApt(null); setShowBookingModal(true); }}
            onRescheduleClick={(apt) => { setTargetApt(apt); setShowBookingModal(true); }}
            onUpdateStatus={updateAppointmentStatus}
          />
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          patients={patients}
          isOpen={true}
          onClose={() => setShowBookingModal(false)}
          onBook={handleBook}
          targetAppointment={targetApt}
        />
      )}
    </div>
  );
};
