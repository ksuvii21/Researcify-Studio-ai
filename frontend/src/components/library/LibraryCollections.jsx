import {
  ArrowRight,
  FolderOpen,
  Plus,
} from "lucide-react";

import { libraryCollections } from "../../data/libraryMockData";

const LibraryCollections = () => {
  return (
    <section className="library-collections">
      <div className="library-collections__header">
        <div>
          <h2>Research Collections</h2>

          <p>
            Group related literature into
            focused knowledge collections.
          </p>
        </div>

        <button type="button">
          <Plus size={15} />
          New Collection
        </button>
      </div>

      <div className="library-collections__grid">
        {libraryCollections.map(
          (collection) => (
            <article
              key={collection.id}
              className="library-collection-card"
            >
              <span className="library-collection-card__icon">
                <FolderOpen size={21} />
              </span>

              <h3>{collection.name}</h3>

              <p>
                {collection.description}
              </p>

              <footer>
                <span>
                  {collection.papers} papers
                </span>

                <button
                  type="button"
                  aria-label={`Open ${collection.name}`}
                >
                  <ArrowRight size={16} />
                </button>
              </footer>
            </article>
          )
        )}
      </div>
    </section>
  );
};

export default LibraryCollections;