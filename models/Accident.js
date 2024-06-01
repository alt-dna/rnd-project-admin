import mongoose, { Schema } from "mongoose";

const AccidentSchema = new Schema({
  time_detected: { type: Date, required: true },
  processedBy: {
    userId: { type: String, required: false },
    userName: { type: String, required: false }
  },
  cameraId: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
  location: {
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },
    fullAddress: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'processed'], required: true, default: 'pending' },
  isFalseAlarm: { type: Boolean, default: false },
  screenshot: { type: String, required: true }
}, { timestamps: true });

export const Accident = mongoose.models.Accident || mongoose.model('Accident', AccidentSchema);
