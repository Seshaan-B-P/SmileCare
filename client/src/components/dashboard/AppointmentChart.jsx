import React from 'react';
import { PieChart, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AppointmentChart = ({ appointments: propApts, consultations: propCns }) => {
  const contextData = useData() || {};
  const appointments = propApts || contextData.appointments || [];
  const consultations = propCns || contextData.consultations || [];

  const totalCount = appointments.length + consultations.length;

  const rawCategories = [
    { label: 'Root Canal (RCT)', keywords: ['rct', 'root canal', 'endodontic'], color: 'bg-purple-600', dotColor: 'bg-purple-600' },
    { label: 'Composite Fillings', keywords: ['filling', 'composite', 'cavity', 'caries', 'restoration'], color: 'bg-brand-500', dotColor: 'bg-brand-500' },
    { label: 'Scaling & Polishing', keywords: ['scaling', 'polishing', 'cleaning', 'hygiene', 'prophylaxis'], color: 'bg-tealbrand-500', dotColor: 'bg-tealbrand-500' },
    { label: 'Dental Crowns & Bridges', keywords: ['crown', 'cap', 'zirconia', 'bridge', 'ceramic'], color: 'bg-amber-500', dotColor: 'bg-amber-500' },
    { label: 'Extractions & Implants', keywords: ['extraction', 'implant', 'surgery', 'surgical', 'removal'], color: 'bg-rose-500', dotColor: 'bg-rose-500' },
    { label: 'Orthodontics & Aligners', keywords: ['ortho', 'braces', 'aligner', 'wire'], color: 'bg-indigo-500', dotColor: 'bg-indigo-500' },
    { label: 'General Consultation', keywords: ['consultation', 'checkup', 'exam', 'pain', 'routine'], color: 'bg-sky-500', dotColor: 'bg-sky-500' },
  ];

  let totalMatched = 0;
  const categories = rawCategories.map(cat => {
    let matchCount = 0;

    appointments.forEach(apt => {
      const txt = `${apt.serviceName || ''} ${apt.notes || ''}`.toLowerCase();
      if (cat.keywords.some(k => txt.includes(k))) matchCount++;
    });

    consultations.forEach(cns => {
      const txt = `${cns.diagnosis || ''} ${cns.treatmentPlan || ''} ${cns.procedureNotes || ''} ${cns.chiefComplaint || ''}`.toLowerCase();
      if (cat.keywords.some(k => txt.includes(k))) matchCount++;
    });

    totalMatched += matchCount;
    return { ...cat, count: matchCount };
  });

  // Calculate actual percentages based on total cases or matched count
  const effectiveTotal = Math.max(totalMatched, totalCount, 1);
  const categoriesWithPercent = categories
    .filter(cat => cat.count > 0 || totalMatched === 0)
    .map(cat => {
      const percentVal = totalCount > 0 ? Math.round((cat.count / effectiveTotal) * 100) : 0;
      return { ...cat, percent: `${percentVal}%`, percentNum: percentVal };
    });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-600" /> Procedure & Treatment Distribution
          </h4>
          <p className="text-xs text-slate-500">Breakdown of clinical procedures performed ({totalCount} total events)</p>
        </div>
      </div>

      {totalCount > 0 ? (
        <>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner my-4">
            {categoriesWithPercent.filter(c => c.count > 0).map((cat, idx) => (
              <div
                key={idx}
                style={{ width: `${Math.max(cat.percentNum, 5)}%` }}
                className={`${cat.color} h-full transition-all hover:opacity-90`}
                title={`${cat.label}: ${cat.count} cases (${cat.percent})`}
              />
            ))}
          </div>

          <div className="space-y-2 mt-4 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {categoriesWithPercent.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor}`}></span>
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
