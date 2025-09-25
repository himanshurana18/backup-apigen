export const generateModelCode = (modelName, fields) => {
  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const formattedName = capitalizeFirstLetter(modelName); // renamed variable

  return `

import { Schema, models, model } from "mongoose";

const ${formattedName}Schema = new Schema({
    ${fields}
}, { timestamps: true });

export const ${formattedName} = models.${formattedName} || model("${formattedName}", ${formattedName}Schema, "${formattedName.toLowerCase()}s");    

`.trim();
};
