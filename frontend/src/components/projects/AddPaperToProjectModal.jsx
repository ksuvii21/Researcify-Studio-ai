import {
  BookOpen,
  FolderKanban,
  Link2,
  Loader2,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import usePapers from "../../hooks/usePapers";
import useProjects from "../../hooks/useProjects";

/*
 * Relationship modal with two entry modes:
 *
 *   mode="paper"    (from a Project)
 *     -> list the user's library, attach one to this project
 *
 *   mode="project"  (from a Paper)
 *     -> list the user's projects, attach this paper to one
 *
 * Only the user's own resources are ever listed, and the
 * backend re-checks ownership on every call.
 */
const AddPaperToProjectModal = ({
  open,
  mode = "paper",
  projectPapers = [],
  paper = null,
  onClose,
  onAddPaper,
  onAddToProject,
}) => {
  const [selectedId, setSelectedId] = useState("");

  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [prevMode, setPrevMode] = useState(mode);

  const isPaperMode = mode === "paper";

  const [wasOpen, setWasOpen] = useState(open);

  /*
   * Reset the selection when the modal opens or the
   * mode changes. Adjusting state during render (rather
   * than in an effect) avoids a second render pass.
   */
  if (open !== wasOpen || mode !== prevMode) {
    setWasOpen(open);
    setPrevMode(mode);
    setSelectedId("");
    setSearch("");
    setError("");
  }

  // Library list (paper mode only).
  const {
    papers,
    loading: papersLoading,
  } = usePapers({
    search: isPaperMode ? search : "",
    autoFetch: open && isPaperMode,
  });

  // Project list (project mode only).
  const {
    projects,
    loading: projectsLoading,
  } = useProjects({
    autoFetch: open && !isPaperMode,
  });

  const attachedIds = new Set(
    projectPapers.map((item) => item._id)
  );

  const availablePapers = isPaperMode
    ? papers.filter(
        (item) => !attachedIds.has(item._id)
      )
    : [];

  const loading = isPaperMode
    ? papersLoading
    : projectsLoading;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId) {
      setError(
        isPaperMode
          ? "Select a paper to add."
          : "Select a project to add this paper to."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (isPaperMode) {
        await onAddPaper(selectedId);
      } else {
        await onAddToProject(selectedId);
      }

      onClose();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to complete this request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isPaperMode ? BookOpen : FolderKanban}
      title={
        isPaperMode
          ? "Add Paper to Project"
          : "Add to Project"
      }
      description={
        isPaperMode
          ? "Choose a paper from your research library."
          : paper?.title || ""
      }
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        {isPaperMode && (
          <div className="form-field">
            <label htmlFor="attach-paper-search">
              Search your library
            </label>

            <input
              id="attach-paper-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search title, author, journal..."
            />
          </div>
        )}

        <div className="relation-options">
          {loading ? (
            <p className="relation-options__state">
              Loading...
            </p>
          ) : isPaperMode ? (
            availablePapers.length === 0 ? (
              <p className="relation-options__state">
                {search.trim()
                  ? "No matching papers in your library."
                  : "Every paper in your library is already attached to this project."}
              </p>
            ) : (
              availablePapers.map((item) => (
                <label
                  key={item._id}
                  className={`relation-option ${
                    selectedId === item._id
                      ? "relation-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="relation-target"
                    value={item._id}
                    checked={selectedId === item._id}
                    onChange={(event) =>
                      setSelectedId(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>{item.title}</strong>

                    <small>
                      {item.authors?.length
                        ? item.authors.join(", ")
                        : "Unknown authors"}

                      {item.year
                        ? ` · ${item.year}`
                        : ""}
                    </small>
                  </div>
                </label>
              ))
            )
          ) : projects.length === 0 ? (
            <p className="relation-options__state">
              You have no projects yet. Create one first.
            </p>
          ) : (
            projects.map((item) => (
              <label
                key={item._id}
                className={`relation-option ${
                  selectedId === item._id
                    ? "relation-option--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="relation-target"
                  value={item._id}
                  checked={selectedId === item._id}
                  onChange={(event) =>
                    setSelectedId(event.target.value)
                  }
                />

                <div>
                  <strong>{item.title}</strong>

                  <small>{item.status}</small>
                </div>
              </label>
            ))
          )}
        </div>

        {error && (
          <small className="form-error">{error}</small>
        )}

        <div className="interaction-form__actions">
          <button
            type="button"
            className="interaction-btn interaction-btn--secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="interaction-btn interaction-btn--primary"
            disabled={submitting || loading || !selectedId}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="spin" />
                Adding...
              </>
            ) : (
              <>
                <Link2 size={14} />
                {isPaperMode ? "Add Paper" : "Add to Project"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPaperToProjectModal;