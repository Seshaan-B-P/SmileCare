import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  id: String,
  patientId: String,
  patientName: String,
  patientPhone: String,
  doctorId: String,
  doctorName: String,
  date: String,
  timeSlot: String,
  serviceName: String,
  status: String,
  tokenNo: Number,
  type: String,
  notes: String
}, { timestamps: true });

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
