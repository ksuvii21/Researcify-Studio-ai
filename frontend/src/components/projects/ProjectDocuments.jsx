import {
  FileText,
  Plus,
} from "lucide-react";

import { projectDocuments } from "../../data/projectMockData";

const ProjectDocuments = () => {
  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Project Documents</h2>

          <p>
            Uploaded research material connected
            to this project.
          </p>
        </div>

        <button type="button">
          <Plus size={15} />
          Upload
        </button>
      </div>

      <div className="project-documents">
        {projectDocuments.map(
          (document) => (
            <article
              key={document.id}
              className="project-document"
            >
              <span className="project-resource__icon">
                <FileText size={18} />
              </span>

              <div>
                <strong>
                  {document.name}
                </strong>

                <p>
                  {document.type} ·{" "}
                  {document.size}
                </p>
              </div>

              <span
                className={`document-status ${
                  document.status ===
                  "Processed"
                    ? "processed"
                    : ""
                }`}
              >
                {document.status}
              </span>
            </article>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectDocuments;