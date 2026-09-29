import { useState } from "react";

import { useNavigate } from "react-router-dom";

import LibraryHeader from "../components/library/LibraryHeader";
import LibraryStats from "../components/library/LibraryStats";
import LibraryTabs from "../components/library/LibraryTabs";
import LibraryToolbar from "../components/library/LibraryToolbar";
import LibraryPapers from "../components/library/LibraryPapers";
import LibraryCollections from "../components/library/LibraryCollections";
import LibraryPaperModal from "../components/library/LibraryPaperModal";

import usePapers from "../hooks/usePapers";
import useToast from "../hooks/useToast";

import "../components/library/library.css";

const LibraryPage = () => {
  const toast = useToast();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");

  const [query, setQuery] = useState("");

  const [sort, setSort] = useState("createdAt");

  const [view, setView] = useState("grid");

  const [selectedPaper, setSelectedPaper] =
    useState(null);

  /*
   * Favorites are filtered server-side so the tab
   * reflects the whole library, not just the page
   * currently loaded.
   */
  const favoriteFilter =
    activeTab === "favorites" ? "true" : "";

  const {
    papers,
    loading,
    error,
    fetchPapers,
    toggleFavorite,
    deletePaper,
  } = usePapers({
    search: query,
    favorite: favoriteFilter,
    sort,
    order: sort === "title" ? "asc" : "desc",
  });

  // ---------------------------------------------------
  // Favorite
  // ---------------------------------------------------

  const handleFavorite = async (paperId) => {
    try {
      const updated = await toggleFavorite(paperId);

      // Keep the open preview in sync.
      setSelectedPaper((current) =>
        current?._id === updated?._id
          ? updated
          : current
      );
    } catch (err) {
      console.error(
        "[Library] Favorite error:",
        err
      );

      toast.error(
        "Could not update favorite",
        err?.message || "Please try again."
      );
    }
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const handleDelete = async (paper) => {
    const confirmed = window.confirm(
      `Remove "${paper.title}" from your library?`
    );

    if (!confirmed) return;

    try {
      await deletePaper(paper._id);

      setSelectedPaper((current) =>
        current?._id === paper._id
          ? null
          : current
      );

      toast.success(
        "Paper removed",
        `"${paper.title}" was removed from your library.`
      );
    } catch (err) {
      console.error(
        "[Library] Delete error:",
        err
      );

      toast.error(
        "Remove failed",
        err?.message ||
          "Unable to remove this paper."
      );
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setActiveTab("all");
  };

  const handleOpenDetail = (paper) => {
    navigate(`/library/${paper._id}`);
  };

  // ---------------------------------------------------
  // Tabs
  // ---------------------------------------------------

  const visiblePapers =
    activeTab === "recent"
      ? papers.slice(0, 4)
      : papers;

  /*
   * Distinguishes "you have no papers" from
   * "your filters matched nothing".
   */
  const isLibraryEmpty =
    !query.trim() && activeTab !== "favorites";

  return (
    <div className="library-page">
      <LibraryHeader />

      <LibraryStats papers={papers} />

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
            sort={sort}
            setSort={setSort}
            view={view}
            setView={setView}
            resultCount={visiblePapers.length}
          />

          {loading ? (
            <div className="library-state">
              <p>Loading your research library...</p>
            </div>
          ) : error ? (
            <div className="library-state library-state--error">
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchPapers}
              >
                Try Again
              </button>
            </div>
          ) : (
            <LibraryPapers
              papers={visiblePapers}
              view={view}
              onFavorite={handleFavorite}
              onDelete={handleDelete}
              onOpen={setSelectedPaper}
              onOpenDetail={handleOpenDetail}
              isLibraryEmpty={isLibraryEmpty}
              onClearFilters={handleClearFilters}
            />
          )}
        </>
      )}

      <LibraryPaperModal
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
        onFavorite={handleFavorite}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default LibraryPage;