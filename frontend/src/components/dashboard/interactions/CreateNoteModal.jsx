import {
  Loader2,
  NotebookPen,
} from "lucide-react";

import { useState } from "react";

import Modal from "../../common/Modal";
import useToast from "../../../hooks/useToast";

const initialForm = {
  title: "",
  content: "",
  project: "",
  tags: "",
};

const CreateNoteModal = ({
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

    if (!form.title.trim()) {
      nextErrors.title =
        "Note title is required.";
    }

    if (!form.content.trim()) {
      nextErrors.content =
        "Add some content to your note.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    // Phase 8:
    // await noteApi.createNote(form);

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    toast.success(
      "Note created",
      `"${form.title.trim()}" was added to your workspace.`
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
      icon={NotebookPen}
      title="Create Note"
      description="Capture an idea, finding or research summary."
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="note-title">
            Note Title
            <span>*</span>
          </label>

          <input
            id="note-title"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Limitations of current XAI methods"
            autoFocus
          />

          {errors.title && (
            <small className="form-error">
              {errors.title}
            </small>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="note-content">
            Note
            <span>*</span>
          </label>

          <textarea
            id="note-content"
            name="content"
            value={form.content}
            onChange={updateField}
            rows="7"
            placeholder="Write your research note..."
          />

          {errors.content && (
            <small className="form-error">
              {errors.content}
            </small>
          )}
        </div>

        <div className="interaction-form__row">
          <div className="form-field">
            <label htmlFor="note-project">
              Project
            </label>

            <select
              id="note-project"
              name="project"
              value={form.project}
              onChange={updateField}
            >
              <option value="">
                No project
              </option>

              <option value="ai-education">
                Artificial Intelligence in Education
              </option>

              <option value="sustainable-iot">
                Sustainable IoT Systems
              </option>

              <option value="hci">
                Human-Computer Interaction
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="note-tags">
              Tags
            </label>

            <input
              id="note-tags"
              name="tags"
              value={form.tags}
              onChange={updateField}
              placeholder="AI, education, XAI"
            />
          </div>
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
                Saving...
              </>
            ) : (
              <>
                <NotebookPen size={14} />
                Create Note
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNoteModal;