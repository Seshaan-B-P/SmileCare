import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  id: String,
  patientId: String,
  patientName: String,
  date: String,
  items: Array,
  subtotal: Number,
  discount: Number,
  tax: Number,
  totalAmount: Number,
  paidAmount: Number,
  balanceDue: Number,
  paymentStatus: String,
  paymentMethod: String,
  receiptNo: String
}, { timestamps: true, strict: false });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export default Invoice;
