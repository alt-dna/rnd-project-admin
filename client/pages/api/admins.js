import { mongooseConnect } from "@/lib/mongoose";
import { isAdminReq } from "@/pages/api/auth/[...nextauth]";
import { Admin } from "../../../models/Admin";

export default async function handle(req, res) {
  await mongooseConnect();
  const isAdmin = await isAdminReq(req, res);
  if (!isAdmin) return;

  async function logAdminActivity(adminEmail, action, details) {
    try {
      const admin = await Admin.findOne({ email: adminEmail }).exec();
      if (admin) {
        admin.activityLog.push({ action, details });
        await admin.save();
      } else {
        console.error("Admin not found");
      }
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  }

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { email } = req.body;
        const adminExists = await Admin.findOne({ email }).exec();

        if (adminExists) {
          res.status(400).json({ message: 'Admin already exists!' });
        } else {
          const newAdmin = await Admin.create({ email });
          await logAdminActivity(email, 'created admin', `Admin email: ${email}`);
          res.status(201).json(newAdmin);
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
      }
      break;

    case 'DELETE':
      try {
        const { _id } = req.query;
        const adminToDelete = await Admin.findByIdAndDelete(_id).exec();
        if (adminToDelete) {
          await logAdminActivity(adminToDelete.email, 'deleted admin', `Admin ID: ${_id}`);
          res.status(200).json(true);
        } else {
          res.status(404).json({ message: 'Admin not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
      }
      break;

    case 'GET':
      try {
        const admins = await Admin.find().exec();
        res.status(200).json(admins);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
      break;
  }
}
