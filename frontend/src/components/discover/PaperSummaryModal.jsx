import {
  Bot,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import Modal from "../common/Modal";

const PaperSummaryModal = ({
  paper,
  onClose,
}) => {
  if (!paper) return null;

  return (
    <Modal
      open={Boolean(paper)}
      onClose={onClose}
      title="AI Paper Summary"
      description={paper.title}
      icon={Bot}
      size="lg"
    >
      <div className="paper-summary">
        <div className="paper-summary__notice">
          <Sparkles size={15} />

          <p>
            Prototype AI summary. Real
            document-aware generation will be
            connected to the AI/backend layer
            later.
          </p>
        </div>

        <section>
          <span className="paper-summary__label">
            Overview
          </span>

          <p>{paper.abstract}</p>
        </section>

        <section>
          <span className="paper-summary__label">
            Key Findings
          </span>

          <ul>
            <li>
              <CheckCircle2 size={13} />
              The study examines a major
              research direction related to{" "}
              {paper.tags[0]}.
            </li>

            <li>
              <CheckCircle2 size={13} />
              The work connects concepts across{" "}
              {paper.tags
                .slice(0, 2)
                .join(" and ")}.
            </li>

            <li>
              <CheckCircle2 size={13} />
              Further AI analysis can compare
              these findings with papers in your
              research library.
            </li>
          </ul>
        </section>

        <section className="paper-summary__insight">
          <Lightbulb size={17} />

          <div>
            <strong>
              Research opportunity
            </strong>

            <p>
              Add this paper to a research
              project to compare its methods,
              findings and limitations with
              related literature.
            </p>
          </div>
        </section>

        <div className="paper-summary__actions">
          <button type="button">
            Ask AI About Paper
          </button>

          <button type="button">
            Add to Project
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaperSummaryModal;