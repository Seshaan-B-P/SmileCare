import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, default: '' },
  senderRole: { type: String, enum: ['Doctor', 'Patient', 'Staff'], required: true },
  recipientId: { type: String, required: true },
  recipientName: { type: String, default: '' },
  recipientRole: { type: String, enum: ['Doctor', 'Patient', 'Staff'], required: true },
  content: { type: String, default: '' },
  attachment: {
    documentId: { type: String, default: null },
    fileName: { type: String, default: null },
    fileUrl: { type: String, default: null },
    fileSizeFormatted: { type: String, default: null },
    mimeType: { type: String, default: null },
    category: { type: String, default: null }
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
