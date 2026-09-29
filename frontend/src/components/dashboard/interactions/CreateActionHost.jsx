import useCreateAction from "../../../hooks/useCreateAction";

import CreateProjectModal from "./CreateProjectModal";
import CreateNoteModal from "./CreateNoteModal";
import CreateCollectionModal from "./CreateCollectionModal";
import UploadDocumentModal from "./UploadDocumentModal";
import ImportPaperModal from "./ImportPaperModal";

const CreateActionHost = () => {
  const {
    activeAction,
    closeAction,
  } = useCreateAction();

  return (
    <>
      <CreateProjectModal
        open={activeAction === "project"}
        onClose={closeAction}
      />

      <CreateNoteModal
        open={activeAction === "note"}
        onClose={closeAction}
      />

      <CreateCollectionModal
        open={activeAction === "collection"}
        onClose={closeAction}
      />

      <UploadDocumentModal
        open={activeAction === "upload"}
        onClose={closeAction}
      />

      <ImportPaperModal
        open={activeAction === "import"}
        onClose={closeAction}
      />
    </>
  );
};

export default CreateActionHost;