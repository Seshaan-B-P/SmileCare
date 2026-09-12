import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  id: String,
  time: String,
  user: String,
  action: String
}, { timestamps: true, strict: false });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
