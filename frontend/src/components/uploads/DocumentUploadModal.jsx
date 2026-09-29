import {
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import useProjects from "../../hooks/useProjects";

import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  formatFileSize,
} from "../../utils/fileFormat";

const EMPTY_FORM = {
  title: "",
  description: "",
  projectId: "",
};

/*
 * Upload a document.
 *
 * `lockedProjectId` is supplied when uploading from
 * inside a Project, so the user is not asked to pick
 * the project they are already in.
 */
const DocumentUploadModal = ({
  open,
  lockedProjectId = null,
  uploading = false,
  uploadProgress = 0,
  onClose,
  onSubmit,
}) => {
  return (
    <DocumentUploadFields
      key={open ? "open" : "closed"}
      open={open}
      lockedProjectId={lockedProjectId}
      uploading={uploading}
      uploadProgress={uploadProgress}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

const DocumentUploadFields = ({
  open,
  lockedProjectId,
  uploading,
  uploadProgress,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    projectId: lockedProjectId || "",
  });

  const [file, setFile] = useState(null);

  const [error, setError] = useState("");

  const { projects, loading: projectsLoading } =
    useProjects({ autoFetch: open && !lockedProjectId });

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    setError("");

    if (!selected) {
      setFile(null);
      return;
    }

    /*
     * Check the size client-side as well as on the
     * server, so the user gets an immediate answer
     * instead of uploading 11 MB only to be rejected.
     */
    if (selected.size > MAX_UPLOAD_BYTES) {
      setError(
        `"${selected.name}" is ${formatFileSize(
          selected.size
        )}. The maximum upload size is 10 MB.`
      );

      setFile(null);
      event.target.value = "";
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    try {
      setError("");

      await onSubmit({
        file,
        title: form.title.trim() || file.name,
        description: form.description.trim(),
        projectId: form.projectId || null,
      });
    } catch (err) {
      setError(
        err?.message || "Unable to upload this document."
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FileUp}
      title="Upload Document"
      description="Add a PDF, DOCX or TXT file to your research workspace."
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="document-file">
            File
            <span>*</span>
          </label>

          <input
            id="document-file"
            type="file"
            accept={ACCEPTED_UPLOAD_TYPES}
            onChange={handleFileChange}
            disabled={uploading}
          />

          <small className="form-hint">
            PDF, DOCX or TXT · Maximum 10 MB
            {file ? ` · ${formatFileSize(file.size)}` : ""}
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="document-title">
            Title
          </label>

          <input
            id="document-title"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder={
              file ? file.name : "e.g. Transformer Survey"
            }
            disabled={uploading}
          />

          <small className="form-hint">
            Leave blank to use the filename.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="document-description">
            Description
          </label>

          <textarea
            id="document-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows="3"
            placeholder="What does this document contain?"
            disabled={uploading}
          />
        </div>

        {lockedProjectId ? (
          <p className="form-hint">
            This document will be saved to the current
            project.
          </p>
        ) : (
          <div className="form-field">
            <label htmlFor="document-project">
              Project (optional)
            </label>

            <select
              id="document-project"
              name="projectId"
              value={form.projectId}
              onChange={updateField}
              disabled={uploading || projectsLoading}
            >
              <option value="">No project</option>

              {projects.map((project) => (
                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress__heading">
              <span>Uploading</span>
              <strong>{uploadProgress}%</strong>
            </div>

            <div className="upload-progress__track">
              <span
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <small className="form-error">{error}</small>
        )}

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentUploadModal;