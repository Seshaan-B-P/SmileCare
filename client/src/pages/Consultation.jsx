import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { DentalChart32 } from '../components/dental/DentalChart32';
import { RxGenerator } from '../components/prescription/RxGenerator';
import { Stethoscope, Save, Clock } from 'lucide-react';

export const Consultation = ({ selectedPatient = null, onFinishedConsultation }) => {
  const { patients = [], dentalCharts = {}, updateToothCondition, saveConsultation } = useData();

  const [activePatientId, setActivePatientId] = useState(selectedPatient?.id || (patients[0]?.id || ''));
  const currentPatient = patients.find(p => p.id === activePatientId) || patients[0];

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [dentalExam, setDentalExam] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [procedureNotes, setProcedureNotes] = useState('');
  
  const [selectedFollowUpDays, setSelectedFollowUpDays] = useState(7);
  
  const calculateFollowUpDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [customFollowUpDate, setCustomFollowUpDate] = useState(calculateFollowUpDate(7));

  const handleFollowUpDaysChange = (days) => {
    setSelectedFollowUpDays(days);
    setCustomFollowUpDate(calculateFollowUpDate(days));
  };

  const handleSave = () => {
    if (!currentPatient) return;
    saveConsultation({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      patientPhone: currentPatient.phone,
      chiefComplaint,
      diagnosis,
      dentalExamination: dentalExam,
      treatmentPlan,
      procedureNotes,
      followUpDays: selectedFollowUpDays,
      followUpDate: customFollowUpDate
    });

    if (onFinishedConsultation) onFinishedConsultation();
  };

  if (!currentPatient) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-soft max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900">No Patient Registered or Selected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          There are currently no active patients in your clinic database. Please add a patient in the Patient Directory to start a clinical consultation and 32-tooth odontogram examination.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-600" /> Clinical Consultation & Treatment Suite
          </h2>
          <p className="text-xs text-slate-500">Record chief complaints, diagnosis, interactive 32-tooth chart, Rx, and follow-ups</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Active Patient:</label>
          <select
            value={activePatientId}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          1. Chief Complaint & Clinical Diagnosis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Chief Complaint</label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Clinical Diagnosis</label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Intraoral & Dental Examination</label>
            <textarea
              rows={2}
              value={dentalExam}
              onChange={(e) => setDentalExam(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Treatment Plan & Procedure Notes</label>
            <textarea
              rows={2}
              value={procedureNotes}
              onChange={(e) => setProcedureNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          2. Interactive Dental Odontogram (32 Teeth)
        </h3>
        <DentalChart32
          patientId={currentPatient.id}
          patientName={currentPatient.name}
          dentalChartData={dentalCharts[currentPatient.id] || {}}
          onUpdateToothCondition={updateToothCondition}
        />
      </div>

      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          3. Digital Prescription (Rx Generator)
        </h3>
        <RxGenerator patient={currentPatient} onSavePrescription={() => {}} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-tealbrand-600" /> 4. Follow-Up Schedule & Consultation Completion
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-600 block mb-2">
              Select Automated WhatsApp Follow-up Schedule:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[7, 10, 15, 30].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleFollowUpDaysChange(days)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedFollowUpDays === days
                      ? 'bg-tealbrand-600 text-white border-tealbrand-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days} Days Follow-up
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Calculated Date</label>
            <input
              type="date"
              value={customFollowUpDate}
              onChange={(e) => setCustomFollowUpDate(e.target.value)}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Consultation & Schedule WhatsApp Reminder
          </button>
        </div>
      </div>
    </div>
  );
};
