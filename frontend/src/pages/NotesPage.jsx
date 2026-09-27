import {
  useMemo,
  useState,
} from "react";

import NotesHeader from "../components/notes/NotesHeader";
import NotesStats from "../components/notes/NotesStats";
import NotesTabs from "../components/notes/NotesTabs";
import NotesToolbar from "../components/notes/NotesToolbar";
import NotesGrid from "../components/notes/NotesGrid";

import {
  initialNotes,
} from "../data/notesMockData";

import "../components/notes/notes.css";

const NotesPage = () => {
  const [notes, setNotes] =
    useState(initialNotes);

  const [activeTab, setActiveTab] =
    useState("all");

  const [query, setQuery] =
    useState("");

  const [project, setProject] =
    useState("all");

  const [sort, setSort] =
    useState("recent");

  const [view, setView] =
    useState("grid");

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (activeTab === "favorites") {
      result = result.filter(
        (note) => note.favorite
      );
    }

    if (activeTab === "recent") {
      result = result.slice(0, 4);
    }

    if (activeTab === "projects") {
      result = result.filter(
        (note) => Boolean(note.project)
      );
    }

    if (project !== "all") {
      result = result.filter(
        (note) => note.project === project
      );
    }

    const normalizedQuery =
      query.trim().toLowerCase();

    if (normalizedQuery) {
      result = result.filter((note) =>
        [
          note.title,
          note.preview,
          note.project,
          ...note.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (sort === "title") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sort === "favorites") {
      result.sort(
        (a, b) =>
          Number(b.favorite) -
          Number(a.favorite)
      );
    }

    return result;
  }, [
    notes,
    activeTab,
    query,
    project,
    sort,
  ]);

  const toggleFavorite = (noteId) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              favorite: !note.favorite,
            }
          : note
      )
    );
  };

  return (
    <div className="notes-page">
      <NotesHeader />

      <NotesStats notes={notes} />

      <NotesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <NotesToolbar
        query={query}
        setQuery={setQuery}
        project={project}
        setProject={setProject}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        resultCount={filteredNotes.length}
      />

      <NotesGrid
        notes={filteredNotes}
        view={view}
        onFavorite={toggleFavorite}
      />
    </div>
  );
};

export default NotesPage;