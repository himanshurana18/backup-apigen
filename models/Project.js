import { Schema, models, model } from "mongoose";

const ProjectSchema = new Schema({
     title: {type: String, datatype: "textinput", enum: []},
 seoTitle: {type: String, datatype: "textinput"},
 seoDescription: {type: String, datatype: "textarea"},
 focusKeywords: [ { type: String, datatype: "creatableselectmulti" } ],
 canonicalUrl: {type: String, datatype: "stringweblink"},
 metaRobots: {type: String, datatype: "singleselect"},
 openGraphTitle: {type: String, datatype: "singleselect"},
 openGraphDescription: {type: String, datatype: "textarea"}
}, { timestamps: true });

export const Project = models.Project || model("Project", ProjectSchema, "projects");