import { Schema, model, models } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    permissions: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    routes: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      trim: true
    },
    isSystemRole: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Role = models.Role || model("Role", roleSchema, "roles");