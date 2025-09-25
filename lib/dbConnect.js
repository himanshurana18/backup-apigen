import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose || { conn: null, promise: null };

const reloadModel = async (modelName) => {
  const capitalizedName =
    modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const modelPath = path.join(process.cwd(), "models", `${capitalizedName}.js`);

  // check if file exists
  if (fs.existsSync(modelPath)) {
    try {
      // Delete the model from mongoose models collection to allow re-registration
      delete mongoose.models[capitalizedName];

      // clear the module from require cache to force reload
      const fullPath = require.resolve(modelPath);
      if (require.cache[fullPath]) {
        delete require.cache[fullPath];
      }
      const modelModule = await import(`../models/${capitalizedName}.js`);
      return modelModule[capitalizedName];
    } catch (err) {
      console.error(`Error reloading model ${capitalizedName}:`, err);
      return null;
      // silently fail or log if needed
    }
  }
};

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  // check if the .needs-restart file exists and if so, try to clear it
  const needsRestartPath = path.join(process.cwd(), ".needs-restart");

  if (fs.existsSync(needsRestartPath)) {
    try {
      // Read the content to see what model needs refreshing
      const content = fs.readFileSync(needsRestartPath, "utf-8").trim();
      if (content) {
        await reloadModel(content);
        console.log(`Reloaded model ${content} during DB connection`);
      }

      // remove the file
      fs.unlinkSync(needsRestartPath);
    } catch (err) {
      console.warn("Failed to handle model refresh", err);
    }
  }
  return cached.conn;
}
