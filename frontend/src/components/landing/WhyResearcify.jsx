import {
  ArrowRight,
  Check,
  Sparkles,
  X,
} from "lucide-react";

const traditional = [
  "Too many browser tabs",
  "Scattered PDFs",
  "Disconnected notes",
  "Manual paper comparison",
  "Lost research context",
  "Repetitive searching",
];

const researcify = [
  "Unified research workspace",
  "Smart research library",
  "Connected notes",
  "AI-assisted analysis",
  "Project-based organization",
  "Searchable knowledge",
];

const WhyResearcify = () => {
  return (
    <section
      className="landing-section landing-section--alternate"
      id="about"
    >
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>
            <Sparkles />
            Why Researcify
          </span>

          <h2>
            From research chaos
            <br />
            <em>to research clarity.</em>
          </h2>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card">
            <span className="comparison-label">Traditional Workflow</span>

            {traditional.map((item) => (
              <div className="comparison-row" key={item}>
                <X />
                {item}
              </div>
            ))}
          </div>

          <div className="comparison-arrow">
            <ArrowRight />
          </div>

          <div className="comparison-card comparison-card--active">
            <span className="comparison-label">Researcify Studio</span>

            {researcify.map((item) => (
              <div className="comparison-row" key={item}>
                <Check />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyResearcify;