import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CONDITION_TYPES } from '../../utils/dentalData';
import { Check, Sparkles } from 'lucide-react';

export const ToothDetailModal = ({ tooth, patientId, onClose, onSave }) => {
  const existing = tooth.existing || {};
  const [condition, setCondition] = useState(existing.condition || 'cavity');
  const [status, setStatus] = useState(existing.status || 'Planned');
  const [notes, setNotes] = useState(existing.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(condition, status, notes);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Tooth #${tooth.id} - ${tooth.name}`}
      subtitle={`FDI: ${tooth.fdi} • ${tooth.arch.toUpperCase()} ARCH • ${tooth.side.toUpperCase()} SIDE`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Dental Condition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(CONDITION_TYPES).map(([key, config]) => {
              const isSelected = condition === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setCondition(key)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected ? 'ring-2 ring-brand-500 border-transparent shadow-sm bg-brand-50/30' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`}></span>
                    <span>{config.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Treatment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Planned', 'In-Progress', 'Completed'].map(st => (
              <button
                type="button"
                key={st}
                onClick={() => setStatus(st)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  status === st 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Tooth Clinical Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Deep mesial decay approaching pulp. Rubber dam isolation required."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 transition-opacity shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Save Tooth Condition
          </button>
        </div>
      </form>
    </Modal>
  );
};
