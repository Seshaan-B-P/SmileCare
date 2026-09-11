import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'Staff' },
  title: String,
  qualification: String,
  regNo: String,
  phone: String,
  emergencyContact: String,
  idProofNo: String,
  workShift: String,
  salary: Number,
  joiningDate: String,
  avatar: String,
  bio: String,
  specialties: [String],
  experienceYears: Number,
  consultationFee: Number,
  status: { type: String, default: 'Active' },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, strict: false });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
