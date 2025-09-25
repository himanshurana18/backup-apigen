import { Schema, models, model } from "mongoose";
  import mongoose from "mongoose";
  
  const DhdhSchema = new Schema({
    djdj: {type: String, datatype: "textinput", enum: []},
 seoTitle: {type: String, datatype: "textinput"},
 seoDescription: {type: String, datatype: "textarea"},
 focusKeywords: [ { type: String, datatype: "creatableselectmulti" } ],
 canonicalUrl: {type: String, datatype: "stringweblink"},
 metaRobots: {type: String, datatype: "singleselect"},
 openGraphTitle: {type: String, datatype: "singleselect"},
 openGraphDescription: {type: String, datatype: "textarea"}
  }, { timestamps: true });
  
  // Add timestamps hook for model refreshing if needed
  DhdhSchema.pre('save', function() {
    this.updatedAt = new Date();
  });
  
  // Support for dynamic model loading - export both the schema and model
  export { DhdhSchema };
  
  // Use models.X pattern to prevent model redefinition errors
  export const Dhdh = models.Dhdh || model('Dhdh', DhdhSchema, 'dhdhs');