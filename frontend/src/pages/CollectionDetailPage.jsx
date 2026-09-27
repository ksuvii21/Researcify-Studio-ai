import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CollectionDetailHeader from "../components/collections/CollectionDetailHeader";
import CollectionItemCard from "../components/collections/CollectionItemCard";

import {
  initialCollections,
} from "../data/collectionsMockData";

import "../components/collections/collections.css";

const CollectionDetailPage = () => {
  const {
    collectionId,
  } = useParams();

  const navigate =
    useNavigate();

  const [query, setQuery] =
    useState("");

  const [type, setType] =
    useState("all");

  const collection =
    initialCollections.find(
      (item) =>
        item.id === collectionId
    );

  const items = useMemo(() => {
    if (!collection) return [];

    return collection.items.filter(
      (item) => {
        const matchesSearch =
          [
            item.title,
            item.description,
            item.meta,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              query
                .trim()
                .toLowerCase()
            );

        const matchesType =
          type === "all" ||
          item.type === type;

        return (
          matchesSearch &&
          matchesType
        );
      }
    );
  }, [
    collection,
    query,
    type,
  ]);

  if (!collection) {
    return (
      <div className="collection-not-found">
        <h1>
          Collection not found
        </h1>

        <p>
          This collection does not
          exist or is not available.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/collections"
            )
          }
        >
          Back to Collections
        </button>
      </div>
    );
  }

  const paperCount =
    collection.items.filter(
      (item) =>
        item.type === "paper"
    ).length;

  const documentCount =
    collection.items.filter(
      (item) =>
        item.type ===
        "document"
    ).length;

  const noteCount =
    collection.items.filter(
      (item) =>
        item.type === "note"
    ).length;

  return (
    <div className="collection-detail-page">
      <CollectionDetailHeader
        collection={collection}
        onBack={() =>
          navigate("/collections")
        }
      />

      <section className="collection-detail-stats">
        <div>
          <strong>
            {
              collection.items
                .length
            }
          </strong>
          <span>
            Total Items
          </span>
        </div>

        <div>
          <strong>
            {paperCount}
          </strong>
          <span>
            Papers
          </span>
        </div>

        <div>
          <strong>
            {documentCount}
          </strong>
          <span>
            Documents
          </span>
        </div>

        <div>
          <strong>
            {noteCount}
          </strong>
          <span>
            Notes
          </span>
        </div>
      </section>

      <section className="collection-detail-toolbar">
        <div className="collection-detail-search">
          <Search size={17} />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search this collection..."
          />
        </div>

        <div className="collection-type-filter">
          {[
            ["all", "All"],
            ["paper", "Papers"],
            [
              "document",
              "Documents",
            ],
            ["note", "Notes"],
          ].map(
            ([value, label]) => (
              <button
                type="button"
                key={value}
                className={
                  type === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setType(value)
                }
              >
                {label}
              </button>
            )
          )}
        </div>
      </section>

      {items.length ? (
        <section className="collection-items">
          {items.map(
            (item) => (
              <CollectionItemCard
                key={item.id}
                item={item}
              />
            )
          )}
        </section>
      ) : (
        <section className="collection-items-empty">
          <h2>
            No research items found
          </h2>

          <p>
            Try another filter or
            add research material to
            this collection.
          </p>
        </section>
      )}
    </div>
  );
};

export default CollectionDetailPage;