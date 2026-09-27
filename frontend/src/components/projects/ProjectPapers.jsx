import {
  ArrowUpRight,
  BookOpen,
  Plus,
} from "lucide-react";

import { projectPapers } from "../../data/projectMockData";

const ProjectPapers = () => {
  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Research Papers</h2>
          <p>
            Literature connected to this
            research project.
          </p>
        </div>

        <button type="button">
          <Plus size={15} />
          Add Paper
        </button>
      </div>

      <div className="project-resource-list">
        {projectPapers.map((paper) => (
          <article
            key={paper.id}
            className="project-resource"
          >
            <span className="project-resource__icon">
              <BookOpen size={18} />
            </span>

            <div className="project-resource__content">
              <h3>{paper.title}</h3>

              <p>{paper.authors}</p>

              <div>
                <span>{paper.year}</span>
                <span>{paper.status}</span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Open paper"
            >
              <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectPapers;