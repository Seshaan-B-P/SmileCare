import mongoose from 'mongoose';

const dentalChartSchema = new mongoose.Schema({
  patientId: String,
  toothId: Number,
  condition: String,
  status: String,
  notes: String,
  updatedBy: String,
  updatedAt: String
}, { timestamps: true, strict: false });

export const DentalChart = mongoose.models.DentalChart || mongoose.model('DentalChart', dentalChartSchema);
export default DentalChart;
