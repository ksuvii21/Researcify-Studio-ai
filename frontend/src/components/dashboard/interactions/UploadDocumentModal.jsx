import DocumentUploadModal from "../../uploads/DocumentUploadModal";

import useDocuments from "../../../hooks/useDocuments";
import useToast from "../../../hooks/useToast";

/*
 * Global "Upload Document" entry point.
 *
 * The previous version of this modal animated a fake
 * progress bar through fixed percentages and reported
 * "Document uploaded" for a file that was never sent. It
 * now renders the same DocumentUploadModal the Uploads
 * page uses, driven by the real multipart upload, so the
 * progress shown is the server's actual transfer progress
 * and a success toast implies a stored document.
 */
const UploadDocumentModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const {
    uploadDocument,
    uploading,
    uploadProgress,
  } = useDocuments({ autoFetch: false });

  const handleSubmit = async (values) => {
    const created = await uploadDocument(values);

    onClose();

    toast.success(
      "Document uploaded",
      `"${created?.title || values.file.name}" was added.`
    );
  };

  return (
    <DocumentUploadModal
      open={open}
      uploading={uploading}
      uploadProgress={uploadProgress}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default UploadDocumentModal;
