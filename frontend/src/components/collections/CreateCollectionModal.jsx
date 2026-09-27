import {
  FolderPlus,
} from "lucide-react";

import {
  useState,
} from "react";

import Modal from "../common/Modal";

const CreateCollectionModal = ({
  open,
  onClose,
  onCreate,
}) => {
  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [tags, setTags] =
    useState("");

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!name.trim()) return;

    onCreate({
      name: name.trim(),

      description:
        description.trim() ||
        "A new research collection.",

      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setName("");
    setDescription("");
    setTags("");

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Collection"
      description="Create a focused space for related research material."
      icon={FolderPlus}
    >
      <form
        className="collection-create-form"
        onSubmit={handleSubmit}
      >
        <label>
          <span>
            Collection Name
          </span>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="e.g. Explainable AI"
            autoFocus
          />
        </label>

        <label>
          <span>
            Description
          </span>

          <textarea
            rows="4"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="What research belongs in this collection?"
          />
        </label>

        <label>
          <span>Tags</span>

          <input
            type="text"
            value={tags}
            onChange={(event) =>
              setTags(
                event.target.value
              )
            }
            placeholder="AI, Education, Explainability"
          />

          <small>
            Separate tags with commas.
          </small>
        </label>

        <div className="collection-create-form__actions">
          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary"
          >
            <FolderPlus size={16} />
            Create Collection
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCollectionModal;