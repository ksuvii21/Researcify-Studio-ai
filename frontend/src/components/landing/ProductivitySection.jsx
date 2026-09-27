import {
  FileSearch,
  FolderKanban,
  Sparkles,
} from "lucide-react";

const ProductivitySection = () => {
  const items = [
    {
      icon: FolderKanban,
      title: "Organize",
      text: "Everything connected to the research projects where it belongs.",
    },
    {
      icon: Sparkles,
      title: "Understand",
      text: "AI transforms dense academic papers into understandable insights.",
    },
    {
      icon: FileSearch,
      title: "Discover",
      text: "Find connections and opportunities hidden across your sources.",
    },
  ];

  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <h2>
            Spend less time managing research.
            <br />
            <em>Spend more time understanding it.</em>
          </h2>
        </div>

        <div className="productivity-grid">
          {items.map(({ icon: Icon, title, text }) => (
            <article className="productivity-card" key={title}>
              <div>
                <Icon />
              </div>

              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;