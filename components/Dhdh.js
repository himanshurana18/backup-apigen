'use client';
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useMemo, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { ReactSortable } from 'react-sortablejs';
import { LuSave } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from "react-toastify";
import { CompoStyles } from "@/styles/CompoStyles";

export default function DhdhForm({
  _id,
  djdj: existingDjdj,
  seoTitle: existingSeoTitle,
  seoDescription: existingSeoDescription,
  focusKeywords: existingFocusKeywords,
  canonicalUrl: existingCanonicalUrl,
  metaRobots: existingMetaRobots,
  openGraphTitle: existingOpenGraphTitle,
  openGraphDescription: existingOpenGraphDescription,
}) {

  const formatDate = (date) => {
    if (!date) return ''; // Handle null, undefined, or empty string
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return ''; // Validate date
    // Ensure the date is in the format "YYYY-MM-DDTHH:MM"
    return parsedDate.toISOString().slice(0, 16); // Slicing to get YYYY-MM-DDTHH:MM
  };

  const [djdj, setDjdj] = useState(existingDjdj || '');
  const [seoTitle, setSeoTitle] = useState(existingSeoTitle || '');
  const [seoDescription, setSeoDescription] = useState(existingSeoDescription || '');
  const [focusKeywords, setFocusKeywords] = useState(existingFocusKeywords
    ? existingFocusKeywords.map(w => {
      if (typeof w === 'object') {
        const labelKey = Object.keys(w).find(k => k !== '_id') || '_id';
        return {
          value: w._id || w,
          label: w[labelKey] || w._id || w
        };
      }
      return { value: w, label: w };
    }) : []);
  const [canonicalUrl, setCanonicalUrl] = useState(existingCanonicalUrl || '');
  const [metaRobots, setMetaRobots] = useState(existingMetaRobots || '');
  const [openGraphTitle, setOpenGraphTitle] = useState(existingOpenGraphTitle || '');
  const [openGraphDescription, setOpenGraphDescription] = useState(existingOpenGraphDescription || '');

  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);
  const [existingModels, setExistingModels] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const formRef = useRef();

  const initialValues = useMemo(() => ({
    djdj: existingDjdj || ''
  }), []);

  useEffect(() => {
    const hasChanges = () => {
      return JSON.stringify(djdj) !== JSON.stringify(initialValues.djdj) ||
        seoTitle !== existingSeoTitle ||
        seoDescription !== existingSeoDescription ||
        JSON.stringify(focusKeywords) !== JSON.stringify(existingFocusKeywords) ||
        canonicalUrl !== existingCanonicalUrl ||
        metaRobots !== existingMetaRobots ||
        openGraphTitle !== existingOpenGraphTitle ||
        openGraphDescription !== existingOpenGraphDescription;
    };
    setIsModified(hasChanges());
  }, [djdj, seoTitle, seoDescription, focusKeywords, canonicalUrl, metaRobots, openGraphTitle, openGraphDescription]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/models");
      setExistingModels(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching models", error);
      setLoading(false);
    }
  };

  async function createDhdh(ev) {
    ev.preventDefault();

    const data = {
      seoTitle,
      seoDescription,
      focusKeywords: focusKeywords.map(option => option.value),
      canonicalUrl,
      metaRobots,
      openGraphTitle,
      openGraphDescription,
    };
    
    data.djdj = djdj;

    try {
      if (_id) {
        try {
          await axios.put(`/api/dhdh`, { ...data, _id });
          toast.success("Dhdh updated!");
        } catch (error) {
          if (error.response.status === 403) {
            toast.error("Permission denied to Demo User.");
          }
        }
      } else {
        try {
          await axios.post(`/api/dhdh`, data);
          toast.success("Dhdh created!");
        } catch (error) {
          if (error.response.status === 403) {
            toast.error("Permission denied to Demo User.");
          }
        }
      }
    } catch (error) {
      console.error("Error saving dhdh:", error);
      toast.error("Failed to save dhdh.");
      if (error.response.status === 403) {
        toast.error("Permission denied to Demo User.");
      }
    }
  }

  return (
    <div className="page_compo_create_update">
      <style jsx global>{CompoStyles}</style>
      <div className="existing_content_type">
        <h2>Content-Type List</h2>
        <div className="existing_content_type_list">
          <ul>
            {existingModels.length > 0 ? (
              existingModels.map((model, index) => (
                <li key={index}>
                  <Link href={`/manager/${model.name}/`}>{model.name}</Link>
                </li>
              ))
            ) : (
              <li><Link href='/manager/user'>User</Link></li>
            )}
          </ul>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-header">
          <div className="form-title">
            Create a Dhdh
            <span>Craft. Publish. Shine. Repeat. Win.</span>
          </div>
          <button className="publish-btn" type="submit" onClick={() => formRef.current?.requestSubmit()} disabled={!isModified}>
            <LuSave />
            {isModified ? "Save Now" : "No Changes"}
          </button>
        </div>

        <div className="tab-buttons">
          <button className={`tab-button ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
          <button className={`tab-button ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>SEO</button>
        </div>

        <form className="form-container" ref={formRef} onSubmit={createDhdh}>
          {activeTab === 'content' ? (
            <>
              <div className="form-section">
                <h3 className="section-title">Content Details</h3>
                <div className="form-group">
                  <label className="form-label">djdj</label>
                  <input type="text" name="djdj" value={djdj} onChange={(e) => setDjdj(e.target.value)} className="form-control" required={false} />
                </div>
              </div>
            </>
          ) : (
            <div className="seo-section">
              <h3 className="section-title">SEO Settings</h3>
              <div className="form-group">
                <label className="form-label">SEO Title</label>
                <input type="text" name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <textarea name="seoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="form-control"></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Focus Keywords</label>
                <CreatableSelect isMulti options={[]} value={focusKeywords} onChange={(selected) => setFocusKeywords(selected)} className="react-select-container" classNamePrefix="react-select" />
              </div>             
              <div className="form-group">
                <label className="form-label">Canonical URL</label>
                <div className="web_link_input">
                  <div className="flex w-100">
                    <span className="prefix">https://</span>
                    <input type="text" name="canonicalUrl" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className="myinput-link" placeholder="Site.com" />
                  </div>
                </div>
              </div> 
              <div className="form-group">
                <label className="form-label">Meta Robots</label>
                <input type="text" name="metaRobots" value={metaRobots} onChange={(e) => setMetaRobots(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Open Graph Title</label>
                <input type="text" name="openGraphTitle" value={openGraphTitle} onChange={(e) => setOpenGraphTitle(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Open Graph Description</label>
                <textarea name="openGraphDescription" value={openGraphDescription} onChange={(e) => setOpenGraphDescription(e.target.value)} className="form-control"></textarea>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}