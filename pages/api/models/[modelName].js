import { dbConnect } from "@/lib/dbConnect";
import ModelSchema from "@/models/ModelSchema";

export default async function handler(req, res) {
  await dbConnect();
  const { modelName } = req.query;

  if (req.method === "GET") {
    try {
      const model = await ModelSchema.findOne({ name: modelName });
      if (!model) return res.status(404).json({ message: "Model not found" });
      res.status(200).json(model);
    } catch (error) {
      res.status(500).json({ message: "Error fetching model", error });
    }
  } else if (req.method === "DELETE") {
    try {
      const model = await ModelSchema.findOneAndDelete({
        name: new RegExp(`^${modelName}$`, "i"),
      });

      if (!model) return res.status(404).json({ message: "Model not found" });

      // Optional: delete associated files here
      res.status(200).json({ message: "Model deleted successfully", model });
    } catch (error) {
      res.status(500).json({ message: "Error deleting model", error });
    }
  }
}
