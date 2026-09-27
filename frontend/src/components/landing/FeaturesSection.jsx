import {
  BookOpen,
  BrainCircuit,
  FileSearch,
  Files,
  FolderKanban,
  Library,
  Lightbulb,
  NotebookPen,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Discover Research",
    text: "Search and explore academic papers relevant to your research.",
    className: "feature-large",
  },
  {
    icon: BrainCircuit,
    title: "AI Research Assistant",
    text: "Ask questions, summarize papers, compare studies and understand complex concepts.",
    className: "feature-large",
  },
  {
    icon: Library,
    title: "Smart Library",
    text: "Save, organize, tag and retrieve your research papers.",
  },
  {
    icon: FolderKanban,
    title: "Research Projects",
    text: "Keep papers, notes and AI conversations connected by project.",
  },
  {
    icon: NotebookPen,
    title: "Intelligent Notes",
    text: "Create structured notes linked directly to papers and projects.",
  },
  {
    icon: Files,
    title: "Document Analysis",
    text: "Upload documents and extract summaries, insights and concepts.",
  },
  {
    icon: Lightbulb,
    title: "Research Gap Discovery",
    text: "Identify patterns, contradictions and possible research gaps.",
    className: "feature-large",
  },
  {
    icon: BookOpen,
    title: "Collections",
    text: "Group related research into meaningful custom collections.",
    className: "feature-large",
  },
];

const FeaturesSection = () => {
  return (
    <section className="landing-section" id="features">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>
            <Sparkles />
            Features
          </span>

          <h2>
            Everything your research needs.
            <br />
            <em>In one intelligent workspace.</em>
          </h2>

          <p>
            Replace scattered tools with a connected environment built
            around the way modern research actually works.
          </p>
        </div>

        <div className="features-bento">
          {features.map(({ icon: Icon, title, text, className = "" }) => (
            <article
              className={`feature-card ${className}`}
              key={title}
            >
              <div className="feature-card__icon">
                <Icon />
              </div>

              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;