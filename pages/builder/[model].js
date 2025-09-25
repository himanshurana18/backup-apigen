import Unauthorized from "@/components/Unauthorized";
import axios from "axios";

import Link from "next/link";

import { RiDeleteBinLine } from "react-icons/ri";
import { RiEdit2Line } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";

import { IoClose } from "react-icons/io5";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRestart } from "@/context/RestartContext";

export default function BuilderDynamic() {
  const { data: session } = useSession();

  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [newModelPopup, setNewModelPopup] = useState(false);

  const [popup, setPopup] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [newModelName, setNewModelName] = useState("");
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [dataType, setDataType] = useState("");
  const [required, setRequired] = useState(false);
  const [enumValues, setEnumValues] = useState("");
  const [showRestartPopup, setshowRestartPopup] = useState(false);
  const [modelName, setModelName] = useState("");
  const [fields, setFields] = useState([]);
  const [modelId, setModelId] = useState("");
  const [existingModels, setExistingModels] = useState([]);
  const [Loading, setLoading] = useState(true);

  const router = useRouter();
  const { model } = router.query;

  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDevelopment) {
      return <Unauthorized message="Only work in in Development Mode" />;
    }
  }, []);

  const handleModelNameChange = (e) => {
    setModelName(e.target.value);
    setHasChanges(true);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/models");
      setExistingModels(response.data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching models", error);
      setLoading(false);
    }
  };

  const fetchModelDetails = async (modelId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/models?model=${modelId}`);

      const modelData = response.data;
      setModelName(modelData.name);
      setModelId(modelData._id); // store model id here
      setFields(modelData.fields || []); // set fields from the api response
      setLoading(false);
      setHasChanges(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching model details", error);
    }
  };

  const createNewModel = async () => {
    if (!newModelName.trim()) return alert("Enter a model name ");

    try {
      await axios.post("/api/models", { modelName: newModelName, fields: [] });
      setNewModelPopup(false);
      router.push(`/builder/${newModelName}`);
    } catch (error) {
      alert(
        "Error creating model: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  const handleTogglePopup = (field = null, index = null) => {
    if (popup) {
      // reset form when closing
      setSelectedFieldType(null);
      setFieldName("");
      setFieldType("");
      setDataType("");
      setRequired(false);
      setEnumValues("");
      setEditingFieldIndex(null);
    } else if (field != null) {
      // load existing field for editing
      setSelectedFieldType(field.name);
      setFieldName(field.name);
      setFieldType(field.type);
      setDataType(field.datatype);
      setRequired(field.required || false);
      setEnumValues(field.enumValues ? field.enumValues.join("\n") : "");
      // if editing a relation model, set the selectedModel correctly
      setSelectedModel(field.refModel || "");
      setEditingFieldIndex(index);
    }
    setPopup(!popup);
  };

  const handleFieldTypeClick = (
    type,
    fieldTypeText,
    dataTypeText,
    refModel
  ) => {
    setSelectedFieldType(type);
    setFieldName("");
    setFieldType(fieldTypeText);
    setDataType(dataTypeText);
    setRequired(false);
    setEnumValues("");
    setSelectedModel("");
  };

  const handleFieldNameChange = (e) => {
    const inputValue = e.target.value;
    // Remove spaces, commas, and dots
    const sanitizedValue = inputValue.replace(/[\s,.]/g, "");
    setFieldName(sanitizedValue);
  };

  const addFieldToList = () => {
    if (fieldName && fieldType) {
      let updatedFields = [...fields];

      const newField = {
        name: fieldName,
        type: fieldType,
        datatype: dataType,
        required,
        refModel: fieldType === "arrayrelation" ? selectedModel : "",
        enumValues:
          dataType === "selectmulti" || dataType === "singleselect"
            ? enumValues.split("\n").filter(Boolean)
            : [],
      };

      if (editingFieldIndex !== null) {
        updatedFields[editingFieldIndex] = newField;
      } else {
        updatedFields.push(newField);
      }
      setFields(updatedFields);
      setHasChanges(true);
      setPopup(false);
      setSelectedFieldType(null);
      setFieldName("");
      setFieldType("");
      setRequired(false);
      setEnumValues("");
      setSelectedModel(null);
      setEditingFieldIndex(null);
    } else {
      alert("please fill in the field details");
    }
  };

  const removeField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields.length ? updatedFields : []);
    setHasChanges(true);
  };

  const generateModel = async () => {
    if (!modelName.trim()) return alert("Enter a model name");

    try {
      let response;

      if (modelId) {
        // update existing model
        response = await axios.put(`/api/models?id=${modelId}`, {
          modelName,
          fields,
        });
      } else {
        // create new model
        response = await axios.post(`/api/models`, { modelName, fields });
        setModelId(response.data._id); // store the new model id
        resetForm();
      }
      setSuccess(true);
      setHasChanges(false);
    } catch (err) {
      console.log("error saving model", err);
      alert(
        "error saving model" + (err.response?.data?.message || err.message)
      );
    }
  };

  const resetForm = () => {
    setModelName("");
    setFields([]);
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return str; // return if the string is empty
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    fetchModels();
    if (model) {
      fetchModelDetails(model);
    }
  }, [model]);

  const handleViewJson = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/${modelName.toLowerCase()}?page=1&limit=10`
      );
      setSelectedModel(response.data);
      setShowJsonViewer(true);
    } catch (error) {
      console.error("Error Fetching data", error);
      alert(" failed to fetch data. please try again");
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (id) => {
    if (!id) {
      alert("Cannot delete: Model ID is missing");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this model? It will delete all the pages and API."
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/models?id=${id}`);
      alert("Model deleted successfully");
      fetchModels();
      router.push("/builder/user");
    } catch (error) {
      alert(
        "Error deleting model: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <>
      <div className="content_type_builder_page">
        <div className="existing_model_list">
          <h2>Content-Type Builder</h2>

          <div className="ex_model_list_ul">
            <ul>
              {existingModels.length > 0 ? (
                existingModels.map((model, index) => (
                  <li key={index}>
                    <Link href={`/builder/${model.name}`}>{model.name}</Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link href="/builder/user">User</Link>
                </li>
              )}
            </ul>
            <button onClick={() => setNewModelPopup(true)}>
              + Create a new model{" "}
            </button>
          </div>
        </div>

        <div className="existing_model_collection_details">
          <div className="existing_mo_co_de_title">
            <div>
              <h2>{modelName || "user"}</h2>
              <p>create the data structure of your content</p>
            </div>
            <div className="existing_mo_co_de_addbtn">
              <button onClick={handleTogglePopup}>
                <FaPlus />
                Add another field
              </button>
              <button
                disabled={fields.length === 0 || !hasChanges}
                onClick={generateModel}
                className={success ? "success-button" : ""}
              >
                {success ? (
                  "Saved"
                ) : (
                  <>
                    <FaCheck />
                  </>
                )}
                Save
              </button>
              <button
                onClick={() => {
                  if (!modelId) {
                    alert("Model ID missing. Cannot delete.");
                    return;
                  }
                  deleteModel(modelId);
                }}
                disabled={!modelId} // optional: button disable if id missing
              >
                <FaTrash />
                Delete Model
              </button>
            </div>
          </div>
          <div className="existing_mo_co_de_list">
            <div className="existing_model_name">
              <div className="flex flex-col flex-left gap-05">
                <label htmlFor="">Model Name:</label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "50px" }}
                >
                  <input
                    type="text"
                    placeholder="Model Name"
                    value={modelName}
                    onChange={handleModelNameChange}
                  />
                  {modelName && (
                    <div className="api_path_display">
                      <span>API Path:</span>
                      <code>/api/public/{modelName.toLowerCase()}</code>
                    </div>
                  )}
                  <Link
                    className="model_gen_api_token_btn"
                    href={"/setting/apitokens"}
                  >
                    Generate api token
                  </Link>
                </div>
              </div>

              {modelName !== "User" && (
                <button onClick={() => deleteModel(modelId)}>
                  <RiDeleteBinLine />
                  Delete Model
                </button>
              )}
            </div>
            <div
              className={
                popup
                  ? "add_popup_select_new_field active"
                  : "add_popup_select_new_field"
              }
            >
              <div className="add_popup_new_title">
                <h2>Add New Field</h2>
                <div className="flex gap-1">
                  <button
                    className="save_field_button"
                    onClick={addFieldToList}
                  >
                    Save Field
                  </button>
                  <button onClick={handleTogglePopup}>
                    <IoClose />
                  </button>
                </div>
              </div>
              {selectedFieldType && (
                <div className="field_name_input">
                  <h4>Enter Field Name For {selectedFieldType}</h4>
                  <div className="flex gap-1 mt-1">
                    <input
                      type="text"
                      value={fieldName}
                      onChange={handleFieldNameChange}
                      placeholder={`field name for ${selectedFieldType}`}
                    />
                    <div className="flex gap-05">
                      <input
                        type="checkbox"
                        id="required"
                        checked={required}
                        onChange={() => setRequired(!required)}
                      />
                    </div>
                    Required
                    <input
                      type="text"
                      value={fieldType}
                      readOnly
                      disabled
                      placeholder="Field Type"
                    />
                    <input
                      type="text"
                      value={dataType}
                      readOnly
                      disabled
                      placeholder="data Type"
                    />
                  </div>
                  {(dataType === "selectmulti" ||
                    dataType === "singleselect") &&
                    fieldType !== "arrayrelation" && (
                      <div className="mt-1">
                        <h4>Enumeration Values (one line per value)</h4>
                        <textarea
                          value={enumValues}
                          onChange={(e) => setEnumValues(e.target.value)}
                          placeholder="Enter values, one per line"
                          rows={5}
                          cols={30}
                        />
                      </div>
                    )}

                  {fieldType === "arrayrelation" && (
                    <div className="mt-2">
                      <h4>Select or Enter Relation Model:</h4>
                      <div className="flex gap-3">
                        <select
                          value={selectedModel}
                          onChange={(e) => {
                            const value =
                              e.target.value === "manual" ? "" : e.target.value;
                            setSelectedModel(capitalizeFirstLetter(value)); // capitalize first letter
                          }}
                        >
                          <option value="">select a model</option>
                          {existingModels.map((model, index) => (
                            <option key={index} value={model.name}>
                              {model.name}
                            </option>
                          ))}
                          <option value="manual">Enter Manually</option>
                        </select>

                        {/* show input field if manual input is needed */}
                        {(selectedModel === "" ||
                          !existingModels.some(
                            (model) => model.name === selectedModel
                          )) && (
                          <div className="flex flex-col flex-left">
                            <p>Model Name</p>
                            <input
                              type="text"
                              placeholder="enter model name"
                              value={selectedModel}
                              onChange={(e) =>
                                setSelectedModel(
                                  capitalizeFirstLetter(e.target.value)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="main_add_new_collec_cont">
                {[
                  { name: "Text", fieldType: "string", datatype: "textinput" },
                  {
                    name: "Long Text",
                    fieldType: "string",
                    datatype: "textarea",
                  },
                  {
                    name: "Unique Url",
                    fieldType: "string",
                    datatype: "stringunique",
                  },
                  {
                    name: "Web Link",
                    fieldType: "string",
                    datatype: "stringweblink",
                  },
                  {
                    name: "Email",
                    fieldType: "string",
                    datatype: "inputemail",
                  },
                  {
                    name: "Single Select",
                    fieldType: "string",
                    datatype: "singleselect",
                  },
                  {
                    name: "Password",
                    fieldType: "string",
                    datatype: "password",
                  },
                  {
                    name: "Text Editor",
                    fieldType: "string",
                    datatype: "markdowneditor",
                  },
                  { name: "Number", fieldType: "number", datatype: "number" },
                  { name: "Date", fieldType: "date", datatype: "inputdate" },
                  {
                    name: "Media",
                    fieldType: "array",
                    datatype: "multiimageselect",
                  },
                  {
                    name: "Multi Select",
                    fieldType: "array",
                    datatype: "selectmulti",
                  },
                  {
                    name: "Creatable Select",
                    fieldType: "array",
                    datatype: "creatableselectmulti",
                  },
                  {
                    name: "Boolean",
                    fieldType: "boolean",
                    datatype: "toggleinput",
                  },
                  {
                    name: "Relation",
                    fieldType: "arrayrelation",
                    datatype: "selectmulti",
                  }, // relation with other models
                ].map((fieldOption) => {
                  const isActive =
                    fieldType === fieldOption.fieldType &&
                    dataType === fieldOption.datatype;
                  return (
                    <div
                      key={fieldOption.name}
                      className={
                        isActive ? "add_colle_type active" : "add_colle_type"
                      }
                      onClick={() =>
                        handleFieldTypeClick(
                          fieldOption.name,
                          fieldOption.fieldType,
                          fieldOption.datatype
                        )
                      }
                    >
                      <h3>{fieldOption.name}</h3>
                      <h4>
                        Field Type:<strong>{fieldOption.fieldType}</strong>
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>NAME</th>
                  <th>FIELD TYPE</th>
                  <th>DATA TYPE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="field_not_found">
                        <img src="/img/document.png" alt="" />
                        <h4>Add your first field to this Collection-Type</h4>
                        <button onClick={handleTogglePopup}>
                          Add New Field
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{field.name}</td>
                      <td>{field.type}</td>
                      <td>{field.datatype}</td>
                      <td className="edit_de_td">
                        <button onClick={() => handleTogglePopup(field, index)}>
                          <RiEdit2Line />
                        </button>
                        <button onClick={() => removeField(index)}>
                          <RiDeleteBinLine />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {newModelPopup && (
        <div className="popup_background">
          <div className="popup_box">
            <h2>Create New Model</h2>

            <input
              type="text"
              placeholder="Enter Model Name"
              value={newModelName}
              onChange={(e) => {
                const value = e.target.value;
                if (!value.includes(" ")) {
                  setNewModelName(value.toLowerCase());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
            />

            <div className="popup_buttons">
              <button onClick={createNewModel}>
                <FaCheck />
                Create
              </button>
              <button onClick={() => setNewModelPopup(false)}>
                <IoClose />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestartPopup && (
        <div className="popup_background">
          <div className="popup_box" style={{ textAlign: "center" }}>
            <h2>Application Restarting</h2>
            <div style={{ margin: "20px 0" }}>
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
              <p style={{ marginTop: "10px" }}>
                Please wait while the application restart...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
