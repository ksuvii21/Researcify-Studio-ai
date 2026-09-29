import {
  Check,
  FolderOpen,
  FolderPlus,
  Loader2,
  Plus,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import useCollections from "../../hooks/useCollections";
import useDocuments from "../../hooks/useDocuments";
import usePapers from "../../hooks/usePapers";

/*
 * One modal serves both directions of the same
 * many-to-many relationship, so the logic is never
 * duplicated per surface:
 *
 *   mode="resource"   (from a Paper or Document)
 *     resourceType="paper" | "document"
 *     -> list the user's collections, file this resource
 *
 *   mode="collection" (from a Collection)
 *     resourceType="paper" | "document"
 *     -> list the user's library, file this into the
 *        collection
 *
 * The caller never decides ownership. The list is already
 * user-scoped by the API, and the backend re-checks both
 * the collection and the resource on every relationship
 * call, so a wrong id from the client is a 404 rather than
 * a leak.
 *
 * Targets that already contain the resource are shown as
 * "Added" instead of being hidden, so the user can see
 * where it already lives. That is presentation only; the
 * backend 409 remains the real guard.
 *
 * Archived collections are listed deliberately. Hiding
 * them would let the user pick a destination, be told
 * nothing, and learn the real state only from a failure.
 */
const AddToCollectionModal = ({
  open,
  mode = "resource",
  resourceType = "paper",
  resourceId,
  resourceLabel = "",
  attachedIds = [],
  onClose,
  onAdded,
}) => {
  const [selectedId, setSelectedId] = useState("");

  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [prevMode, setPrevMode] = useState(mode);

  const [wasOpen, setWasOpen] = useState(open);

  const isResourceMode = mode === "resource";

  const isPaper = resourceType === "paper";

  const isDocument = resourceType === "document";

  const noun = isPaper ? "paper" : "document";

  /*
   * Reset the form when the modal opens or the direction
   * changes. Adjusting state during render (rather than in
   * an effect) avoids a second render pass.
   */
  if (open !== wasOpen || mode !== prevMode) {
    setWasOpen(open);
    setPrevMode(mode);
    setSelectedId("");
    setSearch("");
    setError("");
  }

  // Collections list (resource mode).
  const {
    collections,
    loading: collectionsLoading,
    addPaper,
    addDocument,
  } = useCollections({
    search: isResourceMode ? search : "",
    archived: "all",
    autoFetch: open && isResourceMode,
  });

  // Library list (collection mode), split by resource type
  // so only the relevant request is ever made.
  const {
    papers,
    loading: papersLoading,
  } = usePapers({
    search:
      open && !isResourceMode && isPaper ? search : "",
    autoFetch: open && !isResourceMode && isPaper,
  });

  const {
    documents,
    loading: documentsLoading,
  } = useDocuments({
    search:
      open && !isResourceMode && isDocument
        ? search
        : "",
    autoFetch: open && !isResourceMode && isDocument,
  });

  const libraryItems = isPaper ? papers : documents;

  const libraryLoading = isPaper
    ? papersLoading
    : documentsLoading;

  const loading = isResourceMode
    ? collectionsLoading
    : libraryLoading;

  /*
   * The list endpoint returns raw id arrays, so membership
   * can be decided here without a request per collection.
   */
  const alreadyInCollection = (collection) => {
    const ids = isPaper
      ? collection.paperIds
      : collection.documentIds;

    return (ids || []).some(
      (id) => id === resourceId
    );
  };

  const attachedSet = new Set(attachedIds);

  const availableItems = libraryItems.filter(
    (item) => !attachedSet.has(item._id)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId) {
      setError(
        isResourceMode
          ? `Select a collection for this ${noun}.`
          : `Select a ${noun} to add.`
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (isResourceMode) {
        const updated = isPaper
          ? await addPaper(selectedId, resourceId)
          : await addDocument(selectedId, resourceId);

        const target = collections.find(
          (item) => item._id === selectedId
        );

        onAdded?.({
          collection: updated,
          targetName: target?.name || "",
          alreadyExisted: false,
        });
      } else {
        const updated = isPaper
          ? await addPaper(resourceId, selectedId)
          : await addDocument(
            resourceId,
            selectedId
          );

        const target = libraryItems.find(
          (item) => item._id === selectedId
        );

        onAdded?.({
          collection: updated,
          targetName: target?.title || "",
          alreadyExisted: false,
        });
      }

      onClose();
    } catch (err) {
      /*
       * A 409 means the relationship already exists, which
       * is the desired end state even though the request
       * failed. Reporting it as success keeps the user out
       * of a retry loop for a state they already have.
       */
      if (err?.status === 409) {
        const target = isResourceMode
          ? collections.find(
            (item) => item._id === selectedId
          )
          : libraryItems.find(
            (item) => item._id === selectedId
          );

        onAdded?.({
          collection: null,
          targetName:
            target?.name || target?.title || "",
          alreadyExisted: true,
        });

        onClose();

        return;
      }

      setError(
        err?.message ||
          "Unable to update this collection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const items = [];

  if (isResourceMode) {
    collections.forEach((collection) => {
      items.push({
        id: collection._id,
        title: collection.name,
        meta: [
          `${collection.paperCount} paper${
            collection.paperCount === 1 ? "" : "s"
          }`,
          `${collection.documentCount} document${
            collection.documentCount === 1 ? "" : "s"
          }`,
          collection.isPinned ? "Pinned" : "",
          collection.isArchived ? "Archived" : "",
        ]
          .filter(Boolean)
          .join(" · "),
        isAdded: alreadyInCollection(collection),
        disabled: alreadyInCollection(collection),
      });
    });
  } else {
    availableItems.forEach((item) => {
      items.push({
        id: item._id,
        title: item.title,
        meta: isPaper
          ? [
            item.authors?.length
              ? item.authors.join(", ")
              : "Unknown authors",
            item.year || "",
          ]
            .filter(Boolean)
            .join(" · ")
          : [
            item.originalFileName || "",
            item.mimeType || "",
          ]
            .filter(Boolean)
            .join(" · "),
        isAdded: false,
        disabled: false,
      });
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isResourceMode ? FolderOpen : FolderPlus}
      title={
        isResourceMode
          ? "Add to Collection"
          : `Add ${isPaper ? "Paper" : "Document"}`
      }
      description={
        isResourceMode
          ? resourceLabel ||
            `Choose a collection for this ${noun}.`
          : resourceLabel ||
            `Choose a ${noun} from your ${
              isPaper ? "library" : "uploads"
            }.`
      }
    >
      <form
        className="interaction-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label htmlFor="collection-target-search">
            {isResourceMode
              ? "Search your collections"
              : `Search your ${isPaper ? "library" : "documents"}`}
          </label>

          <input
            id="collection-target-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              isResourceMode
                ? "Search name or description..."
                : isPaper
                  ? "Search title, author, journal..."
                  : "Search filename or title..."
            }
          />
        </div>

        <div className="relation-options">
          {loading ? (
            <p className="relation-options__state">
              Loading...
            </p>
          ) : items.length === 0 ? (
            <p className="relation-options__state">
              {search.trim()
                ? "No matching results."
                : isResourceMode
                  ? `You have no collections yet. Create one from the Collections page first.`
                  : isPaper
                    ? "Every paper in your library is already in this collection."
                    : "Every document in your uploads is already in this collection."}
            </p>
          ) : (
            items.map((item) => (
              <label
                key={item.id}
                className={[
                  "relation-option",
                  selectedId === item.id
                    ? "relation-option--selected"
                    : "",
                  item.isAdded
                    ? "relation-option--added"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="collection-target"
                  value={item.id}
                  checked={selectedId === item.id}
                  disabled={item.disabled}
                  onChange={() => setSelectedId(item.id)}
                />

                <div>
                  <strong>{item.title}</strong>

                  <small>{item.meta}</small>
                </div>

                <span className="collection-target-state">
                  {item.isAdded ? (
                    <>
                      <Check size={13} />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Add
                    </>
                  )}
                </span>
              </label>
            ))
          )}
        </div>

        {error && (
          <small className="form-error">
            {error}
          </small>
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
            disabled={
              submitting || loading || !selectedId
            }
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="spin" />
                Adding...
              </>
            ) : (
              <>
                <FolderPlus size={14} />
                Add to Collection
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddToCollectionModal;
