import {
  Loader2,
  NotebookPen,
  Pencil,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import usePapers from "../../hooks/usePapers";
import useProjects from "../../hooks/useProjects";

const EMPTY_FORM = {
  title: "",
  content: "",
  tags: "",
  projectId: "",
  paperId: "",
};

/*
 * Create/Edit note.
 *
 * `lockedProjectId` is supplied when creating from
 * inside a Project, so the user is not asked to pick
 * the project they are already in.
 */
const NoteFormModal = ({
  open,
  note = null,
  lockedProjectId = null,
  defaultPaperId = null,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const editing = Boolean(note?._id);

  const buildForm = (source) => {
    if (!source) {
      return {
        ...EMPTY_FORM,
        projectId: lockedProjectId || "",
        paperId: defaultPaperId || "",
      };
    }

    return {
      title: source.title || "",
      content: source.content || "",
      tags: (source.tags || []).join(", "),
      projectId:
        source.projectId?._id ||
        source.projectId ||
        "",
      paperId:
        source.paperId?._id || source.paperId || "",
    };
  };

  return (
    <NoteFormFields
      key={open ? note?._id || "create" : "closed"}
      open={open}
      initialValues={buildForm(note)}
      editing={editing}
      lockedProjectId={lockedProjectId}
      lockedPaperId={defaultPaperId}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

const NoteFormFields = ({
  open,
  initialValues,
  editing,
  lockedProjectId,
  lockedPaperId,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialValues);

  const [error, setError] = useState("");

  // Only fetch the pickers when this mode needs them.
  const { projects, loading: projectsLoading } =
    useProjects({ autoFetch: open && !lockedProjectId });

  const { papers, loading: papersLoading } = usePapers({
    autoFetch: open && !lockedPaperId,
  });

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

    if (
      !form.title.trim() &&
      !form.content.trim()
    ) {
      setError(
        "A note needs a title or some content."
      );

      return;
    }

    try {
      setError("");

      await onSubmit({
        title: form.title.trim(),
        content: form.content,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        projectId: form.projectId || null,
        paperId: form.paperId || null,
      });
    } catch (err) {
      setError(
        err?.message ||
        `Unable to ${editing ? "update" : "create"
        } note.`
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={editing ? Pencil : NotebookPen}
      title={editing ? "Edit Note" : "New Note"}
      description="Capture findings, observations and ideas."
      size="lg"
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="note-form-title">
            Title
          </label>

          <input
            id="note-form-title"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Transformer attention notes"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label htmlFor="note-form-content">
            Content
          </label>

          <textarea
            id="note-form-content"
            name="content"
            value={form.content}
            onChange={updateField}
            rows="7"
            placeholder="What did you observe?"
          />
        </div>

        <div className="form-field">
          <label htmlFor="note-form-tags">
            Tags
          </label>

          <input
            id="note-form-tags"
            name="tags"
            value={form.tags}
            onChange={updateField}
            placeholder="rag, transformer, attention"
          />

          <small className="form-hint">
            Separate tags with commas.
          </small>
        </div>

        {lockedProjectId ? (
          <p className="form-hint">
            This note will be saved to the current
            project.
          </p>
        ) : (
          <div className="form-field">
            <label htmlFor="note-form-project">
              Project (optional)
            </label>

            <select
              id="note-form-project"
              name="projectId"
              value={form.projectId}
              onChange={updateField}
              disabled={projectsLoading}
            >
              <option value="">
                No project
              </option>

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

        {lockedPaperId ? (
          <p className="form-hint">
            This note will be saved to the current
            paper.
          </p>
        ) : (
          <div className="form-field">
            <label htmlFor="note-form-paper">
              Paper (optional)
            </label>

            <select
              id="note-form-paper"
              name="paperId"
              value={form.paperId}
              onChange={updateField}
              disabled={papersLoading}
            >
              <option value="">
                No paper
              </option>

              {papers.map((paper) => (
                <option
                  key={paper._id}
                  value={paper._id}
                >
                  {paper.title}
                </option>
              ))}
            </select>
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
                <Loader2 size={14} className="spin" />
                Saving...
              </>
            ) : editing ? (
              <>
                <Pencil size={14} />
                Save Changes
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

export default NoteFormModal;