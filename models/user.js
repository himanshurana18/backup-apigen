import { Schema, model, models } from "mongoose";
const userSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    password: { type: String },
    email: { type: String },
    block: { type: Boolean },
    userRole: { type: String },
  },
  { timestamps: true }
);
export const User = models.User || model("User", userSchema, "users");
