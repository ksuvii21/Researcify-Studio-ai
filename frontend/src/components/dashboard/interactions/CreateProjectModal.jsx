import {
  FolderKanban,
  Loader2,
} from "lucide-react";

import { useState } from "react";

import Modal from "../../common/Modal";
import useToast from "../../../hooks/useToast";

const initialForm = {
  name: "",
  description: "",
  researchArea: "",
  visibility: "private",
};

const CreateProjectModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] =
    useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Project name is required.";
    }

    if (form.name.trim().length > 100) {
      nextErrors.name =
        "Project name must be under 100 characters.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    // Phase 8:
    // await projectApi.createProject(form);

    await new Promise((resolve) =>
      setTimeout(resolve, 650)
    );

    toast.success(
      "Project created",
      `"${form.name.trim()}" is ready for research.`
    );

    setSubmitting(false);
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FolderKanban}
      title="Create Research Project"
      description="Organize papers, notes and AI research around a topic."
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="project-name">
            Project Name
            <span>*</span>
          </label>

          <input
            id="project-name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="e.g. Artificial Intelligence in Education"
            autoFocus
          />

          {errors.name && (
            <small className="form-error">
              {errors.name}
            </small>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="project-description">
            Description
          </label>

          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows="4"
            placeholder="What are you researching?"
          />

          <small className="form-hint">
            Give your project enough context for
            future AI-assisted research.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="research-area">
            Research Area
          </label>

          <input
            id="research-area"
            name="researchArea"
            value={form.researchArea}
            onChange={updateField}
            placeholder="e.g. Artificial Intelligence"
          />
        </div>

        <div className="form-field">
          <label htmlFor="project-visibility">
            Visibility
          </label>

          <select
            id="project-visibility"
            name="visibility"
            value={form.visibility}
            onChange={updateField}
          >
            <option value="private">
              Private
            </option>

            <option value="shared">
              Shared Workspace
            </option>
          </select>
        </div>

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2
                  size={14}
                  className="spin"
                />
                Creating...
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

export default CreateProjectModal;