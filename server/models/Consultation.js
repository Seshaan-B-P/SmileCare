import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  id: String,
  patientId: String,
  patientName: String,
  date: String,
  chiefComplaint: String,
  diagnosis: String,
  dentalExamination: String,
  treatmentPlan: String,
  procedureNotes: String,
  followUpDays: Number,
  followUpDate: String,
  prescription: Object
}, { timestamps: true });

export const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
export default Consultation;
