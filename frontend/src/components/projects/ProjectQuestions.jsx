import {
  CircleHelp,
  Plus,
} from "lucide-react";

import { researchQuestions } from "../../data/projectMockData";

const ProjectQuestions = () => {
  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Research Questions</h2>

          <p>
            Questions guiding the direction of
            this research project.
          </p>
        </div>

        <button type="button">
          <Plus size={15} />
          Add Question
        </button>
      </div>

      <div className="research-questions">
        {researchQuestions.map(
          (question, index) => (
            <article
              key={question.id}
              className="research-question"
            >
              <span className="research-question__number">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <CircleHelp size={18} />

              <div>
                <p>{question.text}</p>

                <span>
                  {question.status}
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectQuestions;