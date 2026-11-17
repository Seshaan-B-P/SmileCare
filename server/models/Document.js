import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, default: '' },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  fileSizeFormatted: { type: String, default: '' },
  mimeType: { type: String, default: 'application/pdf' },
  category: { 
    type: String, 
    enum: [
      'Medical Report', 
      'Dental X-Ray & Scan', 
      'Prescription', 
      'Treatment Plan', 
      'Other Records'
    ],
    default: 'Medical Report' 
  },
  notes: { type: String, default: '' },
  uploadedBy: { type: String, default: 'System' },
  uploaderId: { type: String, default: '' },
  uploaderRole: { type: String, enum: ['Doctor', 'Staff', 'Patient', 'Admin'], default: 'Doctor' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;
