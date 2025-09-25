import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  datatype: { type: String, required: true },
});

const ModelSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    fields: { type: [FieldSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ModelSchema ||
  mongoose.model("ModelSchema", ModelSchema);
