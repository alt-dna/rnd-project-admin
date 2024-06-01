import { ManageGroup } from "../../../models/ManageGroup";
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
        const { groupName, address, phoneNumber, district } = req.body;
        const group = await ManageGroup.create({ groupName, address, phoneNumber, district });
        res.status(201).json(group);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'GET':
      try {
        const { district } = req.query;
        let groups;
        if (district) {
          groups = await ManageGroup.find({ district });
        } else {
          groups = await ManageGroup.find();
        }
        res.status(200).json(groups);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed" });
      break;
  }
}
