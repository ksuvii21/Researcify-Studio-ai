import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";

const searches = [
  "Generative AI in education",
  "Explainable artificial intelligence",
  "Human-AI collaboration",
];

const SuggestedSearches = ({
  onSelect,
}) => {
  return (
    <section className="discover-mini-panel">
      <div className="discover-mini-panel__title">
        <Clock3 size={14} />
        <h2>Recent Searches</h2>
      </div>

      <div className="suggested-searches">
        {searches.map((search) => (
          <button
            type="button"
            key={search}
            onClick={() => onSelect(search)}
          >
            <span>{search}</span>
            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default SuggestedSearches;