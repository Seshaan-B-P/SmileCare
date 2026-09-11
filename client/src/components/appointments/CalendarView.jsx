import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';

export const CalendarView = ({ appointments, onBookClick, onRescheduleClick, onUpdateStatus }) => {
  const todaySystemDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todaySystemDate);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = a.date === selectedDate;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 border border-slate-200 focus:outline-none"
            />
            <button
              onClick={() => setSelectedDate(todaySystemDate)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                selectedDate === todaySystemDate
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              Today
            </button>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Chair">In Chair</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={onBookClick}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-tealbrand-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {timeSlots.map(slot => {
          const apts = filteredAppointments.filter(a => a.timeSlot === slot);
          return (
            <div key={slot} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors">
              <div className="w-24 text-xs font-extrabold text-slate-500 pt-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" /> {slot}
              </div>

              <div className="flex-1 space-y-2">
                {apts.length > 0 ? (
                  apts.map(apt => (
                    <div
                      key={apt.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                            Token #{apt.tokenNo || 1}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{apt.serviceName} • Dr. {apt.doctorName}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          apt.status === 'In Chair' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-brand-50 text-brand-700 border-brand-200'
                        }`}>
                          {apt.status}
                        </span>

                        <button
                          onClick={() => onRescheduleClick(apt)}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                        >
                          Reschedule
                        </button>

                        {apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'Cancelled')}
                            className="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 font-medium py-1">Slot Available</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
