import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  name: String,
  tagline: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  registrationNo: String,
  taxId: String,
  workingHours: String,
  slotDurationMinutes: Number,
  defaultConsultationFee: Number,
  whatsAppApiStatus: String,
  whatsAppPhoneNumber: String
}, { timestamps: true, strict: false });

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
export default Setting;
