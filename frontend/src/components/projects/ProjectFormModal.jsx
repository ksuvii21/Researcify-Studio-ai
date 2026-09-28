import {
  FolderKanban,
  FolderPen,
  Loader2,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

const EMPTY_FORM = {
  title: "",
  description: "",
  researchQuestion: "",
  status: "Active",
};

/*
 * Create/Edit project.
 *
 * Reuses the Phase 7 Modal shell and the
 * interaction-form styles from CreateProjectModal so
 * there is one visual language for project forms.
 */
const ProjectFormModal = ({
  open,
  project = null,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const editing = Boolean(project?._id);

  const buildForm = (source) =>
    source
      ? {
          title: source.title || "",
          description: source.description || "",
          researchQuestion:
            source.researchQuestion || "",
          status: source.status || "Active",
        }
      : EMPTY_FORM;

  /*
   * The form is remounted whenever the modal opens
   * or a different project is edited, so the fields
   * are seeded from props at mount instead of being
   * synced through an effect.
   */
  return (
    <ProjectFormFields
      key={
        open
          ? project?._id || "create"
          : "closed"
      }
      open={open}
      initialValues={buildForm(project)}
      editing={editing}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

const ProjectFormFields = ({
  open,
  initialValues,
  editing,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialValues);

  const [error, setError] = useState("");

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

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    try {
      setError("");

      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        researchQuestion:
          form.researchQuestion.trim(),
        status: form.status,
      });
    } catch (err) {
      setError(
        err?.message ||
        `Unable to ${editing ? "update" : "create"
        } project.`
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={editing ? FolderPen : FolderKanban}
      title={
        editing
          ? "Edit Research Project"
          : "Create Research Project"
      }
      description="Organize your research around a focused question."
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="project-form-title">
            Project Title
            <span>*</span>
          </label>

          <input
            id="project-form-title"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Artificial Intelligence in Education"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label htmlFor="project-form-question">
            Research Question
          </label>

          <textarea
            id="project-form-question"
            name="researchQuestion"
            value={form.researchQuestion}
            onChange={updateField}
            rows="3"
            placeholder="What are you trying to investigate?"
          />
        </div>

        <div className="form-field">
          <label htmlFor="project-form-description">
            Description
          </label>

          <textarea
            id="project-form-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows="4"
            placeholder="What are you researching?"
          />
        </div>

        <div className="form-field">
          <label htmlFor="project-form-status">
            Status
          </label>

          <select
            id="project-form-status"
            name="status"
            value={form.status}
            onChange={updateField}
          >
            <option value="Active">Active</option>
            <option value="Completed">
              Completed
            </option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {error && (
          <small className="form-error">
            {error}
          </small>
        )}

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={14}
                  className="spin"
                />
                Saving...
              </>
            ) : editing ? (
              <>
                <FolderPen size={14} />
                Save Changes
              </>
            ) : (
              <>
                <FolderKanban size={14} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;