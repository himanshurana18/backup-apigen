import { Schema, models, model } from "mongoose";

const SomethingSchema = new Schema({
     ohho: {type: String, datatype: "stringunique", enum: []},
 mai: {type: String, datatype: "textarea", enum: []},
 seoTitle: {type: String, datatype: "textinput"},
 seoDescription: {type: String, datatype: "textarea"},
 focusKeywords: [ { type: String, datatype: "creatableselectmulti" } ],
 canonicalUrl: {type: String, datatype: "stringweblink"},
 metaRobots: {type: String, datatype: "singleselect"},
 openGraphTitle: {type: String, datatype: "singleselect"},
 openGraphDescription: {type: String, datatype: "textarea"}
}, { timestamps: true });

export const Something = models.Something || model("Something", SomethingSchema, "somethings");