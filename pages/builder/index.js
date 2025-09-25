import Link from "next/link";
import axios from "axios";

import { FaPlus } from "react-icons/fa";
import { LuFileJson2 } from "react-icons/lu";
import { RiEdit2Line } from "react-icons/ri";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/router";
import { IoClose } from "react-icons/io5";
import Unauthorized from "../../components/Unauthorized";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
// import Unauthorized from "../../components/Unauthorized";

export default function Builder() {
  const { data: session } = useSession();
  const [existingModels, setExistingModels] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [newModelPopup, setNewModelPopup] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const router = useRouter();

  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDevelopment) {
      return <Unauthorized message="Only work in Development Mode" />;
    }
    fetchModels(); // ✅ page load hote hi models fetch karo
  }, []);

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

  const createNewModel = async () => {
    if (!newModelName.trim()) return alert("Enter a model name ");

    try {
      await axios.post("/api/models", { modelName: newModelName, fields: [] });
      setNewModelPopup(false);
      setNewModelName(""); // ✅ input clear
      fetchModels(); // ✅ list refresh
      router.push(`/builder/${newModelName}`);
    } catch (error) {
      alert(
        "Error creating model: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  // const deleteModel = async (modelId) => {
  //   const confirmed = confirm(
  //     "Are you sure you want to delete this model? It will delete all the pages and API."
  //   );
  //   if (!confirmed) return;

  //   try {
  //     await axios.delete(`/api/models?id=${modelId}`);
  //     alert("Model deleted successfully");
  //     fetchModels(); // ✅ list refresh after delete
  //     router.push("/builder/user");
  //   } catch (error) {
  //     alert(
  //       "Error deleting model: " +
  //         (error.response?.data?.message || error.message)
  //     );
  //   }
  // };
  const deleteModel = async (modelName) => {
    const confirmed = confirm("Are you sure you want to delete this model?");
    if (!confirmed) return;

    try {
      await axios.delete(`/api/models/${modelName}`);
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

  const handleViewJson = async (model) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/${model.name.toLowerCase()}?page=1&limit=10`
      );
      setSelectedModel(response.data);
      setShowJsonViewer(true);
    } catch (error) {
      console.error("Error Fetching data", error);
      alert("Failed to fetch data. Please try again");
    } finally {
      setLoading(false);
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
          <div className="existing_mo_co-de_title">
            <div>
              <h2>Total Models</h2>
              <p>create the Model for structure of your content</p>
            </div>
            <div className="existing_mo_co_de_addbtn">
              <button onClick={() => setNewModelPopup(true)}>
                <FaPlus />
                Add another Model
              </button>
            </div>
          </div>

          <div className="existing_mo_co_de_list">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>MODEL NAME</th>
                  <th>CREATED DATE</th>
                  <th>TOTAL FIELDS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {existingModels.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="field_not_found">
                        <img src="/img/document.png" alt="document" />
                        <h4>Add your first model</h4>
                        <button onClick={() => setNewModelPopup(true)}>
                          + Create a new Model{" "}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  existingModels.map((model, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{model.name}</td>
                      <td>
                        {new Date(model.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>{model.fields.length}</td>
                      <td className="edot_de_td">
                        <button
                          onClick={() => handleViewJson(model)}
                          title="view json"
                        >
                          <LuFileJson2 />
                        </button>
                        <Link href={`/builder/${model.name}`} title="edit">
                          <RiEdit2Line />
                        </Link>
                        {model.name === "user" ? null : (
                          <button onClick={() => deleteModel(model.name)}>
                            <RiDeleteBinLine />
                          </button>
                        )}
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
              // value={newModelName}
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
              <button>
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
      {/* <JsonViewer /> */}
    </>
  );
}
