import {
  BrainCircuit,
  FileSearch,
  FolderKanban,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileSearch,
    title: "Discover",
    text: "Search and find relevant academic research.",
  },
  {
    number: "02",
    icon: FolderKanban,
    title: "Organize",
    text: "Save papers into projects, collections and your library.",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Understand",
    text: "Use AI to summarize, compare and analyze research.",
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "Create",
    text: "Turn insights into notes, questions and structured knowledge.",
  },
];

const HowItWorks = () => {
  return (
    <section className="landing-section" id="how-it-works">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>
            <Sparkles />
            How It Works
          </span>

          <h2>
            From question to <em>insight.</em>
          </h2>

          <p>
            A connected workflow designed to keep your research moving.
          </p>
        </div>

        <div className="research-steps">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <article className="research-step" key={title}>
              <div className="research-step__top">
                <span>{number}</span>

                <div className="research-step__icon">
                  <Icon />
                </div>
              </div>

              <h3>{title}</h3>
              <p>{text}</p>

              {index < steps.length - 1 && (
                <div className="research-step__connector" />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;