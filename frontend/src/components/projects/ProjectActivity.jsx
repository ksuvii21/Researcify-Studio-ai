import {
  Activity,
} from "lucide-react";

import { projectActivity } from "../../data/projectMockData";

const ProjectActivity = () => {
  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Project Activity</h2>

          <p>
            Recent changes across this research
            workspace.
          </p>
        </div>

        <Activity size={19} />
      </div>

      <div className="project-activity">
        {projectActivity.map(
          (item) => (
            <article
              key={item.id}
              className="project-activity__item"
            >
              <span className="project-activity__marker" />

              <div>
                <strong>
                  {item.title}
                </strong>

                <p>
                  {item.description}
                </p>

                <small>
                  {item.time}
                </small>
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectActivity;