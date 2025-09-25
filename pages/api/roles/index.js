import { dbConnect } from "../../../lib/dbConnect";
import { Role } from "../../../models/Role";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const roles = await Role.find({});
      res.status(200).json({ success: true, roles });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
