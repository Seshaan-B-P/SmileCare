import React from 'react';
import { Clock, UserCheck, Play } from 'lucide-react';

export const QueueWidget = ({ appointments, onUpdateStatus, onStartConsultation }) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayApts = appointments
    .filter(a => a.date === todayDate)
    .sort((a, b) => (a.tokenNo || 0) - (b.tokenNo || 0));

  const currentInChair = todayApts.find(a => a.status === 'In Chair');
  const waitingList = todayApts.filter(a => a.status === 'Waiting' || a.status === 'Scheduled');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-tealbrand-600" /> Today's Live Patient Queue
          </h4>
          <p className="text-xs text-slate-500 font-medium">Live token numbers & dental chair assignment</p>
        </div>
        <span className="px-3 py-1 bg-tealbrand-50 text-tealbrand-700 border border-tealbrand-200 text-xs font-black rounded-full">
          {todayApts.length} Patients Today
        </span>
      </div>

      {currentInChair ? (
        <div className="mb-5 p-5 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-tealbrand-600 text-white shadow-xl shadow-brand-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white shadow-sm border border-white/20">
              Currently In Chair
            </span>
            <span className="text-xs font-black bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              Token #{currentInChair.tokenNo}
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-white">{currentInChair.patientName}</h3>
              <p className="text-xs text-white/90 font-medium mt-0.5">{currentInChair.serviceName} • {currentInChair.timeSlot}</p>
            </div>
            <button
              onClick={() => onStartConsultation(currentInChair)}
              className="px-5 py-2.5 bg-white text-brand-700 font-extrabold text-xs rounded-2xl shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-brand-700" /> Clinical Exam
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
            <span className="text-white/80">Doctor: {currentInChair.doctorName}</span>
            <button
              onClick={() => onUpdateStatus(currentInChair.id, 'Completed')}
              className="text-white underline font-black hover:text-amber-200 transition-colors"
            >
              Mark Completed
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-5 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center py-8">
          <UserCheck className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-black text-slate-700">No Patient Currently In Chair</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Select a waiting patient below to call into dental chair</p>
        </div>
      )}

      <div className="space-y-2.5">
        <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
          Waiting & Upcoming Queue ({waitingList.length})
        </h5>
        {waitingList.length > 0 ? (
          waitingList.map(apt => (
            <div
              key={apt.id}
              className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-300 bg-white hover:bg-slate-50/50 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm flex items-center justify-center border border-slate-200 shrink-0">
                  #{apt.tokenNo || 1}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">{apt.patientName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{apt.timeSlot} • {apt.serviceName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] rounded-full font-black border ${apt.status === 'Waiting' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {apt.status}
                </span>

                <button
                  onClick={() => onUpdateStatus(apt.id, 'In Chair')}
                  className="px-3 py-1.5 text-xs font-extrabold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors shadow-xs"
                >
                  Call to Chair
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 font-bold text-center py-4">No waiting patients in queue</p>
        )}
      </div>
    </div>
  );
};
