import mongoose, { model, Schema } from "mongoose";

const ManageGroupSchema = new Schema({
  groupName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  district: { type: String, required: true }
});

export const ManageGroup = mongoose.models.ManageGroup || mongoose.model('ManageGroup', ManageGroupSchema);
