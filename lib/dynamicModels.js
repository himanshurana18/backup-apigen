import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { dbConnect } from "./dbConnect";

// Simple in-memory cache for models
const modelCache = new Map();

export async function getdynamicModels(modelName) {
  await dbConnect();
  const capitalizedModelName =
    modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const modelFilePath = path.join(
    process.cwd(),
    "models",
    `${capitalizedModelName}.js`
  );

  if (!fs.existsSync(modelFilePath)) {
    throw new Error(`Model file not found : ${modelFilePath}`);
  }

  const stats = fs.statSync(modelFilePath);
  const lastModified = stats.mtime.getTime();
  const cachedModel = modelCache.get(modelName);
  if (cachedModel && cachedModel.lastModified === lastModified) {
    return cachedModel.model;
  }
  try {
    if (mongoose.models[capitalizedModelName]) {
      const model = mongoose.models[capitalizedModelName];
      modelCache.set(modelName, { model, lastModified });
      return model;
    }

    console.log(`creating flexible model for: ${capitalizedModelName}`);
    const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
    const model = mongoose.model(capitalizedModelName, schema);
    modelCache.set(modelName, { model, lastModified });
    return model;
  } catch (err) {
    console.error(`Error loading model ${capitalizedModelName}:`, err);
    if (mongoose.models[capitalizedModelName]) {
      return mongoose.models[capitalizedModelName];
    }
    const fallBackSchema = new mongoose.Schema(
      {},
      { strict: false, timestamps: true }
    );
    const fallBackModel =
      mongoose.models[capitalizedModelName] ||
      mongoose.model(capitalizedModelName, fallBackSchema);
    return fallBackModel;
  }
}

export async function refreshAllModels() {
  await dbConnect();
  const modelsDir = path.join(process.cwd(), "models");
  const modelFiles = fs
    .readdirSync(modelsDir)
    .filter((file) => file.endsWith(".js") && file !== "ModelSchema.js");
  const models = {};
  for (const file of modelFiles) {
    const modelName = file.replace(".js", "");
    const model = await getdynamicModels(modelName.toLowerCase());
    models[modelName] = model;
  }
  return models;
}
export async function checkAndRefreshModel(modelName) {
  const capitalizedModelName =
    modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const modelFilePath = path.join(
    process.cwd(),
    "models",
    `${capitalizedModelName}.js`
  );

  if (!fs.existsSync(modelFilePath)) {
    return false;
  }

  const stats = fs.statSync(modelFilePath);
  const lastModified = stats.mtime.getTime();

  const cachedModel = modelCache.get(modelName);

  if (!cachedModel || cachedModel.lastModified !== lastModified) {
    await getdynamicModels(modelName);
    return true;
  }

  return false;
}
