import {
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const topics = [
  {
    title: "Generative AI",
    papers: "12.4K papers",
  },
  {
    title: "Explainable AI",
    papers: "8.7K papers",
  },
  {
    title: "Human-AI Collaboration",
    papers: "6.2K papers",
  },
  {
    title: "AI in Education",
    papers: "9.1K papers",
  },
];

const TrendingTopics = ({
  onSelect,
}) => {
  return (
    <section className="discover-mini-panel">
      <div className="discover-mini-panel__title">
        <TrendingUp size={14} />

        <h2>Trending Research</h2>
      </div>

      <div className="trending-topics">
        {topics.map((topic) => (
          <button
            type="button"
            key={topic.title}
            onClick={() =>
              onSelect(topic.title)
            }
          >
            <span>
              <strong>{topic.title}</strong>
              <small>{topic.papers}</small>
            </span>

            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default TrendingTopics;