import CollectionFormModal from "../../collections/CollectionFormModal";

import useCollections from "../../../hooks/useCollections";
import useToast from "../../../hooks/useToast";

/*
 * Global "New Collection" entry point. The form itself is
 * shared with the Collections page so name and description
 * validation can never drift between the two.
 */
const CreateCollectionModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const {
    createCollection,
    mutationLoading,
  } = useCollections({
    autoFetch: false,
  });

  const handleSubmit = async (values) => {
    try {
      const created = await createCollection(values);

      onClose();

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

  return (
    <CollectionFormModal
      open={open}
      loading={mutationLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateCollectionModal;
