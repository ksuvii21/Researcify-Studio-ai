import {
  Code2,
  GraduationCap,
  School,
  Sparkles,
  Users,
  FilePenLine,
} from "lucide-react";

const cases = [
  {
    icon: GraduationCap,
    title: "Students",
    text: "Assignments, literature reviews and academic projects.",
  },
  {
    icon: School,
    title: "Researchers",
    text: "Paper discovery, analysis and knowledge organization.",
  },
  {
    icon: FilePenLine,
    title: "Thesis & Dissertation",
    text: "Manage sources, notes, questions and literature.",
  },
  {
    icon: Users,
    title: "Research Teams",
    text: "Organize shared research projects and knowledge.",
  },
  {
    icon: Code2,
    title: "Technical Researchers",
    text: "Track technical papers, concepts and emerging technologies.",
  },
];

const UseCases = () => {
  return (
    <section className="landing-section" id="use-cases">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>
            <Sparkles />
            Use Cases
          </span>

          <h2>
            Built for every stage
            <br />
            <em>of research.</em>
          </h2>
        </div>

        <div className="use-cases-grid">
          {cases.map(({ icon: Icon, title, text }) => (
            <article className="use-case-card" key={title}>
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

export default UseCases;