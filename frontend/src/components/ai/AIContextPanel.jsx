import {
  Check,
  File,
  FileText,
  FolderKanban,
  Plus,
  X,
} from "lucide-react";

const AIContextPanel = ({
  project,
  papers,
  documents,
  onTogglePaper,
  onToggleDocument,
}) => {
  const selectedPapers =
    papers.filter((item) => item.selected);

  const selectedDocuments =
    documents.filter((item) => item.selected);

  return (
    <aside className="ai-context">
      <div className="ai-context__heading">
        <div>
          <h2>Research Context</h2>
          <p>
            Control what the assistant can use.
          </p>
        </div>
      </div>

      <section className="ai-context__project">
        <div className="ai-context__section-title">
          <FolderKanban size={16} />
          Active Project
        </div>

        <div className="ai-context__project-card">
          <span>Project</span>
          <strong>{project}</strong>
        </div>
      </section>

      <section>
        <div className="ai-context__section-header">
          <div className="ai-context__section-title">
            <FileText size={16} />
            Papers
          </div>

          <span>
            {selectedPapers.length} selected
          </span>
        </div>

        <div className="ai-context__items">
          {papers.map((paper) => (
            <button
              type="button"
              key={paper.id}
              className={
                paper.selected
                  ? "selected"
                  : ""
              }
              onClick={() =>
                onTogglePaper(paper.id)
              }
            >
              <span className="ai-context__check">
                {paper.selected && (
                  <Check size={12} />
                )}
              </span>

              <div>
                <strong>{paper.title}</strong>
                <span>{paper.authors}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ai-context__add"
        >
          <Plus size={14} />
          Add Paper
        </button>
      </section>

      <section>
        <div className="ai-context__section-header">
          <div className="ai-context__section-title">
            <File size={16} />
            Documents
          </div>

          <span>
            {selectedDocuments.length} selected
          </span>
        </div>

        <div className="ai-context__items">
          {documents.map((document) => (
            <button
              type="button"
              key={document.id}
              className={
                document.selected
                  ? "selected"
                  : ""
              }
              onClick={() =>
                onToggleDocument(document.id)
              }
            >
              <span className="ai-context__check">
                {document.selected && (
                  <Check size={12} />
                )}
              </span>

              <div>
                <strong>{document.name}</strong>
                <span>{document.type}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ai-context__add"
        >
          <Plus size={14} />
          Add Document
        </button>
      </section>

      {(selectedPapers.length > 0 ||
        selectedDocuments.length > 0) && (
        <section>
          <div className="ai-context__section-title">
            Selected Sources
          </div>

          <div className="ai-selected-sources">
            {selectedPapers.map((paper) => (
              <span key={paper.id}>
                {paper.title}
                <X size={12} />
              </span>
            ))}

            {selectedDocuments.map(
              (document) => (
                <span key={document.id}>
                  {document.name}
                  <X size={12} />
                </span>
              )
            )}
          </div>
        </section>
      )}
    </aside>
  );
};

export default AIContextPanel;