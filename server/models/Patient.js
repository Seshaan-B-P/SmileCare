import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  id: String,
  name: String,
  age: Number,
  gender: String,
  phone: String,
  email: String,
  bloodGroup: String,
  emergencyContact: String,
  address: String,
  status: { type: String, default: 'Active' },
  joinedDate: String,
  medicalHistory: [String],
  dentalHistory: [String],
  allergies: [String],
  notes: String,
  documents: Array
}, { timestamps: true });

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
