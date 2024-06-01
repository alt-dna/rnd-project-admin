import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import {Admin} from "../../../../models/Admin";


const adminEmails = ['dinhnguyetanh.ue@gmail.com'];
async function isAdminEmail(email) {
  return !! (await Admin.findOne({email}));
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session, token, user }) => {
      if (await isAdminEmail(session?.user?.email)) {
        return session;
      } else {
        return null;
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminReq(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(await isAdminEmail(session?.user?.email))) {
    res.status(403).json({ error: 'You are not allowed here.' });
    return false;
  }
  return true;
}
