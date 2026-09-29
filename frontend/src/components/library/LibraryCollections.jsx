import {
  ArrowRight,
  FolderOpen,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useCollections from "../../hooks/useCollections";
import useCreateAction from "../../hooks/useCreateAction";

/*
 * Real collections, shown as a shortcut into the
 * Collections workspace. The previous version of this
 * panel rendered hardcoded collection names and paper
 * counts that matched no record; every value below now
 * comes from the Collection collection in MongoDB.
 */
const LibraryCollections = () => {
  const navigate = useNavigate();

  const { handleAction } = useCreateAction();

  const {
    collections,
    loading,
    error,
    fetchCollections,
  } = useCollections({
    sort: "updatedAt",
    order: "desc",
  });

  return (
    <section className="library-collections">
      <div className="library-collections__header">
        <div>
          <h2>Research Collections</h2>

          <p>
            Group related papers and documents into
            focused knowledge collections.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            handleAction("collection")
          }
        >
          <Plus size={15} />
          New Collection
        </button>
      </div>

      {loading ? (
        <p className="library-collections__state">
          Loading collections...
        </p>
      ) : error ? (
        <p className="library-collections__state">
          {error}

          <button
            type="button"
            onClick={fetchCollections}
          >
            Try Again
          </button>
        </p>
      ) : collections.length === 0 ? (
        <p className="library-collections__state">
          You have no collections yet. Create one to
          organise related research.
        </p>
      ) : (
        <div className="library-collections__grid">
          {collections.map((collection) => (
            <article
              key={collection._id}
              className="library-collection-card"
            >
              <span className="library-collection-card__icon">
                <FolderOpen size={21} />
              </span>

              <h3>{collection.name}</h3>

              <p>
                {collection.description ||
                  "No description for this collection."}
              </p>

              <footer>
                <span>
                  {collection.paperCount} paper
                  {collection.paperCount === 1
                    ? ""
                    : "s"}

                  {" · "}

                  {collection.documentCount} document
                  {collection.documentCount === 1
                    ? ""
                    : "s"}
                </span>

                <button
                  type="button"
                  aria-label={`Open ${collection.name}`}
                  onClick={() =>
                    navigate(
                      `/collections/${collection._id}`
                    )
                  }
                >
                  <ArrowRight size={16} />
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default LibraryCollections;
