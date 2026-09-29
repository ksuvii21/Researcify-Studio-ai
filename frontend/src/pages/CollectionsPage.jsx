import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import CollectionCard from "../components/collections/CollectionCard";
import CollectionFormModal from "../components/collections/CollectionFormModal";
import CollectionsHeader from "../components/collections/CollectionsHeader";
import CollectionsToolbar from "../components/collections/CollectionsToolbar";
import CollectionStats from "../components/collections/CollectionStats";

import useCollections from "../hooks/useCollections";
import useToast from "../hooks/useToast";

import {
  formatDocumentDate,
} from "../utils/fileFormat";

import "../components/collections/collections.css";

const CollectionsPage = () => {
  const navigate = useNavigate();

  const toast = useToast();

  const {
    collections,
    loading,
    error,
    mutationLoading,
    fetchCollections,
    createCollection,
    deleteCollection,
    togglePin,
  } = useCollections({
    autoFetch: true,
  });

  const [query, setQuery] = useState("");

  const [sort, setSort] = useState("updatedAt");

  const [view, setView] = useState("grid");

  const [tab, setTab] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);

  /*
   * The list endpoint already filters search, pinned and
   * archived server-side, but the tab is applied here so
   * switching between All / Pinned / Archived is instant
   * and does not refetch the same records.
   */
  const visibleCollections = useMemo(() => {
    if (tab === "pinned") {
      return collections.filter(
        (collection) => collection.isPinned
      );
    }

    if (tab === "archived") {
      return collections.filter(
        (collection) => collection.isArchived
      );
    }

    return collections.filter(
      (collection) => !collection.isArchived
    );
  }, [collections, tab]);

  const sortedCollections = useMemo(() => {
    const result = [...visibleCollections];

    if (sort === "name") {
      return result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sort === "items") {
      return result.sort(
        (a, b) =>
          b.paperCount +
          b.documentCount -
          (a.paperCount + a.documentCount)
      );
    }

    /*
     * Pinned collections float to the top, matching the
     * ordering the API applies.
     */
    return result.sort(
      (a, b) =>
        Number(b.isPinned) - Number(a.isPinned) ||
        new Date(b.updatedAt) -
          new Date(a.updatedAt)
    );
  }, [visibleCollections, sort]);

  // ---------------------------------------------------
  // Create
  // ---------------------------------------------------

  const handleCreate = async (values) => {
    try {
      const created = await createCollection(values);

      setCreateOpen(false);

      toast.success(
        "Collection created",
        `"${created?.name || values.name}" is ready.`
      );
    } catch (err) {
      console.error(
        "[Collections] Create error:",
        err
      );

      toast.error(
        "Could not create collection",
        err?.message ||
          "A collection with this name may already exist."
      );
    }
  };

  // ---------------------------------------------------
  // Pin / delete
  // ---------------------------------------------------

  const handleTogglePin = async (collectionId) => {
    try {
      const updated = await togglePin(collectionId);

      toast.success(
        updated?.isPinned
          ? "Collection pinned"
          : "Collection unpinned"
      );
    } catch (err) {
      console.error(
        "[Collections] Pin error:",
        err
      );

      toast.error(
        "Could not update pin",
        err?.message || "Please try again."
      );
    }
  };

  const handleDelete = async (collection) => {
    const confirmed = window.confirm(
      `Delete "${collection.name}"? The ${collection.paperCount} paper(s) and ${collection.documentCount} document(s) inside will not be deleted.`
    );

    if (!confirmed) return;

    try {
      await deleteCollection(collection._id);

      toast.success(
        "Collection deleted",
        "The papers and documents were kept."
      );
    } catch (err) {
      console.error(
        "[Collections] Delete error:",
        err
      );

      toast.error(
        "Delete failed",
        err?.message ||
          "Unable to delete this collection."
      );
    }
  };

  const isFiltered =
    query.trim() ||
    tab !== "all" ||
    sort !== "updatedAt";

  return (
    <div className="collections-page">
      <CollectionsHeader
        onCreate={() => setCreateOpen(true)}
      />

      <CollectionStats
        collections={collections}
      />

      <CollectionsToolbar
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        activeTab={tab}
        setActiveTab={setTab}
        count={sortedCollections.length}
      />

      {loading ? (
        <section className="collections-empty">
          <h2>Loading collections...</h2>
        </section>
      ) : error ? (
        <section className="collections-empty">
          <h2>Could not load collections</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchCollections}
          >
            Try Again
          </button>
        </section>
      ) : sortedCollections.length === 0 ? (
        <section className="collections-empty">
          <h2>
            {collections.length === 0
              ? "No collections yet"
              : "No collections found"}
          </h2>

          <p>
            {collections.length === 0
              ? "Create a collection to organise related papers and documents."
              : isFiltered
                ? "Try another search, tab or sort order."
                : "Create a collection to get started."}
          </p>

          {collections.length === 0 && (
            <button
              type="button"
              onClick={() =>
                setCreateOpen(true)
              }
            >
              Create Collection
            </button>
          )}
        </section>
      ) : (
        <section
          className={[
            "collections-grid",
            view === "list"
              ? "collections-grid--list"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {sortedCollections.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={{
                id: collection._id,
                name: collection.name,
                description:
                  collection.description,
                pinned: collection.isPinned,
                archived: collection.isArchived,
                paperCount: collection.paperCount,
                documentCount:
                  collection.documentCount,
                updatedAt: formatDocumentDate(
                  collection.updatedAt
                ),
              }}
              view={view}
              onTogglePin={handleTogglePin}
              onOpen={(id) =>
                navigate(`/collections/${id}`)
              }
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      <CollectionFormModal
        open={createOpen}
        loading={mutationLoading}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CollectionsPage;
