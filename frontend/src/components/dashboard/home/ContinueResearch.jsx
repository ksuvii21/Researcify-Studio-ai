import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Sparkles,
} from "lucide-react";

const ContinueResearch = () => {
  return (
    <section className="dashboard-card continue-research">
      <div className="dashboard-card__header">
        <div>
          <h2>Continue Research</h2>
          <p>Pick up from your latest session.</p>
        </div>

        <div className="continue-research__spark">
          <Sparkles size={16} />
        </div>
      </div>

      <div className="continue-research__project">
        <span>Active Project</span>

        <h3>Artificial Intelligence in Education</h3>

        <div className="continue-research__progress">
          <div>
            <span>Project progress</span>
            <strong>72%</strong>
          </div>

          <div className="continue-research__bar">
            <span />
          </div>
        </div>
      </div>

      <div className="continue-research__paper">
        <div className="continue-research__paper-icon">
          <BookOpenText size={18} />
        </div>

        <div>
          <span>Last opened paper</span>

          <strong>
            Generative AI and Personalized Learning
            Environments
          </strong>

          <small>
            <Clock3 size={12} />
            Last opened 38 minutes ago
          </small>
        </div>
      </div>

      <button
        type="button"
        className="continue-research__button"
      >
        Continue Research
        <ArrowRight size={15} />
      </button>
    </section>
  );
};

export default ContinueResearch;