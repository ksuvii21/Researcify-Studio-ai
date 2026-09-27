import {
  Bot,
  BookOpen,
  FileUp,
  FolderKanban,
  Library,
  Mail,
  Search,
} from "lucide-react";

const guides = [
  {
    icon: FolderKanban,
    title: "Research Projects",
    description:
      "Learn how to organize papers, notes, documents and questions inside projects.",
  },
  {
    icon: Bot,
    title: "AI Research Assistant",
    description:
      "Learn how to use research context and AI-assisted analysis.",
  },
  {
    icon: FileUp,
    title: "Uploading Documents",
    description:
      "Learn how uploaded research documents are processed and indexed.",
  },
  {
    icon: Library,
    title: "Research Library",
    description:
      "Organize saved papers, favorites and research collections.",
  },
];

const HelpSupport = () => {
  return (
    <div className="help-page">
      <section className="help-hero">
        <span className="settings-eyebrow">
          <BookOpen size={16} />
          Help Center
        </span>

        <h1>
          How can we help?
        </h1>

        <p>
          Browse guides for organizing
          research, using the AI assistant
          and managing your research
          workspace.
        </p>

        <div className="help-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search help guides..."
          />
        </div>
      </section>

      <section className="help-guides">
        {guides.map(
          ({
            icon: Icon,
            title,
            description,
          }) => (
            <article key={title}>
              <span>
                <Icon size={21} />
              </span>

              <h2>{title}</h2>

              <p>
                {description}
              </p>

              <button type="button">
                View Guide
              </button>
            </article>
          )
        )}
      </section>

      <section className="help-contact">
        <span>
          <Mail size={22} />
        </span>

        <div>
          <h2>
            Still need help?
          </h2>

          <p>
            Contact support if you
            cannot find the answer in
            the help guides.
          </p>
        </div>

        <button type="button">
          Contact Support
        </button>
      </section>
    </div>
  );
};

export default HelpSupport;