import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FileText,
  Link2,
  Star,
} from "lucide-react";

import { useState } from "react";

import { useParams } from "react-router-dom";

import AddPaperToProjectModal from "../components/projects/AddPaperToProjectModal";

import usePaper from "../hooks/usePaper";
import useToast from "../hooks/useToast";

import { addPaperToProject } from "../api/projectApi";

import "../components/library/library.css";

const PaperDetailPage = () => {
  const { id } = useParams();

  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);

  const {
    paper,
    loading,
    error,
    refetch,
    toggleFavorite,
  } = usePaper(id);

  if (loading) {
    return (
      <div className="paper-detail-page">
        <div className="paper-detail-state">
          <p>Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="paper-detail-page">
        <div className="paper-detail-state paper-detail-state--error">
          <h2>Paper unavailable</h2>

          <p>
            {error || "This paper could not be found."}
          </p>

          <button type="button" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "—";

  const handleFavorite = async () => {
    try {
      const updated = await toggleFavorite();

      toast.success(
        updated?.isFavorite
          ? "Added to favorites"
          : "Removed from favorites",
        paper.title
      );
    } catch (err) {
      console.error("[Paper] Favorite error:", err);

      toast.error(
        "Could not update favorite",
        err?.message || "Please try again."
      );
    }
  };

  const handleAddToProject = async (projectId) => {
    await addPaperToProject(projectId, paper._id);

    toast.success(
      "Paper added",
      `"${paper.title}" was attached to the project.`
    );
  };

  const infoRows = [
    { label: "Source", value: paper.source },
    { label: "DOI", value: paper.doi },
    { label: "Year", value: paper.year },
    { label: "Journal", value: paper.journal },
    {
      label: "Citations",
      value:
        typeof paper.citationCount === "number"
          ? paper.citationCount
          : null,
    },
    { label: "Added", value: formatDate(paper.createdAt) },
    {
      label: "Last updated",
      value: formatDate(paper.updatedAt),
    },
  ].filter(
    (row) =>
      row.value !== null &&
      row.value !== undefined &&
      row.value !== ""
  );

  return (
    <div className="paper-detail-page">
      <button
        type="button"
        className="paper-back"
        onClick={() => window.history.back()}
      >
        <ArrowLeft size={16} />
        Research Library
      </button>

      <header className="paper-detail-header">
        <div className="paper-detail-header__main">
          <div>
            <h1>{paper.title}</h1>

            <p className="paper-detail-header__authors">
              {paper.authors?.length
                ? paper.authors.join(" · ")
                : "Unknown authors"}
            </p>

            <div className="paper-detail-header__meta">
              {paper.journal && (
                <span>{paper.journal}</span>
              )}

              {paper.year && <span>{paper.year}</span>}

              {paper.source && (
                <span>{paper.source}</span>
              )}
            </div>
          </div>

          <div className="paper-detail-header__actions">
            <button
              type="button"
              className={
                paper.isFavorite ? "favorite" : ""
              }
              onClick={handleFavorite}
            >
              <Star
                size={15}
                fill={
                  paper.isFavorite
                    ? "currentColor"
                    : "none"
                }
              />

              {paper.isFavorite
                ? "Favorited"
                : "Favorite"}
            </button>

            <button
              type="button"
              className="paper-detail-header__primary"
              onClick={() => setAddOpen(true)}
            >
              <Link2 size={15} />
              Add to Project
            </button>

            {paper.url && (
              <a
                className="paper-detail-header__link"
                href={paper.url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} />
                Source
              </a>
            )}

            {paper.pdfUrl && (
              <a
                className="paper-detail-header__link"
                href={paper.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FileText size={15} />
                PDF
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="paper-detail-grid">
        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Abstract</h2>
              <p>Summary supplied by the source.</p>
            </div>

            <FileText size={19} />
          </div>

          <p className="paper-detail__abstract">
            {paper.abstract ||
              "No abstract available for this paper."}
          </p>

          {paper.keywords?.length > 0 && (
            <div className="paper-detail__keywords">
              <span className="library-preview__label">
                Keywords
              </span>

              <div className="library-preview__tags">
                {paper.keywords.map((keyword) => (
                  <span key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Paper Information</h2>
              <p>Saved library record.</p>
            </div>

            <CalendarDays size={19} />
          </div>

          <div className="project-detail-info">
            {infoRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <AddPaperToProjectModal
        open={addOpen}
        mode="project"
        paper={paper}
        onClose={() => setAddOpen(false)}
        onAddToProject={handleAddToProject}
      />
    </div>
  );
};

export default PaperDetailPage;