import mongoose, { model, Schema } from "mongoose";
import { ManageGroup } from "./ManageGroup";

const CameraSchema = new Schema({
  cameraName: { type: String, required: true },
  cameraCity: { type: String, required: true },
  cameraDistrict: { type: String, required: true },
  cameraWard: { type: String, required: true },
  cameraStreet: { type: String, required: true },
  cameraFullAddress: { type: String, required: true },
  cameraUrl: { type: String, required: true },
  description: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ["working", "maintenance"],
    required: true
  },
  createdDate: { type: Date, default: Date.now },
  manageGroup: { type: Schema.Types.ObjectId, ref: 'ManageGroup', required: true }
});

export const Camera = mongoose.models.Camera || mongoose.model('Camera', CameraSchema);
