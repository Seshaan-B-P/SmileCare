// Controller: Clinical Consultation & Dental Charting

export const saveConsultation = (consultData, db) => {
  const newConsultation = {
    id: `CNS-${500 + db.consultations.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    ...consultData
  };
  db.consultations.unshift(newConsultation);
  return newConsultation;
};

export const updateDentalChart = (patientId, toothId, condition, status, notes, db) => {
  if (!db.dentalCharts[patientId]) db.dentalCharts[patientId] = {};
  db.dentalCharts[patientId][toothId] = {
    toothId,
    condition,
    status: status || 'Planned',
    notes: notes || '',
    updatedBy: 'Dr. Tharma',
    updatedAt: new Date().toISOString().split('T')[0]
  };
  return db.dentalCharts[patientId];
};
