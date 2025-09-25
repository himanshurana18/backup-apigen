import { dbConnect } from "../../../lib/dbConnect";

import { User } from "../../../models/user";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { firstname, lastname, email, password } = req.body;
    const db = await dbConnect();

    // count how many users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res
        .status(403)
        .json({ message: "you don't have an access to register" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      userRole: "superAdmin",
      createdAt: new Date(),
      updateAt: new Date(), // by default first user is super admin
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: result._id,
        firstname,
        lastname,
        email,
        userRole: "superAdmin",
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    // handle error
  }
}
