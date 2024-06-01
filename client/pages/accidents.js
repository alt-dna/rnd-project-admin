import { mongooseConnect } from "@/lib/mongoose";
import { isAdminReq } from "@/pages/api/auth/[...nextauth]";
import { Accident } from "../../models/Accident";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  await mongooseConnect();
  const { method } = req;

  const isAdmin = await isAdminReq(req, res);
  if (!isAdmin) {
    return;
  }

  switch (method) {
    case 'POST':
      try {
        const accidentData = req.body;
        const newAccident = await Accident.create(accidentData);
        res.status(201).json(newAccident);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create accident' });
      }
      break;

    case 'GET':
      try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const accidents = await Accident.find(query).populate('cameraId processedBy.userId');
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
          { ...updateData, processedBy: { userId: session.user.email, userName: session.user.name } },
          { new: true }
        );
        res.status(200).json(updatedAccident);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update accident' });
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
