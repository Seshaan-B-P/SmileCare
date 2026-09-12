import React, { useState } from 'react';
import { RX_TEMPLATES } from '../../utils/dentalData';
import { Plus, Trash2, Printer, Sparkles, FileText } from 'lucide-react';
import { triggerPrint } from '../../utils/exportUtils';

export const RxGenerator = ({ patient, doctor, onSavePrescription }) => {
  const [medicines, setMedicines] = useState([
    { name: 'Amoxicillin 500mg', dosage: '500 mg', frequency: '1-0-1', duration: '5 days', instructions: 'Take after food' },
    { name: 'Ketorolac DT 10mg', dosage: '10 mg', frequency: '1-0-1', duration: '3 days', instructions: 'Dissolve in water after food' }
  ]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: '1-0-1', duration: '5 days', instructions: 'Take after meals' }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const applyTemplate = (template) => {
    setMedicines([...template.medicines]);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" /> Digital Prescription Generator (Rx)
          </h3>
          <p className="text-xs text-slate-500">Formulate dosage, frequency, and instructions with printable PDF styling</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Preview & Print Rx PDF
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
          Quick Load Dental Rx Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {RX_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(tmpl)}
              className="px-3 py-1.5 bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" /> {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Prescribed Medications</h4>
          <button
            onClick={handleAddMedicine}
            className="px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-bold border border-brand-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Drug
          </button>
        </div>

        <div className="space-y-3">
          {medicines.map((med, idx) => (
            <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Medicine / Drug Name"
                  value={med.name}
                  onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Freq (1-0-1)"
                  value={med.frequency}
                  onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Instructions (after food...)"
                  value={med.instructions}
                  onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-1 text-right">
                <button
                  onClick={() => handleRemoveMedicine(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 printable-area">
            <div className="border-b-2 border-brand-600 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-brand-900 tracking-tight">SmileCare Dental Super-speciality</h1>
                <p className="text-xs font-semibold text-slate-500">Suite 402, HealthCare Avenue, Medical Hub • Ph: +1 (800) 555-SMILE</p>
                <p className="text-[10px] text-slate-400 font-medium">Clinic Reg #: CLINIC-MOH-2024-88</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-800">{doctor?.name || 'Dr. Tharma'}</h3>
                <p className="text-xs text-slate-500">{doctor?.title || 'Senior Endodontist'}</p>
                <p className="text-[10px] text-brand-700 font-bold">Reg #: {doctor?.regNo || 'DENT-REG-98412'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><strong className="text-slate-500 block text-[10px] uppercase">Patient Name</strong> <span className="font-bold text-slate-900">{patient?.name || 'Eleanor Vance'}</span></div>
              <div><strong className="text-slate-500 block text-[10px] uppercase">Age / Gender</strong> <span className="font-bold text-slate-900">{patient?.age || 34}y / {patient?.gender || 'Female'}</span></div>
              <div><strong className="text-slate-500 block text-[10px] uppercase">Patient ID</strong> <span className="font-bold text-slate-900">{patient?.id || 'PAT-1001'}</span></div>
              <div><strong className="text-slate-500 block text-[10px] uppercase">Rx Date</strong> <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span></div>
            </div>

            <div className="text-2xl font-black text-brand-600 mb-3 italic">Rx</div>

            <table className="w-full text-xs text-left mb-8 border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2">#</th>
                  <th className="py-2">Medicine / Drug</th>
                  <th className="py-2">Dosage</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((m, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-2.5 font-bold text-slate-400">{i + 1}</td>
                    <td className="py-2.5 font-bold text-slate-900">{m.name}</td>
                    <td className="py-2.5 text-slate-700">{m.dosage}</td>
                    <td className="py-2.5 text-slate-700">{m.frequency} ({m.duration})</td>
                    <td className="py-2.5 text-slate-600 italic">{m.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-12 flex justify-between items-end border-t border-slate-200">
              <div className="text-[10px] text-slate-400">
                <p>Not valid for medico-legal purposes.</p>
                <p>Generated via SmileCare Dental SaaS.</p>
              </div>
              <div className="text-center">
                <div className="w-36 h-10 border-b border-slate-400 mb-1 flex items-end justify-center text-xs font-serif text-slate-700 italic">
                  Dr. Tharma
                </div>
                <p className="text-[10px] font-bold text-slate-600 uppercase">Doctor's Signature & Seal</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3 no-print">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={triggerPrint}
                className="px-5 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow hover:bg-brand-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print PDF Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
