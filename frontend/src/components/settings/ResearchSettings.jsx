import {
  BrainCircuit,
} from "lucide-react";

const ResearchSettings = () => {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <BrainCircuit size={20} />
        </span>

        <div>
          <h2>
            Research Preferences
          </h2>

          <p>
            Configure defaults for
            papers, citations and
            research organization.
          </p>
        </div>
      </div>

      <div className="settings-form-grid">
        <label>
          <span>
            Default Citation Style
          </span>

          <select defaultValue="APA 7th">
            <option>APA 7th</option>
            <option>MLA 9th</option>
            <option>Chicago</option>
            <option>IEEE</option>
            <option>Harvard</option>
          </select>
        </label>

        <label>
          <span>
            Default Paper Sort
          </span>

          <select defaultValue="Relevance">
            <option>
              Relevance
            </option>
            <option>
              Most Recent
            </option>
            <option>
              Most Cited
            </option>
          </select>
        </label>

        <label>
          <span>
            Default Project View
          </span>

          <select defaultValue="Grid">
            <option>Grid</option>
            <option>List</option>
          </select>
        </label>

        <label>
          <span>
            Research Language
          </span>

          <select defaultValue="English">
            <option>
              English
            </option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      <div className="settings-subsection">
        <h3>Paper Discovery</h3>

        <label className="setting-toggle">
          <div>
            <strong>
              Open-access priority
            </strong>

            <p>
              Prioritize freely
              accessible research
              where available.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
          />

          <span className="toggle-control" />
        </label>

        <label className="setting-toggle">
          <div>
            <strong>
              Personalized recommendations
            </strong>

            <p>
              Use your research
              interests to improve
              recommendations.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
          />

          <span className="toggle-control" />
        </label>
      </div>
    </section>
  );
};

export default ResearchSettings;