import {
  FolderPlus,
  Loader2,
  Pencil,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

/*
 * One form for both creating and editing a collection.
 *
 * Resources are never chosen here. A collection is created
 * empty and papers/documents are attached afterwards through
 * the dedicated relationship endpoints, so there is exactly
 * one authorization path for "put this paper in a
 * collection" rather than two.
 */
const CollectionFormModal = ({
  open,
  collection = null,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(collection?._id);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  const [wasOpen, setWasOpen] = useState(open);

  /*
   * Seed the form from the record each time the modal
   * opens, so editing never shows a previous edit's values.
   */
  if (open !== wasOpen) {
    setWasOpen(open);
    setName(collection?.name || "");
    setDescription(collection?.description || "");
    setError("");
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Collection name is required.");

      return;
    }

    setError("");

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isEdit ? Pencil : FolderPlus}
      title={
        isEdit
          ? "Edit Collection"
          : "Create Collection"
      }
      description={
        isEdit
          ? "Update the name and description for this collection."
          : "Create a focused space for related research material."
      }
    >
      <form
        className="collection-create-form"
        onSubmit={handleSubmit}
      >
        <label>
          <span>Collection Name</span>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Explainable AI"
            autoFocus
            maxLength={120}
            disabled={loading}
          />
        </label>

        <label>
          <span>Description</span>

          <textarea
            rows="4"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="What research belongs in this collection?"
            maxLength={1000}
            disabled={loading}
          />

          <small>
            Optional. Papers and documents are added after
            the collection is created.
          </small>
        </label>

        {error && (
          <small className="form-error">
            {error}
          </small>
        )}

        <div className="collection-create-form__actions">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Saving...
              </>
            ) : (
              <>
                {isEdit ? (
                  <Pencil size={16} />
                ) : (
                  <FolderPlus size={16} />
                )}
                {isEdit
                  ? "Save Changes"
                  : "Create Collection"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CollectionFormModal;
