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
  whatsAppPhoneNumber: String,
  
  // Operational Status & Automated Closure Configuration
  operatingStatus: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  clinicStatus: { type: String, default: 'Open' },
  isManualOverride: { type: Boolean, default: false },
  manualClosedAt: { type: Date, default: null },
  manualClosedBy: { type: String, default: '' },
  lastStatusChange: { type: Date, default: Date.now },
  lastStatusChangedBy: { type: String, default: 'System' },
  
  // Configured Working Hours & Days
  openingTime: { type: String, default: '09:00' }, // HH:mm (24hr format)
  closingTime: { type: String, default: '20:00' }, // HH:mm (24hr format)
  workingDays: { 
    type: [String], 
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
  },
  
  // Email Notification Policy: 'APPOINTMENT_PATIENTS' | 'ALL_OPTED_IN'
  recipientPolicy: { 
    type: String, 
    enum: ['APPOINTMENT_PATIENTS', 'ALL_OPTED_IN'], 
    default: 'APPOINTMENT_PATIENTS' 
  },
  
  // Persistent tracking to avoid duplicate emails across server restarts
  lastClosureNotificationCycle: { type: String, default: '' },
  lastClosureNotificationSentAt: { type: Date, default: null },
  
  closedReason: { type: String, default: '' },
  reopenDate: { type: String, default: '' },
  closedDates: { type: [String], default: [] },
  closedSchedules: { type: Array, default: [] },
  autoEmailOnClosure: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
export default Setting;
