import { Schema, model, models } from "mongoose";

const envVarSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default models.EnvVar || model("EnvVar", envVarSchema, "envvars");