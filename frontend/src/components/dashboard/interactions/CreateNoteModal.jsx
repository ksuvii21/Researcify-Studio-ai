import NoteFormModal from "../../notes/NoteFormModal";

import useNotes from "../../../hooks/useNotes";
import useToast from "../../../hooks/useToast";

/*
 * Global "New Note" entry point.
 *
 * The previous version of this modal fabricated its own
 * form and reported "Note created" after a 500ms timer
 * without ever calling the API. Worse, its project picker
 * offered three hardcoded ids ("ai-education",
 * "sustainable-iot", "hci") that match no real project.
 *
 * It now renders the same NoteFormModal the Notes and
 * Paper Detail pages use, so the project and paper pickers
 * are populated from real records and success is reported
 * only after MongoDB accepted the note.
 */
const CreateNoteModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const {
    createNote,
    mutationLoading,
  } = useNotes({ autoFetch: false });

  const handleSubmit = async (values) => {
    const created = await createNote(values);

    onClose();

    toast.success(
      "Note created",
      `"${created?.title || values.title || "Untitled Note"}" was added.`
    );
  };

  return (
    <NoteFormModal
      open={open}
      loading={mutationLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateNoteModal;
