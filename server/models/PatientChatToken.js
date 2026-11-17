import mongoose from 'mongoose';

const patientChatTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, default: 'Patient' },
  patientPhone: { type: String, default: '' },
  doctorId: { type: String, required: true, index: true, default: 'usr_doc_1' },
  doctorName: { type: String, default: 'Dr. Tharma P, MDS' },
  followUpId: { type: String, default: '', index: true },
  contextReason: { type: String, default: 'Post-consultation follow-up' },
  conversationId: { type: String, required: true, index: true },
  verificationCode: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  expiresAt: { type: Date, required: true, index: true },
  isRevoked: { type: Boolean, default: false },
  revokedAt: { type: Date },
  revokedBy: { type: String },
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  clientIp: { type: String, default: '' }
}, { timestamps: true, strict: false });

export const PatientChatToken = mongoose.models.PatientChatToken || mongoose.model('PatientChatToken', patientChatTokenSchema);
export default PatientChatToken;
