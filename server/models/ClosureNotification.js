import mongoose from 'mongoose';

const closureNotificationSchema = new mongoose.Schema({
  cycleId: { type: String, required: true, index: true }, // e.g. "AUTO_2026-11-17" or "MANUAL_1794908000"
  closureType: { type: String, enum: ['MANUAL', 'AUTOMATIC'], required: true },
  status: { type: String, enum: ['SENT', 'ALREADY_CLOSED', 'FAILED', 'NO_RECIPIENTS'], default: 'SENT' },
  recipientPolicy: { type: String, enum: ['APPOINTMENT_PATIENTS', 'ALL_OPTED_IN'], default: 'APPOINTMENT_PATIENTS' },
  recipientsCount: { type: Number, default: 0 },
  recipients: [{
    patientId: String,
    patientName: String,
    email: String,
    status: String,
    messageId: String,
    sentAt: Date
  }],
  closedAt: { type: Date, default: Date.now },
  closedBy: { type: String, default: 'System' },
  reason: String,
  errorMessage: String
}, { timestamps: true, strict: false });

export const ClosureNotification = mongoose.models.ClosureNotification || mongoose.model('ClosureNotification', closureNotificationSchema);
export default ClosureNotification;

