import mongoose, { model, Schema } from "mongoose";

const ActivityLogSchema = new Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, required: true }
});

const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  activityLog: [ActivityLogSchema]
}, {timestamps: true});

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
