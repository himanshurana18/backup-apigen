import fs from "fs";
import path from "path";

import ModelSchema from "@/models/ModelSchema";
import { dbConnect } from "@/lib/dbConnect";
import { generateApiCode } from "@/templates/ApiCompo";
import { generatePageCode } from "../../templates/pageCompo";
import { generateModelCode } from "@/templates/ModelCompo";
import { generateComponentCode } from "@/templates/componentsCompo";
import { generateCreateFormCode } from "@/templates/CreatePage";
import { generateEditFormCode } from "@/templates/EditPage";
import { generateApiWithTokenSupport } from "@/templates/ExternalApiCompo";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getdynamicModels } from "@/lib/dynamicModels";

try {
  const needsRestartPath = path.join(process.cwd(), ".needs-restart");
  if (fs.existsSync(needsRestartPath)) {
    fs.unlinkSync(needsRestartPath);
  }
} catch (err) {
  console.error("Error removing .needs-restart file:", err);
}

const checkAuth = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  return session;
};
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export default async function handler(req, res) {
  await dbConnect();

  // check if the request is from signup (creating a user model automatic when first user signup)
  const isSignupUserCreation =
    req.method === "POST" &&
    req.body.modelType &&
    req.body.modelType.toLowerCase() === "user" &&
    req.body.data &&
    req.headers.authorization;

  // skip auth check for signup user creation
  let session = null;
  if (!isSignupUserCreation) {
    session = await checkAuth(req, res);
    if (!session) return;
  }

  const capitalizeType = (type) => {
    const mapping = {
      string: "String",
      number: "Number",
      boolean: "Boolean",
      date: "Date",
      object: "Object",
    };
    return mapping[type] || "String";
  };

  const addReverseRelation = (modelName, relatedModelName) => {
    const relatedModelPath = path.join(
      process.cwd(),
      "models",
      `${capitalizeFirstLetter(relatedModelName)}.js`
    );
    const reverseField = modelName.toLowerCase() + "s";

    if (!fs.existsSync(relatedModelPath)) return;

    let content = fs.readFileSync(relatedModelPath, "utf-8");

    if (content.includes(`${reverseField}: [`)) return; // already added

    const insertPattern = new RegExp(
      "new Schema\\s*\\(\\s*{([\\s\\S]*?)}\\s*,\\s*{\\s*timestamps:\\s*true\\s*}\\s*\\)"
    ); // please don't make mistake in this comment

    const match = insertPattern.exec(content);

    if (!match) return;

    const schemaBody = match[1];
    const lines = schemaBody.trim().split("\n");

    // Ensure the last line ends with a comma
    const lastLineIndex = lines.length - 1;
    lines[lastLineIndex] = lines[lastLineIndex].trim().replace(/,?$/, ",");

    // Add reverse relation line
    const newLine = `${reverseField}: [{ type: Schema.Types.ObjectId, ref: '${capitalizeFirstLetter(
      modelName
    )}' }],`;
    lines.push(newLine);
    const updatedContent = content.replace(schemaBody, updatedSchemaBody);
    fs.writeFilesync(relatedModelPath, updatedContent);
  };
  const formatFields = (fields) => {
    // add default SEO Fields if they don't exist
    const defaultSeoFields = [
      {
        name: "seoTitle",
        type: "string",
        datatype: "textinput",
        required: false,
      },
      {
        name: "seoDescription",
        type: "string",
        datatype: "textarea",
        required: false,
      },
      {
        name: "focusKeywords",
        type: "array",
        datatype: "creatableselectmulti",
        required: false,
      },
      {
        name: "canonicalUrl",
        type: "string",
        datatype: "stringweblink",
        required: false,
      },
      {
        name: "metaRobots",
        type: "string",
        datatype: "singleselect",
        required: false,
      },
      {
        name: "openGraphTitle",
        type: "string",
        datatype: "singleselect",
        required: false,
      },
      {
        name: "openGraphDescription",
        type: "string",
        datatype: "textarea",
        required: false,
      },
    ];
    const allFields = [...fields];
    defaultSeoFields.forEach((seoField) => {
      if (!fields.some((field) => field.name === seoField.name)) {
        allFields.push(seoField);
      }
    });

    // return allFields
    //   .map((field) => {
    //     let typeDefinition = "";
    //     const typeProps = [`type: ${capitalizeType(field.type)}`];

    //     if (field.required) {
    //       typeProps.push("required: true");
    //     }

    //     if (field.datatype) {
    //       typeProps.push(`datatype: "${field.datatype}"`);
    //     }

    //     if (field.enumValues) {
    //       typeProps.push(
    //         `enum: [${field.enumValues.map((v) => `"${v}"`).join(", ")}]`
    //       );
    //     }

    //     if (field.type === "array") {
    //       if (field.refModel) {
    //         typeDefinition = `[{ type: Schema.Types.ObjectId, ref: '${field.refModel}' }]`;
    //       } else {
    //         const arrayTypeProps = [`type: String`];
    //         if (field.datatype) {
    //           arrayTypeProps.push(`datatype: "${field.datatype}"`);
    //         }
    //         if (field.enumValues) {
    //           arrayTypeProps.push(
    //             `enum: [${field.enumValues.map((v) => `"${v}"`).join(", ")}]`
    //           );
    //         }
    //         typeDefinition = `[ { ${arrayTypeProps.join(", ")} } ]`;
    //       }
    //     } else if (field.refModel) {
    //       typeDefinition = `[{ type : Schema.Types.ObjectId,ref: '${field.refModel}'}]`;

    //       // code continues
    //     } else {
    //       typeDefinition = `{${typeProps.join(", ")}}`;
    //     }
    //     return ` ${field.name}:${typeDefinition}`;
    //   })
    //   .join(",\n");
    return allFields
      .map((field) => {
        let typeDefinition = ""; // FIXED

        const typeProps = [`type: ${capitalizeType(field.type)}`];

        if (field.required) {
          typeProps.push("required: true");
        }

        if (field.datatype) {
          typeProps.push(`datatype: "${field.datatype}"`);
        }

        if (field.enumValues) {
          typeProps.push(
            `enum: [${field.enumValues.map((v) => `"${v}"`).join(", ")}]`
          );
        }

        if (field.type === "array") {
          if (field.refModel) {
            typeDefinition = `[{ type: Schema.Types.ObjectId, ref: '${field.refModel}' }]`;
          } else {
            const arrayTypeProps = [`type: String`];
            if (field.datatype) {
              arrayTypeProps.push(`datatype: "${field.datatype}"`);
            }
            if (field.enumValues) {
              arrayTypeProps.push(
                `enum: [${field.enumValues.map((v) => `"${v}"`).join(", ")}]`
              );
            }
            typeDefinition = `[ { ${arrayTypeProps.join(", ")} } ]`;
          }
        } else if (field.refModel) {
          // FIXED: ek single ref ke liye
          typeDefinition = `{ type : Schema.Types.ObjectId, ref: '${field.refModel}' }`;
        } else {
          typeDefinition = `{${typeProps.join(", ")}}`;
        }

        return ` ${field.name}: ${typeDefinition}`;
      })
      .join(",\n");
  };
  if (req.method === "POST") {
    // skip permission check for signup user creation
    // if(!issignupuserCreation && ) we will create it letter after rbsc

    try {
      // support both formats;
      // 1. From signup.js: { modelType: 'User', data: {...}}
      // 2. Regular format: { modelName, fields }

      let modelName, fields;

      if (req.body.modelType && req.body.data) {
        // handle user model creation from signup
        modelName = req.body.modelType.toLowerCase();

        // convert user data to fields format
        const userData = req.body.data;

        // define explicit field types for user model
        const userFieldTypes = {
          id: { fieldType: "string", datatype: "textinput" },
          firstname: { fieldType: "string", datatype: "textinput" },
          lastname: { fieldType: "string", datatype: "textinput" },
          email: { fieldType: "string", datatype: "textemail" },
          password: { fieldType: "string", datatype: "password" },
          userRole: {
            fieldType: "string",
            datatype: "singleselect",
            enumValues: ["superadmin", "contentmanager", "demo"],
          },
          createdAt: { fieldType: "date", datatype: "inputdate" },
          updatedAt: { fieldType: "date", datatype: "inputdate" },
        };

        fields = Object.entries(userData).map(([key, value]) => {
          // use predefined type for user model fields or determine from value
          let fieldType, datatype, enumValues;
          if (modelName == "user" && userFieldTypes[key]) {
            fieldType = userFieldTypes[key].fieldType;
            datatype = userFieldTypes[key].datatype;
            if (userFieldTypes[key].enumValues) {
              enumValues = userFieldTypes[key].enumValues;
            }
          } else {
            // Determine types from value
            let type = typeof value;

            if (Array.isArray(value)) {
              fieldType = "date";
              datatype = "selectmulti";
            } else if (
              value instanceof Date ||
              (typeof value === "string" && !isNaN(Date.parse(value)))
            ) {
              fieldType = "date";
              datatype = "inputdate";
            } else if (type === "boolean") {
              fieldType = "boolean";
              datatype = "toggleinput";
            } else if (type === "number") {
              fieldType = "number";
              datatype = "number";
            } else {
              fieldType = "string";
              datartpe = "textinput";
            }
          }
          // define required fields for user model
          const requiredUserFields = [
            "email",
            "firstname",
            "lastname",
            "password",
            "userRole",
          ];
          const isRequired =
            modelName === "user"
              ? requiredUserFields.includes(key)
              : key === "email" || key === "name" || key === "title";

          const field = {
            name: key,
            type: fieldType,
            datatype: datatype,
            required: isRequired,
          };

          // add enumValues if they exist
          if (enumValues) {
            field.enumValues = enumValues;
          }

          return field;
        });
        if (modelName === "user") {
          // list of default fields that should be in a user model
          const defaultUserFields = [
            {
              name: "password",
              type: "string",
              datatype: "password",
              required: true,
            },
            {
              name: "userRole",
              type: "string",
              datatype: "singleselect",
              required: true,
              enumValues: ["superadmin", "contentmanager", "demo"],
            },
            {
              name: "block",
              type: "boolean",
              datatype: "toggleinput",
              required: false,
            },
          ];

          // add any missing default fields
          defaultUserFields.forEach((defaultField) => {
            if (!fields.some((field) => field.name === defaultField.name)) {
              fields.push(defaultField);
            }
          });
        }
      } else {
        modelName = req.body.modelName.toLowerCase();
        fields = req.body.fields;
      }
      if (!modelName || !fields) {
        return res.status(400).json({
          message: "Missing required data: modelName and fields are required",
        });
      }

      const formattedFields = formatFields(fields);

      const modelContent = generateModelCode(modelName, formattedFields);
      const apiContent = generateApiCode(modelName, fields);
      const externalApiContent = generateApiWithTokenSupport(modelName, fields);
      const pageContent = generatePageCode(modelName, fields);
      const componentContent = generateComponentCode(modelName, fields);
      const createPageContent = generateCreateFormCode(modelName);
      const editPageContent = generateEditFormCode(modelName);

      // define where to save the files and how our structure show
      // for models with store here automatic at /models folder
      const modelPath = path.join(
        process.cwd(),
        "models",
        `${capitalizeFirstLetter(modelName)}.js`
      );

      // file save at /pages/api/here.js
      const apiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        `${modelName.toLowerCase()}.js`
      );
      // pages/api/public/here.js
      const extApiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        "public",
        `${modelName.toLowerCase()}.js`
      );

      // pages/manager
      const pageFolderPath = path.join(
        process.cwd(),
        "pages",
        "manager",
        modelName.toLowerCase()
      );

      // pages/manager/edit/[...id].js
      const editPagePath = path.join(pageFolderPath, "edit", "[...id].js");

      // components/here.js
      const componentPath = path.join(
        process.cwd(),
        "components",
        `${capitalizeFirstLetter(modelName)}.js`
      );

      if (!fs.existsSync(pageFolderPath))
        fs.mkdirSync(pageFolderPath, { recursive: true });

      if (!fs.existsSync(path.dirname(editPagePath)))
        fs.mkdirSync(path.dirname(editPagePath), { recursive: true });

      fs.writeFileSync(modelPath, modelContent);
      fs.writeFileSync(apiPath, apiContent);
      fs.mkdirSync(path.dirname(extApiPath), { recursive: true });

      fs.writeFileSync(extApiPath, externalApiContent);
      fs.writeFileSync(path.join(pageFolderPath, "index.js"), pageContent);
      fs.writeFileSync(
        path.join(pageFolderPath, "create.js"),
        createPageContent
      );
      fs.writeFileSync(editPagePath, editPageContent);
      fs.writeFileSync(componentPath, componentContent);

      // add reverse relation to related models
      fields.forEach((field) => {
        if (field.refModel) {
          addReverseRelation(modelName, field.refModel);
        }
      });

      const newModel = new ModelSchema({
        name: modelName.toLowerCase(), // ensure lowercase when saving to db
        fields,
      });

      await newModel.save();

      try {
        await getdynamicModels(modelName).toLowerCase();
        console.log(`Model ${modelName} loaded successfully`);
      } catch (err) {
        console.error(`Error loading model ${modelName}:`, err);
      }

      return res.status(201).json({
        message: "Model,API ,Pages, Component generated successfully",
      });
    } catch (err) {
      console.error("Error creating model:", err);
      return res
        .status(500)
        .json({ message: "Error creating model", error: err.message });
    }
  }
  if (req.method === "PUT") {
    // permission part will be later
    // if(hasPermission)

    try {
      const { id } = req.query;
      const { modelName, fields } = req.body;

      const modelNameLower = modelName.toLowerCase();
      const formattedFields = formatFields(fields);

      // fetch existing model to check old name
      const existingModel = await ModelSchema.findById(id);
      if (!existingModel) {
        return res.status(404).json({ message: "Model not found" });
      }

      const oldName = existingModel.name.toLowerCase(); // ensure comparison is case-insensitive
      const oldModelName = capitalizeFirstLetter(oldName);
      const newModelName = capitalizeFirstLetter(modelNameLower);

      const oldModelPath = path.join(
        process.cwd(),
        "models",
        `${capitalizeFirstLetter(oldModelName)}.js`
      );

      // file save at /pages/api/here.js
      const oldApiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        `${oldName.toLowerCase()}.js`
      );
      // pages/api/public/here.js
      const oldExtApiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        "public",
        `${oldName.toLowerCase()}.js`
      );

      // pages/manager/edit/[...id].js"[...
      const oldpageFolderPath = path.join(
        process.cwd(),
        "pages",
        "manager",
        oldName.toLowerCase()
      );

      // components/here.js
      const oldComponentPath = path.join(
        process.cwd(),
        "components",
        `${oldModelName}.js`
      );

      // Remove old files if name changed
      if (oldName !== modelNameLower) {
        if (fs.existsSync(oldModelPath)) fs.unlinkSync(oldModelPath);
        if (fs.existsSync(oldApiPath)) fs.unlinkSync(oldApiPath);
        if (fs.existsSync(oldExtApiPath)) fs.unlinkSync(oldExtApiPath);
        if (fs.existsSync(oldComponentPath)) fs.unlinkSync(oldComponentPath);
        if (fs.existsSync(oldpageFolderPath))
          fs.unlinkSync(oldpageFolderPath, { recursive: true, force: true });
      }

      // Generate all content
      const modelContent = generateModelCode(modelNameLower, formattedFields);
      const apiContent = generateApiCode(modelNameLower, fields);
      const externalApiContent = generateApiWithTokenSupport(
        modelNameLower,
        fields
      );
      const pageContent = generatePageCode(modelNameLower, fields);
      const componentContent = generateComponentCode(modelNameLower, fields);
      const createPageContent = generateCreateFormCode(modelNameLower);
      const editPageContent = generateEditFormCode(modelNameLower);
      const modelPath = path.join(
        process.cwd(),
        "models",
        `${newModelName}.js`
      );

      // file save at /pages/api/here.js
      const apiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        `${newModelName}.js`
      );
      // pages/api/public/here.js
      const extApiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        "public",
        `${newModelName}.js`
      );

      // pages/manager
      const pageFolderPath = path.join(
        process.cwd(),
        "pages",
        "manager",
        newModelName
      );
      const createPagePath = path.join(pageFolderPath, "create.js");
      const editFolderPath = path.join(pageFolderPath, "edit");

      // pages/manager/edit/[...id].js
      const editPagePath = path.join(editFolderPath, "[...id].js");

      // components/here.js
      const componentPath = path.join(
        process.cwd(),
        "components",
        `${newModelName}.js`
      );

      // create folder base
      if (!fs.existsSync(pageFolderPath))
        fs.mkdirSync(pageFolderPath, { recursive: true });
      if (!fs.existsSync(editFolderPath))
        fs.mkdirSync(editFolderPath, { recursive: true });

      // write all new files
      fs.writeFileSync(modelPath, modelContent);
      fs.writeFileSync(apiPath, apiContent);
      fs.writeFileSync(extApiPath, externalApiContent);
      fs.writeFileSync(path.join(pageFolderPath, "index.js"), pageContent);
      fs.writeFileSync(createPagePath, createPageContent);
      fs.writeFileSync(editPagePath, editPageContent);
      fs.writeFileSync(componentPath, componentContent);

      // add reverse relation to related models
      fields.forEach((field) => {
        if (field.refModel) {
          addReverseRelation(modelNameLower, field.refModel);
        }
      });

      // update db
      await ModelSchema.findByIdAndUpdate(id, { name: modelNameLower, fields });

      try {
        await getdynamicModels(modelNameLower.toLowerCase());
        console.log(`Model ${modelNameLower} loaded successfully`);
      } catch (err) {
        console.error(`Error loading model ${modelNameLower}:`, err);
      }
      return res
        .status(200)
        .json({ message: "Model updated and fields regenerated successfully" });
    } catch (err) {
      console.log(" error updating model", err);
      return res.status(500).json({ message: "error updating model", err });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      // Add this check
      if (!id) {
        return res.status(400).json({ message: "Model ID is required" });
      }

      const model = await ModelSchema.findByIdAndDelete(id);
      if (!model) return res.status(404).json({ message: "Model not found" });

      // delete files
      const modelPath = path.join(process.cwd(), "models", `${model.name}.js`);
      const apiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        `${model.name.toLowerCase()}.js`
      );
      const extApiPath = path.join(
        process.cwd(),
        "pages",
        "api",
        "public",
        `${model.name.toLowerCase()}.js`
      );
      const pageFolderPath = path.join(
        process.cwd(),
        "pages",
        "manager",
        model.name.toLowerCase()
      );
      const componentPath = path.join(
        process.cwd(),
        "components",
        `${capitalizeFirstLetter(model.name)}.js`
      );

      [modelPath, apiPath, extApiPath, componentPath].forEach((file) => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });

      if (fs.existsSync(pageFolderPath))
        fs.rmSync(pageFolderPath, { recursive: true, force: true });

      return res.status(200).json({ message: "Model deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting model", error });
    }
  }

  // if (req.method === "DELETE") {
  //   // permission thing letter

  //   try {
  //     const { id } = req.query;
  //     const model = await ModelSchema.findByIdAndDelete(id);
  //     if (!model) return res.status(404).json({ message: "Model not found" });

  //     // delete files
  //     const modelPath = path.join(process.cwd(), "models", `${model.name}.js`);
  //     const apiPath = path.join(
  //       process.cwd(),
  //       "pages",
  //       "api",
  //       `${model.name.toLowerCase()}.js`
  //     );
  //     const extApiPath = path.join(
  //       process.cwd(),
  //       "pages",
  //       "api",
  //       "public",
  //       `${model.name.toLowerCase()}.js`
  //     );
  //     const pageFolderPath = path.join(
  //       process.cwd(),
  //       "pages",
  //       "manager",
  //       model.name.toLowerCase()
  //     );
  //     const componentPath = path.join(
  //       process.cwd(),
  //       "components",
  //       `${capitalizeFirstLetter(model.name)}.js`
  //     );

  //     [modelPath, apiPath, extApiPath, componentPath].forEach((file) => {
  //       if (fs.existsSync(file)) fs.unlinkSync(file);
  //     });
  //     if (fs.existsSync(pageFolderPath))
  //       fs.rmSync(pageFolderPath, { recursive: true, force: true });
  //     return res.status(200).json({
  //       message: "Model,API,Pages,and Component deleted successfully",
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ message: "Error deleteing model", error });
  //     // handle error
  //   }
  // }
  if (req.method === "GET") {
    try {
      const { id, model } = req.query;
      let models;

      // if an id is provided, find a model by its id
      if (id) {
        models = await ModelSchema.findById(id);
        if (!models) {
          return res.status(404).json({ message: "Model not found" });
        }
      }

      // if a model name is provided, find the model by name (returning the first match)
      else if (model) {
        // case-insensitive search for model name
        models = await ModelSchema.findOne({
          name: { $regex: new RegExp("^" + model + "$", "i") },
        });
        if (!models) {
          return res
            .status(404)
            .json({ message: "No models found with the given name" });
        }
      } else {
        models = await ModelSchema.find();
      }
      return res.status(200).json(models);
    } catch (error) {
      console.log("error fetching models", error);
      return res.status(500).json({ message: "error fetching models", error });

      // error handling code
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
