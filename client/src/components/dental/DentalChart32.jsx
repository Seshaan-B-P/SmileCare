import React, { useState } from 'react';
import { TEETH_DEFINITIONS, CONDITION_TYPES } from '../../utils/dentalData';
import { ToothDetailModal } from './ToothDetailModal';
import { Info, Sparkles } from 'lucide-react';

export const DentalChart32 = ({ patientId, patientName, dentalChartData = {}, onUpdateToothCondition }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [useFdiNotation, setUseFdiNotation] = useState(false);

  const upperTeeth = TEETH_DEFINITIONS.filter(t => t.arch === 'upper');
  const lowerTeeth = TEETH_DEFINITIONS.filter(t => t.arch === 'lower');

  const handleToothClick = (tooth) => {
    const existing = dentalChartData[tooth.id] || null;
    setSelectedTooth({ ...tooth, existing });
  };

  const conditionCounts = {};
  Object.values(dentalChartData).forEach(record => {
    if (record && record.condition) {
      conditionCounts[record.condition] = (conditionCounts[record.condition] || 0) + 1;
    }
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" /> Interactive 32-Tooth Odontogram Chart
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click any tooth to record cavity, RCT, crown, filling, extraction, or implant status for <strong className="text-slate-900">{patientName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold border border-slate-200/60">
          <button
            onClick={() => setUseFdiNotation(false)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${!useFdiNotation ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Universal (1 - 32)
          </button>
          <button
            onClick={() => setUseFdiNotation(true)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${useFdiNotation ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            FDI Notation (11 - 48)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        <span className="font-bold text-slate-700 mr-2 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-brand-600" /> Conditions:
        </span>
        {Object.entries(CONDITION_TYPES).map(([key, config]) => (
          <span key={key} className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${config.badge}`}>
            <span className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`}></span>
            {config.label}
            {conditionCounts[key] ? (
              <span className="ml-1 bg-white text-slate-900 px-1.5 py-0.2 text-[10px] font-bold rounded-full shadow-xs">
                {conditionCounts[key]}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      <div className="space-y-8 bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-slate-300"></span> Upper Arch (Maxilla) <span className="w-8 h-px bg-slate-300"></span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
            {upperTeeth.map(tooth => {
              const conditionRecord = dentalChartData[tooth.id];
              const condConfig = conditionRecord ? CONDITION_TYPES[conditionRecord.condition] : null;

              return (
                <button
                  key={tooth.id}
                  onClick={() => handleToothClick(tooth)}
                  className={`tooth-card p-2 rounded-xl border bg-white flex flex-col items-center justify-between text-center relative transition-all shadow-xs ${
                    condConfig ? 'ring-2 ring-brand-500 border-transparent bg-brand-50/20' : 'hover:border-brand-300 hover:shadow-md border-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400">
                    {useFdiNotation ? tooth.fdi : `#${tooth.id}`}
                  </span>

                  <div className="my-1 text-slate-600 flex items-center justify-center relative">
                    <svg className="w-7 h-9" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 10C6 5 10 2 15 2C20 2 24 5 24 10V24C24 29 21 38 18 38C16 38 15 34 15 30C15 34 14 38 12 38C9 38 6 29 6 24V10Z"
                        fill={condConfig ? condConfig.iconColor : "#F8FAFC"}
                        stroke={condConfig ? "#0F172A" : "#94A3B8"}
                        strokeWidth="2"
                      />
                      <path d="M11 12H19" stroke={condConfig ? "#FFFFFF" : "#CBD5E1"} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {condConfig && (
                      <span className={`absolute -top-1 -right-1 text-[8px] font-extrabold px-1 rounded shadow-xs text-white ${condConfig.color.split(' ')[0]}`}>
                        {condConfig.code}
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] font-medium text-slate-500 truncate w-full">
                    {tooth.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-slate-300"></div></div>
          <span className="relative bg-slate-100 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Occlusal Plane
          </span>
        </div>

        <div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
            {lowerTeeth.map(tooth => {
              const conditionRecord = dentalChartData[tooth.id];
              const condConfig = conditionRecord ? CONDITION_TYPES[conditionRecord.condition] : null;

              return (
                <button
                  key={tooth.id}
                  onClick={() => handleToothClick(tooth)}
                  className={`tooth-card p-2 rounded-xl border bg-white flex flex-col items-center justify-between text-center relative transition-all shadow-xs ${
                    condConfig ? 'ring-2 ring-brand-500 border-transparent bg-brand-50/20' : 'hover:border-brand-300 hover:shadow-md border-slate-200'
                  }`}
                >
                  <span className="text-[9px] font-medium text-slate-500 truncate w-full">
                    {tooth.type}
                  </span>

                  <div className="my-1 text-slate-600 flex items-center justify-center relative">
                    <svg className="w-7 h-9" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 30C6 35 10 38 15 38C20 38 24 35 24 30V16C24 11 21 2 18 2C16 2 15 6 15 10C15 6 14 2 12 2C9 2 6 11 6 16V30Z"
                        fill={condConfig ? condConfig.iconColor : "#F8FAFC"}
                        stroke={condConfig ? "#0F172A" : "#94A3B8"}
                        strokeWidth="2"
                      />
                      <path d="M11 28H19" stroke={condConfig ? "#FFFFFF" : "#CBD5E1"} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {condConfig && (
                      <span className={`absolute -top-1 -right-1 text-[8px] font-extrabold px-1 rounded shadow-xs text-white ${condConfig.color.split(' ')[0]}`}>
                        {condConfig.code}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">
                    {useFdiNotation ? tooth.fdi : `#${tooth.id}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mt-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-slate-300"></span> Lower Arch (Mandible) <span className="w-8 h-px bg-slate-300"></span>
          </div>
        </div>
      </div>

      {selectedTooth && (
        <ToothDetailModal
          tooth={selectedTooth}
          patientId={patientId}
          onClose={() => setSelectedTooth(null)}
          onSave={(cond, status, notes) => {
            onUpdateToothCondition(patientId, selectedTooth.id, cond, status, notes);
            setSelectedTooth(null);
          }}
        />
      )}
    </div>
  );
};
