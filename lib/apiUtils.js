import { dbConnect } from "./dbConnect";
import { getdynamicModels } from "./dynamicModels";
export async function getModelForApi(modelName) {
  try {
    // First try to get the model dynamically
    const model = await getdynamicModels(modelName.toLowerCase());
    return model;
  } catch (err) {
    // If dynamic loading fails, try to import it directly
    console.warn(
      `Dynamic model loading failed for ${modelName}, attempting direct import`
    );
    try {
      const capitalizedModelName =
        modelName.charAt(0).toUpperCase() + modelName.slice(1);
      const module = await import(`../models/${capitalizedModelName}.js`);
      return module[capitalizedModelName];
    } catch (directError) {
      console.error(`Failed to load model ${modelName}`, directError);
      throw Error(`Could not load model: ${modelName}`);
    }
  }
}
export function withDynamicModels(handler) {
  return async (req, res) => {
    try {
      // Inject the getModel function into the request object
      req.getModel = getModelForApi;
      return await handler(req, res);
    } catch (err) {
      console.error("API error with dynamic models: ", err);
      return res
        .status(500)
        .json({ error: err.message || "Internal server error" });
    }
  };
}
