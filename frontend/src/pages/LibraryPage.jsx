import {
  useMemo,
  useState,
} from "react";

import LibraryHeader from "../components/library/LibraryHeader";
import LibraryStats from "../components/library/LibraryStats";
import LibraryTabs from "../components/library/LibraryTabs";
import LibraryToolbar from "../components/library/LibraryToolbar";
import LibraryPapers from "../components/library/LibraryPapers";
import LibraryCollections from "../components/library/LibraryCollections";
import LibraryPaperModal from "../components/library/LibraryPaperModal";

import {
  libraryPapers as initialPapers,
} from "../data/libraryMockData";

import "../components/library/library.css";

const LibraryPage = () => {
  const [papers, setPapers] =
    useState(initialPapers);

  const [activeTab, setActiveTab] =
    useState("all");

  const [query, setQuery] =
    useState("");

  const [year, setYear] =
    useState("all");

  const [type, setType] =
    useState("all");

  const [sort, setSort] =
    useState("recent");

  const [view, setView] =
    useState("grid");

  const [selectedPaper, setSelectedPaper] =
    useState(null);

  const filteredPapers = useMemo(() => {
    let result = [...papers];

    if (activeTab === "favorites") {
      result = result.filter(
        (paper) => paper.favorite
      );
    }

    if (activeTab === "uploaded") {
      result = result.filter(
        (paper) =>
          paper.source === "Uploaded"
      );
    }

    if (activeTab === "recent") {
      result = result.slice(0, 4);
    }

    const normalizedQuery =
      query.trim().toLowerCase();

    if (normalizedQuery) {
      result = result.filter(
        (paper) =>
          [
            paper.title,
            paper.journal,
            paper.project,
            paper.collection,
            ...paper.authors,
            ...paper.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
      );
    }

    if (year !== "all") {
      result = result.filter(
        (paper) =>
          String(paper.year) === year
      );
    }

    if (type !== "all") {
      result = result.filter(
        (paper) =>
          paper.type === type
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) => b.year - a.year
      );
    }

    if (sort === "citations") {
      result.sort(
        (a, b) =>
          b.citations - a.citations
      );
    }

    if (sort === "title") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return result;
  }, [
    papers,
    activeTab,
    query,
    year,
    type,
    sort,
  ]);

  const toggleFavorite = (paperId) => {
    setPapers((current) =>
      current.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              favorite:
                !paper.favorite,
            }
          : paper
      )
    );

    setSelectedPaper((current) =>
      current?.id === paperId
        ? {
            ...current,
            favorite:
              !current.favorite,
          }
        : current
    );
  };

  return (
    <div className="library-page">
      <LibraryHeader />

      <LibraryStats
        papers={papers}
      />

      <LibraryTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "collections" ? (
        <LibraryCollections />
      ) : (
        <>
          <LibraryToolbar
            query={query}
            setQuery={setQuery}
            year={year}
            setYear={setYear}
            type={type}
            setType={setType}
            sort={sort}
            setSort={setSort}
            view={view}
            setView={setView}
            resultCount={
              filteredPapers.length
            }
          />

          <LibraryPapers
            papers={filteredPapers}
            view={view}
            onFavorite={
              toggleFavorite
            }
            onOpen={setSelectedPaper}
          />
        </>
      )}

      <LibraryPaperModal
        paper={selectedPaper}
        onClose={() =>
          setSelectedPaper(null)
        }
        onFavorite={
          toggleFavorite
        }
      />
    </div>
  );
};

export default LibraryPage;