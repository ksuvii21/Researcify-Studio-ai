import {
  Archive,
  ArrowLeft,
  Eye,
  FileText,
  FolderOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Pin,
  Plus,
  ScrollText,
  Search,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AddToCollectionModal from "../components/collections/AddToCollectionModal";
import CollectionFormModal from "../components/collections/CollectionFormModal";
import DocumentPreviewModal from "../components/uploads/DocumentPreviewModal";

import useCollections from "../hooks/useCollections";
import useToast from "../hooks/useToast";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
} from "../utils/fileFormat";

import "../components/collections/collections.css";

/*
 * The collection is the organizational workspace. Every
 * number here is a real relationship length or a real
 * timestamp from the Collection record: there are no
 * reading-progress, collaborator or research-score fields
 * because none exist in the schema.
 */
const CollectionDetailPage = () => {
  const { collectionId } = useParams();

  const navigate = useNavigate();

  const toast = useToast();

  const {
    singleCollection,
    singleLoading,
    singleError,
    fetchCollectionById,
    updateCollection,
    deleteCollection,
    togglePin,
    toggleArchive,
    removePaper,
    removeDocument,
  } = useCollections({
    autoFetch: false,
  });

  const [query, setQuery] = useState("");

  const [tab, setTab] = useState("all");

  const [addType, setAddType] = useState(null);

  const [editOpen, setEditOpen] = useState(false);

  const [previewDoc, setPreviewDoc] = useState(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionById(collectionId);
    }
  }, [collectionId, fetchCollectionById]);

  const papers = (singleCollection?.paperIds || []).filter(
    (paper) => paper && paper._id
  );

  const documents = (
    singleCollection?.documentIds || []
  ).filter((doc) => doc && doc._id);

  const paperCount = papers.length;

  const documentCount = documents.length;

  const matches = (fields) => {
    const term = query.trim().toLowerCase();

    if (!term) return true;

    return fields
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term);
  };

  const visiblePapers =
    tab === "documents" ? [] : papers;

  const visibleDocuments =
    tab === "papers" ? [] : documents;

  const filteredPapers = visiblePapers.filter(
    (paper) =>
      matches([
        paper.title,
        paper.authors?.join(" "),
        paper.journal,
        paper.abstract,
      ])
  );

  const filteredDocuments = visibleDocuments.filter(
    (doc) =>
      matches([
        doc.title,
        doc.originalFileName,
        doc.description,
        doc.mimeType,
      ])
  );

  // ---------------------------------------------------
  // Relationship mutations
  // ---------------------------------------------------
  /*
   * Counts and membership are refetched after every
   * relationship change rather than patched locally.
   * The refetch is cheap, and it means the header, the
   * tabs and the section counts can never disagree with
   * the stored record.
   */
  const refresh = () => fetchCollectionById(collectionId);

  const handleAdded = async ({
    targetName,
    alreadyExisted,
  }) => {
    await refresh();

    if (alreadyExisted) {
      toast.info(
        "Already in collection",
        `"${targetName}" is already in this collection.`
      );

      return;
    }

    toast.success(
      "Added to collection",
      `"${targetName}" is now in this collection.`
    );
  };

  const handleRemovePaper = async (paper) => {
    const confirmed = window.confirm(
      `Remove "${paper.title}" from this collection? The paper stays in your library.`
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await removePaper(collectionId, paper._id);

      await refresh();

      toast.success(
        "Removed from collection",
        `"${paper.title}" stays in your library.`
      );
    } catch (err) {
      console.error(
        "[Collections] Remove paper error:",
        err
      );

      toast.error(
        "Remove failed",
        err?.message ||
          "Unable to remove this paper."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveDocument = async (doc) => {
    const confirmed = window.confirm(
      `Remove "${doc.title}" from this collection? The document and its file stay in your uploads.`
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await removeDocument(collectionId, doc._id);

      await refresh();

      toast.success(
        "Removed from collection",
        `"${doc.title}" stays in your uploads.`
      );
    } catch (err) {
      console.error(
        "[Collections] Remove document error:",
        err
      );

      toast.error(
        "Remove failed",
        err?.message ||
          "Unable to remove this document."
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------
  // Collection actions
  // ---------------------------------------------------

  const handleEdit = async (values) => {
    try {
      setBusy(true);

      await updateCollection(collectionId, values);

      await refresh();

      setEditOpen(false);

      toast.success(
        "Collection updated",
        "The changes were saved."
      );
    } catch (err) {
      console.error(
        "[Collections] Update error:",
        err
      );

      toast.error(
        "Update failed",
        err?.message ||
          "Unable to save these changes."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      const updated = await togglePin(
        collectionId
      );

      await refresh();

      toast.success(
        updated?.isPinned
          ? "Collection pinned"
          : "Collection unpinned"
      );
    } catch (err) {
      console.error("[Collections] Pin error:", err);

      toast.error(
        "Could not update pin",
        err?.message || "Please try again."
      );
    }
  };

  const handleToggleArchive = async () => {
    try {
      const updated = await toggleArchive(
        collectionId
      );

      await refresh();

      toast.success(
        updated?.isArchived
          ? "Collection archived"
          : "Collection unarchived"
      );

      /*
       * An archived collection is hidden from the default
       * Collections list, so leaving the user on a page
       * they can no longer reach from the list would be
       * confusing. Archived collections stay reachable
       * through the Archived tab.
       */
      if (updated?.isArchived) {
        navigate("/collections");
      }
    } catch (err) {
      console.error(
        "[Collections] Archive error:",
        err
      );

      toast.error(
        "Could not update archive",
        err?.message || "Please try again."
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${singleCollection.name}"? The papers and documents inside stay exactly where they are.`
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await deleteCollection(collectionId);

      toast.success(
        "Collection deleted",
        "The papers and documents were kept."
      );

      navigate("/collections");
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
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------
  // States
  // ---------------------------------------------------

  if (singleLoading) {
    return (
      <div className="collection-detail-page">
        <section className="collection-items-empty">
          <h2>Loading collection...</h2>
        </section>
      </div>
    );
  }

  if (singleError || !singleCollection) {
    return (
      <div className="collection-detail-page">
        <div className="collection-not-found">
          <h1>Collection not found</h1>

          <p>
            {singleError ||
              "This collection does not exist or is not available."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/collections")}
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    ["all", "All"],
    ["papers", `Papers (${paperCount})`],
    ["documents", `Documents (${documentCount})`],
  ];

  return (
    <div className="collection-detail-page">
      <button
        type="button"
        className="collection-back"
        onClick={() => navigate("/collections")}
      >
        <ArrowLeft size={17} />
        Collections
      </button>

      <header className="collection-detail-header">
        <div className="collection-detail-header__main">
          <div>
            <div className="collection-detail-title">
              <span>
                <FolderOpen size={25} />
              </span>

              <div>
                <h1>
                  {singleCollection.name}

                  <button
                    type="button"
                    className={`collection-pin ${
                      singleCollection.isPinned
                        ? "active"
                        : ""
                    }`}
                    onClick={handleTogglePin}
                    title={
                      singleCollection.isPinned
                        ? "Unpin collection"
                        : "Pin collection"
                    }
                    aria-label={
                      singleCollection.isPinned
                        ? "Unpin collection"
                        : "Pin collection"
                    }
                  >
                    <Pin size={16} />
                  </button>
                </h1>

                {singleCollection.description && (
                  <p>
                    {singleCollection.description}
                  </p>
                )}

                <p className="collection-detail-updated">
                  {formatDocumentDate(
                    singleCollection.updatedAt
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="collection-detail-actions">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              disabled={busy}
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleToggleArchive}
              disabled={busy}
            >
              <Archive size={16} />
              {singleCollection.isArchived
                ? "Unarchive"
                : "Archive"}
            </button>

            <button
              type="button"
              className="primary"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? (
                <Loader2
                  size={16}
                  className="spin"
                />
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>
        </div>
      </header>

      <section className="collection-detail-stats">
        <div>
          <strong>
            {paperCount + documentCount}
          </strong>
          <span>Total Items</span>
        </div>

        <div>
          <strong>{paperCount}</strong>
          <span>Papers</span>
        </div>

        <div>
          <strong>{documentCount}</strong>
          <span>Documents</span>
        </div>
      </section>

      <section className="collection-detail-toolbar">
        <div className="collection-detail-search">
          <Search size={17} />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search this collection..."
          />
        </div>

        <div className="collection-type-filter">
          {tabs.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={
                tab === value ? "active" : ""
              }
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {paperCount === 0 && documentCount === 0 ? (
        <section className="collection-items-empty">
          <h2>This collection is empty</h2>

          <p>
            Add papers from your library or documents from
            your uploads. Nothing is copied, so the
            originals stay where they are.
          </p>

          <div className="collection-empty-actions">
            <button
              type="button"
              onClick={() => setAddType("paper")}
            >
              <Plus size={15} />
              Add Paper
            </button>

            <button
              type="button"
              onClick={() =>
                setAddType("document")
              }
            >
              <Plus size={15} />
              Add Document
            </button>
          </div>
        </section>
      ) : (
        <>
          {(tab === "all" || tab === "papers") && (
            <section className="collection-section">
              <div className="collection-section__header">
                <h2>
                  <ScrollText size={15} />
                  Papers ({paperCount})
                </h2>

                <button
                  type="button"
                  onClick={() => setAddType("paper")}
                >
                  <Plus size={15} />
                  Add Paper
                </button>
              </div>

              {filteredPapers.length === 0 ? (
                <div className="collection-items-empty">
                  <h2>
                    {query.trim()
                      ? "No papers match your search"
                      : "No papers in this collection yet"}
                  </h2>

                  <p>
                    {query.trim()
                      ? "Try a different search term."
                      : "Add papers from your library to organise them here."}
                  </p>
                </div>
              ) : (
                <div className="collection-items">
                  {filteredPapers.map((paper) => (
                    <article
                      key={paper._id}
                      className="collection-item-card"
                    >
                      <span className="collection-item-card__icon">
                        <ScrollText size={20} />
                      </span>

                      <div className="collection-item-card__body">
                        <span className="collection-item-card__type">
                          Research Paper
                        </span>

                        <h3>
                          <button
                            type="button"
                            className="collection-item-link"
                            onClick={() =>
                              navigate(
                                `/library/${paper._id}`
                              )
                            }
                          >
                            {paper.title}
                          </button>
                        </h3>

                        <span className="collection-item-card__meta">
                          {[
                            paper.authors?.length
                              ? paper.authors.join(", ")
                              : "Unknown authors",
                            paper.year,
                            paper.journal,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>

                      <div className="collection-item-card__actions">
                        <button
                          type="button"
                          title="Open paper"
                          onClick={() =>
                            navigate(
                              `/library/${paper._id}`
                            )
                          }
                        >
                          <ExternalLink size={16} />
                        </button>

                        <button
                          type="button"
                          className="danger"
                          title="Remove from collection"
                          aria-label="Remove from collection"
                          disabled={busy}
                          onClick={() =>
                            handleRemovePaper(paper)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {(tab === "all" || tab === "documents") && (
            <section className="collection-section">
              <div className="collection-section__header">
                <h2>
                  <FileText size={15} />
                  Documents ({documentCount})
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setAddType("document")
                  }
                >
                  <Plus size={15} />
                  Add Document
                </button>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="collection-items-empty">
                  <h2>
                    {query.trim()
                      ? "No documents match your search"
                      : "No documents in this collection yet"}
                  </h2>

                  <p>
                    {query.trim()
                      ? "Try a different search term."
                      : "Add documents from your uploads to organise them here."}
                  </p>
                </div>
              ) : (
                <div className="collection-items">
                  {filteredDocuments.map((doc) => (
                    <article
                      key={doc._id}
                      className="collection-item-card"
                    >
                      <span className="collection-item-card__icon">
                        <FileText size={20} />
                      </span>

                      <div className="collection-item-card__body">
                        <span className="collection-item-card__type">
                          {formatFileType(doc.mimeType)}
                        </span>

                        <h3>{doc.title}</h3>

                        <span className="collection-item-card__meta">
                          {[
                            formatFileSize(doc.fileSize),
                            formatDocumentDate(
                              doc.uploadedAt ||
                                doc.createdAt
                            ),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>

                      <div className="collection-item-card__actions">
                        <button
                          type="button"
                          title="Preview document"
                          onClick={() =>
                            setPreviewDoc(doc)
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="danger"
                          title="Remove from collection"
                          aria-label="Remove from collection"
                          disabled={busy}
                          onClick={() =>
                            handleRemoveDocument(doc)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <AddToCollectionModal
        open={addType !== null}
        mode="collection"
        resourceType={addType || "paper"}
        resourceId={collectionId}
        resourceLabel={singleCollection.name}
        attachedIds={
          addType === "document"
            ? documents.map((doc) => doc._id)
            : papers.map((paper) => paper._id)
        }
        onClose={() => setAddType(null)}
        onAdded={handleAdded}
      />

      <CollectionFormModal
        open={editOpen}
        collection={singleCollection}
        loading={busy}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
      />

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onAddedToCollection={handleAdded}
      />
    </div>
  );
};

export default CollectionDetailPage;
