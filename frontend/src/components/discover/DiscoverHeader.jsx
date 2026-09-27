import {
  BookOpen,
  Sparkles,
} from "lucide-react";

const DiscoverHeader = () => {
  return (
    <header className="discover-header">
      <div>
        <span className="discover-eyebrow">
          <Sparkles size={12} />
          Research Discovery
        </span>

        <h1>Discover Research</h1>

        <p>
          Search academic literature, explore
          emerging topics and discover papers
          relevant to your research.
        </p>
      </div>

      <div className="discover-header__badge">
        <BookOpen size={15} />

        <span>
          <strong>Academic Search</strong>
          <small>
            Intelligent literature discovery
          </small>
        </span>
      </div>
    </header>
  );
};

export default DiscoverHeader;