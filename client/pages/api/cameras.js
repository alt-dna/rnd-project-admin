import { Camera } from "../../../models/Camera";
import { mongooseConnect } from "@/lib/mongoose";
import {isAdminReq} from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  const isAdmin = await isAdminReq(req, res);
  if (!isAdmin) {
    return;
  }

  switch (method) {
    case 'POST':
      try {
        const {
          cameraName,
          cameraCity,
          cameraDistrict,
          cameraWard,
          cameraStreet,
          cameraFullAddress,
          cameraUrl,
          description,
          coordinates,
          status,
          manageGroup,
          createdDate
        } = req.body;

        const cameraDoc = await Camera.create({
          cameraName,
          cameraCity,
          cameraDistrict,
          cameraWard,
          cameraStreet,
          cameraFullAddress,
          cameraUrl,
          description,
          coordinates,
          status,
          manageGroup,
          createdDate
        });

        res.status(201).json(cameraDoc);
      } catch (error) {
        console.error("Error creating camera document:", error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'GET':
      try {
        if(req.query?.id) {
          const camera = await Camera.findOne({_id:req.query.id}).populate('manageGroup');
          res.json(camera);
        } else {
          const cameras = await Camera.find().populate('manageGroup');
          res.status(200).json(cameras);
        }
      } catch (error) {
        console.error("Error fetching cameras:", error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const {
          _id,
          cameraName,
          cameraCity,
          cameraDistrict,
          cameraWard,
          cameraStreet,
          cameraFullAddress,
          cameraUrl,
          description,
          coordinates,
          status,
          manageGroup,
          createdDate
        } = req.body;

        const updatedCameraDoc = await Camera.findByIdAndUpdate(
          _id,
          {
            cameraName,
            cameraCity,
            cameraDistrict,
            cameraWard,
            cameraStreet,
            cameraFullAddress,
            cameraUrl,
            description,
            coordinates,
            status,
            manageGroup,
            createdDate
          },
          { new: true }
        );

        res.status(200).json(updatedCameraDoc);
      } catch (error) {
        console.error("Error updating camera document:", error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        if (req.query?.id) {
          const deletedCamera = await Camera.findByIdAndDelete(req.query.id);
          if (!deletedCamera) {
            return res.status(404).json({ success: false, error: "Camera not found" });
          }
          res.status(200).json({ success: true, data: true });
        } else {
          res.status(400).json({ success: false, error: "Camera ID is required" });
        }
      } catch (error) {
        console.error("Error deleting camera document:", error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      break;
  }
}
