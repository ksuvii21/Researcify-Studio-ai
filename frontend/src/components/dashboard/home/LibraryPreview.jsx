import {
  ArrowRight,
  Bookmark,
  FileText,
  Folder,
  Star,
  Upload,
} from "lucide-react";
import { useState } from "react";

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
  {
    id: "collections",
    label: "Collections",
    icon: Folder,
  },
];

const libraryItems = [
  {
    title:
      "Generative AI and Personalized Learning Environments",
    meta: "R. Sharma · 2026",
    category: "Artificial Intelligence",
  },
  {
    title:
      "Human-AI Collaboration: Emerging Research Directions",
    meta: "S. Patel · 2026",
    category: "Human-Computer Interaction",
  },
  {
    title:
      "Explainable AI in Adaptive Learning Systems",
    meta: "L. Chen · 2025",
    category: "Machine Learning",
  },
];

const LibraryPreview = () => {
  const [activeTab, setActiveTab] =
    useState("recent");

  return (
    <section className="dashboard-card library-preview">
      <div className="dashboard-card__header">
        <div>
          <h2>My Library</h2>
          <p>
            Your organized research knowledge.
          </p>
        </div>

        <button type="button" className="text-button">
          Open Library
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="library-preview__tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={
              activeTab === id ? "active" : ""
            }
            onClick={() => setActiveTab(id)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="library-preview__list">
        {libraryItems.map((item) => (
          <article
            className="library-preview__item"
            key={item.title}
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
              aria-label="Save paper"
            >
              <Bookmark size={14} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LibraryPreview;