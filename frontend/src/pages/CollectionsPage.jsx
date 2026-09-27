import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import CollectionsHeader from "../components/collections/CollectionsHeader";
import CollectionStats from "../components/collections/CollectionStats";
import CollectionsToolbar from "../components/collections/CollectionsToolbar";
import CollectionCard from "../components/collections/CollectionCard";
import CreateCollectionModal from "../components/collections/CreateCollectionModal";

import {
  initialCollections,
} from "../data/collectionsMockData";

import "../components/collections/collections.css";

const CollectionsPage = () => {
  const navigate =
    useNavigate();

  const [
    collections,
    setCollections,
  ] = useState(
    initialCollections
  );

  const [query, setQuery] =
    useState("");

  const [sort, setSort] =
    useState("updated");

  const [view, setView] =
    useState("grid");

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const filteredCollections =
    useMemo(() => {
      let result =
        collections.filter(
          (collection) =>
            [
              collection.name,
              collection.description,
              ...collection.tags,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query
                  .trim()
                  .toLowerCase()
              )
        );

      result = [...result];

      if (sort === "name") {
        result.sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        );
      }

      if (sort === "items") {
        result.sort(
          (a, b) =>
            b.items.length -
            a.items.length
        );
      }

      if (sort === "updated") {
        result.sort(
          (a, b) =>
            Number(b.pinned) -
            Number(a.pinned)
        );
      }

      return result;
    }, [
      collections,
      query,
      sort,
    ]);

  const togglePin = (
    collectionId
  ) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.id ===
        collectionId
          ? {
              ...collection,
              pinned:
                !collection.pinned,
            }
          : collection
      )
    );
  };

  const createCollection = (
    data
  ) => {
    const id = `${data.name
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(/(^-|-$)/g, "")}-${Date.now()}`;

    setCollections((current) => [
      {
        id,
        name: data.name,
        description:
          data.description,
        tags: data.tags,
        pinned: false,
        updatedAt: "Just now",
        items: [],
      },
      ...current,
    ]);
  };

  return (
    <div className="collections-page">
      <CollectionsHeader
        onCreate={() =>
          setCreateOpen(true)
        }
      />

      <CollectionStats
        collections={collections}
      />

      <CollectionsToolbar
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        count={
          filteredCollections.length
        }
      />

      {filteredCollections.length ? (
        <section
          className={`collections-grid ${
            view === "list"
              ? "collections-grid--list"
              : ""
          }`}
        >
          {filteredCollections.map(
            (collection) => (
              <CollectionCard
                key={
                  collection.id
                }
                collection={
                  collection
                }
                view={view}
                onTogglePin={
                  togglePin
                }
                onOpen={(id) =>
                  navigate(
                    `/collections/${id}`
                  )
                }
              />
            )
          )}
        </section>
      ) : (
        <section className="collections-empty">
          <h2>
            No collections found
          </h2>

          <p>
            Try another search or
            create a new research
            collection.
          </p>

          <button
            type="button"
            onClick={() =>
              setCreateOpen(true)
            }
          >
            Create Collection
          </button>
        </section>
      )}

      <CreateCollectionModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onCreate={
          createCollection
        }
      />
    </div>
  );
};

export default CollectionsPage;