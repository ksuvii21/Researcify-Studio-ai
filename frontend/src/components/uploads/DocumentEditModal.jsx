import {
  Loader2,
  Pencil,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import useProjects from "../../hooks/useProjects";

/*
 * Edit a document's metadata.
 *
 * Only the fields the API accepts are exposed: title,
 * description and projectId. Server-owned values such as
 * originalName, storagePath, mimeType, fileSize and
 * processingStatus are not editable and are not sent.
 *
 * "No project" sends projectId: null, which detaches the
 * document rather than leaving it where it was.
 */
const DocumentEditModal = ({
  open,
  document,
  saving = false,
  onClose,
  onSubmit,
}) => {
  return (
    <DocumentEditFields
      key={document?._id || "none"}
      open={open}
      document={document}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

const DocumentEditFields = ({
  open,
  document,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: document?.title || "",
    description: document?.description || "",
    projectId:
      typeof document?.projectId === "object" && document?.projectId
        ? document.projectId._id
        : document?.projectId || "",
  });

  const [error, setError] = useState("");

  const { projects, loading: projectsLoading } = useProjects({
    autoFetch: open,
  });

  if (!document) return null;

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError("A title is required.");
      return;
    }

    try {
      setError("");

      await onSubmit({
        title,
        description: form.description.trim(),
        /*
         * An empty select means "no project", which must be
         * sent as null rather than omitted, otherwise the
         * existing attachment would be preserved.
         */
        projectId: form.projectId || null,
      });
    } catch (err) {
      setError(
        err?.message || "Unable to save these changes."
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={Pencil}
      title="Edit Document"
      description={document.originalFileName}
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="document-edit-title">
            Title
            <span>*</span>
          </label>

          <input
            id="document-edit-title"
            name="title"
            value={form.title}
            onChange={updateField}
            disabled={saving}
          />
        </div>

        <div className="form-field">
          <label htmlFor="document-edit-description">
            Description
          </label>

          <textarea
            id="document-edit-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows="3"
            placeholder="What does this document contain?"
            disabled={saving}
          />
        </div>

        <div className="form-field">
          <label htmlFor="document-edit-project">
            Project
          </label>

          <select
            id="document-edit-project"
            name="projectId"
            value={form.projectId}
            onChange={updateField}
            disabled={saving || projectsLoading}
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

        {error && (
          <small className="form-error">{error}</small>
        )}

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentEditModal;
