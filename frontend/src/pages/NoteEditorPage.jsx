import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useParams,
} from "react-router-dom";

import NoteEditorHeader from "../components/notes/NoteEditorHeader";
import NoteEditor from "../components/notes/NoteEditor";
import NoteSidebar from "../components/notes/NoteSidebar";
import NoteAIAssistant from "../components/notes/NoteAIAssistant";

import {
  initialNotes,
} from "../data/notesMockData";

import "../components/notes/notes.css";

const NoteEditorPage = () => {
  const { id } = useParams();

  const note = useMemo(
    () =>
      initialNotes.find(
        (item) => item.id === id
      ),
    [id]
  );

  const [title, setTitle] =
    useState(note?.title || "");

  const [content, setContent] =
    useState(note?.content || "");

  const [favorite, setFavorite] =
    useState(note?.favorite || false);

  const [saveStatus, setSaveStatus] =
    useState("Saved");

  useEffect(() => {
    if (!note) return;

    setSaveStatus("Saving...");

    const timer = setTimeout(() => {
      setSaveStatus("Saved");
    }, 700);

    return () => clearTimeout(timer);
  }, [title, content, note]);

  if (!note) {
    return (
      <Navigate
        to="/notes"
        replace
      />
    );
  }

  return (
    <div className="note-workspace">
      <NoteEditorHeader
        note={note}
        favorite={favorite}
        onFavorite={() =>
          setFavorite(
            (current) => !current
          )
        }
        saveStatus={saveStatus}
      />

      <div className="note-workspace__layout">
        <NoteSidebar note={note} />

        <NoteEditor
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
        />

        <NoteAIAssistant />
      </div>
    </div>
  );
};

export default NoteEditorPage;