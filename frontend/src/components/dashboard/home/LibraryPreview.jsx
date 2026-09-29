import {
  ArrowRight,
  Bookmark,
  FileText,
  Star,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useDashboardPapers from "../../../hooks/useDashboardPapers";
import useDashboardDocuments from "../../../hooks/useDashboardDocuments";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
} from "../../../utils/fileFormat";

/*
 * Tabs map to real records:
 *  - Favorites / Recent map to real papers
 *  - Uploaded maps to real documents
 *
 * Collections is a real domain too, but it has its own
 * workspace at /collections, so it is not duplicated
 * here. The dashboard stays at five cards rather than
 * growing a KPI for every new domain.
 */
const tabs = [
  {
    id: "recent",
    label: "Recent",
    icon: FileText,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Star,
  },
  {
    id: "uploaded",
    label: "Uploaded",
    icon: Upload,
  },
];

const LibraryPreview = () => {
  const [activeTab, setActiveTab] = useState("recent");

  const navigate = useNavigate();

  const { recentPapers, loading: papersLoading } =
    useDashboardPapers();

  const { recentDocuments, loading: documentsLoading } =
    useDashboardDocuments();

  const loading = papersLoading || documentsLoading;

  /*
   * Real library entries only. Papers and documents are
   * distinct models, so they are normalised into one row
   * shape for display rather than merged in the data
   * layer.
   */
  const items =
    activeTab === "uploaded"
      ? recentDocuments.map((document) => ({
          id: document._id,
          title: document.title,
          meta: `${formatFileType(
            document.mimeType
          )} · ${formatFileSize(document.fileSize)}`,
          category:
            document.projectId?.title || "Not assigned",
          href: "/uploads",
        }))
      : recentPapers.map((paper) => ({
          id: paper._id,
          title: paper.title,
          meta: [
            paper.authors?.[0],
            paper.year,
          ]
            .filter(Boolean)
            .join(" · "),
          category:
            paper.source ||
            formatDocumentDate(paper.createdAt),
          href: "/library",
        }));

  const emptyTab =
    activeTab === "favorites" ? "favorites" : activeTab;

  return (
    <section className="dashboard-card library-preview">
      <div className="dashboard-card__header">
        <div>
          <h2>My Library</h2>
          <p>Your organized research knowledge.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/library")}
        >
          Open Library
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="library-preview__tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="library-preview__state">
          <p>Loading your library...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="library-preview__state">
          <p>
            {emptyTab === "uploaded"
              ? "You have not uploaded any documents yet."
              : "Nothing in your library yet."}
          </p>
        </div>
      ) : (
        <div className="library-preview__list">
          {items.map((item) => (
            <article
              className="library-preview__item"
              key={item.id}
            >
              <div className="library-preview__document">
                <FileText size={17} />
              </div>

              <div className="library-preview__info">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>

              <span className="library-preview__category">
                {item.category}
              </span>

              <button
                type="button"
                aria-label={`Open ${item.title}`}
                onClick={() => navigate(item.href)}
              >
                <Bookmark size={14} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default LibraryPreview;