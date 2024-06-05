import { mongooseConnect } from "@/lib/mongoose";
import { isAdminReq } from "@/pages/api/auth/[...nextauth]";
import { Accident } from '../../../models/Accident';

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  const isAdmin = await isAdminReq(req, res);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const { status, cameraId, processedBy } = req.query;
        const query = {};
        if (status) query.status = status;
        if (cameraId) query.cameraId = cameraId;
        if (processedBy) query["processedBy.name"] = processedBy;
        const accidents = await Accident.find(query).populate('cameraId').sort({ time_detected: -1 });
        res.status(200).json(accidents);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch accidents' });
      }
      break;

    case 'PUT':
      try {
        const { _id, ...updateData } = req.body;
        const session = await getSession({ req });
        const updatedAccident = await Accident.findByIdAndUpdate(
          _id,
          {
            ...updateData,
            processedBy: {
              userId: session.user.email,
              userName: session.user.name
            }
          },
          { new: true }
        );
        res.status(200).json(updatedAccident);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update accident' });
      }
      break;

      case 'POST':
        try {
          const { accident_id, isFalseAlarm, processedBy, time_detected } = req.body;

          const accident = await Accident.findById(accident_id);
          if (!accident) {
            return res.status(404).json({ error: 'Accident not found' });
          }

          accident.isFalseAlarm = isFalseAlarm;
          accident.processedBy = processedBy;
          accident.status = isFalseAlarm ? 'false alarm' : 'processed';
          accident.time_detected = time_detected;

          await accident.save();

          res.status(200).json({ message: 'Accident status updated successfully' });
        } catch (error) {
          console.error(`Error updating accident status: ${error}`);
          res.status(500).json({ error: 'Error updating accident status' });
        }
      break;

    case 'DELETE':
      try {
        const { _id } = req.query;
        await Accident.findByIdAndDelete(_id);
        res.status(200).json({ message: 'Accident deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete accident' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
      break;
  }
}
