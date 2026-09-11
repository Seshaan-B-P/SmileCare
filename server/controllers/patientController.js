// Controller: Patients EHR

export const getPatients = (db) => db.patients;

export const createPatient = (patientData, db) => {
  const newPatient = {
    id: `PAT-${1000 + db.patients.length + 1}`,
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    medicalHistory: patientData.medicalHistory || [],
    dentalHistory: patientData.dentalHistory || [],
    allergies: patientData.allergies || [],
    documents: [],
    ...patientData
  };
  db.patients.unshift(newPatient);
  return newPatient;
};
