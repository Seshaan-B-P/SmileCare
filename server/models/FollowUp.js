import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  id: String,
  patientId: String,
  patientName: String,
  patientPhone: String,
  reason: String,
  scheduledDate: String,
  status: String,
  whatsAppSent: Boolean,
  whatsAppSentDate: String,
  autoAssignedSlot: String
}, { timestamps: true, strict: false });

export const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);
export default FollowUp;
