import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import NoteEditorHeader from "../components/notes/NoteEditorHeader";
import NoteEditor from "../components/notes/NoteEditor";
import NoteSidebar from "../components/notes/NoteSidebar";
import NoteAIAssistant from "../components/notes/NoteAIAssistant";

import {
  deleteNote,
  toggleNoteArchive,
  toggleNotePin,
} from "../api/noteApi";

import useNote from "../hooks/useNote";
import useToast from "../hooks/useToast";

import "../components/notes/notes.css";

const NoteEditorPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const toast = useToast();

  const {
    note,
    loading,
    error,
    refetch,
    saveNote,
  } = useNote(id);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [tags, setTags] = useState([]);

  const [saveStatus, setSaveStatus] = useState("saved");

  /*
   * editRevision counts local edits. If it changes
   * while a PATCH is in flight, that response is stale
   * and must not mark the newer edit as saved.
   */
  const editRevision = useRef(0);

  /*
   * saveSequence guards response ordering, so an
   * earlier save that resolves late cannot win.
   */
  const saveSequence = useRef(0);

  const mountedRef = useRef(true);

  /*
   * The editor is seeded from the API exactly once per
   * note id. Without this guard an autosave response
   * would reset the fields while the user is typing.
   */
  const initializedNoteId = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!note) return;

    if (initializedNoteId.current === note._id) {
      return;
    }

    setTitle(note.title || "");
    setContent(note.content || "");
    setTags(note.tags || []);
    setSaveStatus("saved");

    initializedNoteId.current = note._id;
  }, [note]);

  // ---------------------------------------------------
  // Save
  // ---------------------------------------------------
  /*
   * Shared by the debounced autosave and the Retry
   * button so the PATCH logic exists in one place.
   */
  const performSave = async () => {
    const requestId = ++saveSequence.current;

    const revisionBeingSaved = editRevision.current;

    try {
      setSaveStatus("saving");

      await saveNote({
        title: title.trim() || "Untitled Note",
        content,
        tags,
      });

      if (
        !mountedRef.current ||
        requestId !== saveSequence.current
      ) {
        return;
      }

      /*
       * If the user typed while this request was in
       * flight, there is newer unsaved work.
       */
      if (
        revisionBeingSaved === editRevision.current
      ) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    } catch (err) {
      if (
        !mountedRef.current ||
        requestId !== saveSequence.current
      ) {
        return;
      }

      console.error(
        "[NoteEditor] Autosave error:",
        err
      );

      setSaveStatus("error");
    }
  };

  // ---------------------------------------------------
  // Debounced autosave
  // ---------------------------------------------------

  useEffect(() => {
    if (!note?._id) return undefined;

    if (saveStatus !== "unsaved") return undefined;

    const timer = setTimeout(() => {
      performSave();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, note?._id, saveStatus]);

  // ---------------------------------------------------
  // Protect against closing with unsaved work
  // ---------------------------------------------------

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (
        saveStatus === "unsaved" ||
        saveStatus === "saving"
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [saveStatus]);

  // ---------------------------------------------------
  // Field handlers
  // ---------------------------------------------------

  const markEdited = () => {
    editRevision.current += 1;
    setSaveStatus("unsaved");
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    markEdited();
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
    markEdited();
  };

  const handleTagsChange = (nextTags) => {
    setTags(nextTags);
    markEdited();
  };

  // ---------------------------------------------------
  // Note actions
  // ---------------------------------------------------

  const handleTogglePin = async () => {
    try {
      await toggleNotePin(note._id);

      await refetch();
    } catch (err) {
      console.error("[NoteEditor] Pin error:", err);

      toast.error(
        "Could not update pin",
        err?.message || "Please try again."
      );
    }
  };

  const handleToggleArchive = async () => {
    try {
      await toggleNoteArchive(note._id);

      await refetch();
    } catch (err) {
      console.error("[NoteEditor] Archive error:", err);

      toast.error(
        "Could not update archive",
        err?.message || "Please try again."
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNote(note._id);

      toast.success(
        "Note deleted",
        `"${note.title}" was removed.`
      );

      navigate("/notes");
    } catch (err) {
      console.error("[NoteEditor] Delete error:", err);

      toast.error(
        "Delete failed",
        err?.message || "Unable to delete this note."
      );
    }
  };

  const handleRetrySave = () => {
    performSave();
  };

  // ---------------------------------------------------
  // States
  // ---------------------------------------------------

  if (loading) {
    return (
      <div className="note-workspace">
        <div className="note-editor-state">
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="note-workspace">
        <div className="note-editor-state note-editor-state--error">
          <h2>Note unavailable</h2>

          <p>
            {error || "This note could not be loaded."}
          </p>

          <button type="button" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * The sidebar reflects live local state plus the
   * populated relationships from the API.
   */
  const sidebarNote = {
    ...note,
    title,
    content,
    tags,
  };

  return (
    <div className="note-workspace">
      <NoteEditorHeader
        note={note}
        saveStatus={saveStatus}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDelete}
        onRetrySave={handleRetrySave}
      />

      <div className="note-workspace__layout">
        <NoteSidebar note={sidebarNote} />

        <NoteEditor
          title={title}
          setTitle={handleTitleChange}
          content={content}
          setContent={handleContentChange}
          tags={tags}
          setTags={handleTagsChange}
        />

        <NoteAIAssistant />
      </div>
    </div>
  );
};

export default NoteEditorPage;