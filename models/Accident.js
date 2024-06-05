import mongoose from 'mongoose';

const AccidentSchema = new mongoose.Schema({
  time_detected: { type: Date, required: true },
  cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
  cameraDetails: {
    cameraName: String,
    cameraFullAddress: String,
  },
  location: String,
  status: { type: String, default: 'pending' },
  isFalseAlarm: { type: Boolean, default: false },
  screenshot: String,
  processedBy: {
    userId: String,
    userName: String,
    email: String,
    image: String
  }
});

export const Accident = mongoose.models.Accident || mongoose.model('Accident', AccidentSchema);
