import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, default: 'Dr. Tharma P, MDS' },
  doctorAvatar: { type: String, default: '' },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, default: 'Patient' },
  patientPhone: { type: String, default: '' },
  patientAvatar: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessageSenderRole: { type: String, enum: ['Doctor', 'Patient'], default: 'Doctor' },
  unreadCountDoctor: { type: Number, default: 0 },
  unreadCountPatient: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true, strict: false });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export default Conversation;
