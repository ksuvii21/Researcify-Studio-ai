import {
  BookOpenText,
  BrainCircuit,
  Library,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: BookOpenText,
    title: "Organize your research",
    description:
      "Keep papers, notes and projects together in one focused workspace.",
  },
  {
    icon: BrainCircuit,
    title: "Research with AI",
    description:
      "Summarize literature, compare findings and uncover research gaps.",
  },
  {
    icon: Library,
    title: "Build your knowledge library",
    description:
      "Save important research and turn scattered reading into structured knowledge.",
  },
];

const AuthBrandPanel = () => {
  return (
    <aside className="auth-brand">
      <div className="auth-brand__glow auth-brand__glow--one" />
      <div className="auth-brand__glow auth-brand__glow--two" />

      <div className="auth-brand__content">
        <a href="/" className="auth-brand__logo">
          <span className="auth-brand__logo-icon">
            <BookOpenText size={23} />
          </span>

          <span>
            <strong>Researcify Studio</strong>
            <small>Research. Organize. Discover.</small>
          </span>
        </a>

        <div className="auth-brand__hero">
          <div className="auth-brand__eyebrow">
            <Sparkles size={13} />
            AI-Powered Research Workspace
          </div>

          <h1>
            Turn research into
            <span> understanding.</span>
          </h1>

          <p>
            Discover literature, organize knowledge and
            accelerate your research workflow with one
            intelligent workspace.
          </p>
        </div>

        <div className="auth-brand__benefits">
          {benefits.map(
            ({ icon: Icon, title, description }) => (
              <div
                className="auth-brand__benefit"
                key={title}
              >
                <span>
                  <Icon size={17} />
                </span>

                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="auth-brand__footer">
        <span>Research smarter.</span>
        <span className="auth-brand__footer-dot" />
        <span>Discover deeper.</span>
      </div>
    </aside>
  );
};

export default AuthBrandPanel;