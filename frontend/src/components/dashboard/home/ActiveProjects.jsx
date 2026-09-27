import {
  ArrowUpRight,
  BookOpen,
  MoreHorizontal,
  NotebookPen,
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Artificial Intelligence in Education",
    description:
      "Exploring generative AI, adaptive learning and personalized education.",
    status: "In Progress",
    progress: 72,
    papers: 24,
    notes: 12,
    updated: "2 hours ago",
    members: ["KG", "AI"],
  },
  {
    id: 2,
    name: "Sustainable IoT Systems",
    description:
      "Low-power connected systems for sustainable monitoring environments.",
    status: "Researching",
    progress: 48,
    papers: 18,
    notes: 8,
    updated: "Yesterday",
    members: ["KG"],
  },
  {
    id: 3,
    name: "Human-Computer Interaction",
    description:
      "Studying human-centered interfaces and intelligent interaction.",
    status: "Review",
    progress: 86,
    papers: 31,
    notes: 17,
    updated: "3 days ago",
    members: ["KG", "RS"],
  },
];

const ActiveProjects = () => {
  return (
    <section className="dashboard-card dashboard-projects">
      <div className="dashboard-card__header">
        <div>
          <h2>Active Research Projects</h2>
          <p>Continue where you left off.</p>
        </div>

        <button type="button" className="text-button">
          View all
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article
            className="project-card"
            key={project.id}
          >
            <div className="project-card__heading">
              <div>
                <span className="project-card__status">
                  {project.status}
                </span>

                <h3>{project.name}</h3>
              </div>

              <button
                type="button"
                className="icon-ghost-button"
                aria-label={`More options for ${project.name}`}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>

            <p>{project.description}</p>

            <div className="project-card__progress-row">
              <span>Research progress</span>
              <strong>{project.progress}%</strong>
            </div>

            <div className="project-card__progress">
              <span
                style={{
                  width: `${project.progress}%`,
                }}
              />
            </div>

            <div className="project-card__footer">
              <div className="project-card__stats">
                <span>
                  <BookOpen size={13} />
                  {project.papers} papers
                </span>

                <span>
                  <NotebookPen size={13} />
                  {project.notes} notes
                </span>
              </div>

              <div className="project-card__members">
                {project.members.map((member) => (
                  <span key={member}>{member}</span>
                ))}
              </div>
            </div>

            <div className="project-card__bottom">
              <small>Updated {project.updated}</small>

              <button type="button">
                Open Project
                <ArrowUpRight size={13} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ActiveProjects;