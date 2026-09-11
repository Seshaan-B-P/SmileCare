import React from 'react';
import { PieChart, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AppointmentChart = () => {
  const { appointments = [], consultations = [] } = useData();

  const totalCount = appointments.length + consultations.length;

  const rawCategories = [
    { label: 'Root Canal (RCT)', keywords: ['rct', 'root canal'], color: 'bg-purple-600' },
    { label: 'Composite Fillings', keywords: ['filling', 'composite', 'cavity'], color: 'bg-brand-500' },
    { label: 'Scaling & Polishing', keywords: ['scaling', 'polishing', 'cleaning', 'hygiene'], color: 'bg-tealbrand-500' },
    { label: 'Dental Crowns', keywords: ['crown', 'cap', 'zirconia'], color: 'bg-amber-500' },
    { label: 'Extractions & Implants', keywords: ['extraction', 'implant', 'surgery'], color: 'bg-rose-500' },
  ];

  const categories = rawCategories.map(cat => {
    let matchCount = 0;

    appointments.forEach(apt => {
      const txt = `${apt.serviceName || ''} ${apt.notes || ''}`.toLowerCase();
      if (cat.keywords.some(k => txt.includes(k))) matchCount++;
    });

    consultations.forEach(cns => {
      const txt = `${cns.diagnosis || ''} ${cns.treatmentPlan || ''} ${cns.procedureNotes || ''}`.toLowerCase();
      if (cat.keywords.some(k => txt.includes(k))) matchCount++;
    });

    const percentVal = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0;
    return { ...cat, count: matchCount, percent: `${percentVal}%`, percentNum: percentVal };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-600" /> Procedure Distribution
          </h4>
          <p className="text-xs text-slate-500">Breakdown of treatments performed</p>
        </div>
      </div>

      {totalCount > 0 ? (
        <>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner my-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                style={{ width: cat.percent }}
                className={`${cat.color} h-full transition-all hover:opacity-90`}
                title={`${cat.label}: ${cat.count} cases (${cat.percent})`}
              />
            ))}
          </div>

          <div className="space-y-2.5 mt-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                  <span className="font-semibold text-slate-700">{cat.label}</span>
                </div>
                <div className="font-bold text-slate-900">
                  {cat.count} <span className="text-slate-400 font-normal">({cat.percent})</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-10 text-center text-slate-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold text-slate-600">No Procedures Recorded Yet</p>
          <p className="text-[11px] text-slate-400">Treatment distribution will populate as appointments and consultations are added.</p>
        </div>
      )}
    </div>
  );
};
