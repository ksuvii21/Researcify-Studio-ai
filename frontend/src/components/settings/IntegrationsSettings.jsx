import {
  CheckCircle2,
  Link2,
  Plug,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

const integrations = [
  {
    name: "Zotero",
    description:
      "Import and organize references from your Zotero library.",
    connected: false,
  },
  {
    name: "Google Scholar",
    description:
      "Use Scholar links when discovering academic research.",
    connected: false,
  },
  {
    name: "GitHub",
    description:
      "Connect repositories with technical research projects.",
    connected: true,
    icon: FaGithub,
  },
];

const IntegrationsSettings = () => {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <Link2 size={20} />
        </span>

        <div>
          <h2>Integrations</h2>

          <p>
            Connect external research
            and productivity services
            to your workspace.
          </p>
        </div>
      </div>

      <div className="integration-list">
        {integrations.map(
          (integration) => {
            const Icon =
              integration.icon ||
              Plug;

            return (
              <article
                key={
                  integration.name
                }
                className="integration-card"
              >
                <span>
                  <Icon size={20} />
                </span>

                <div>
                  <h3>
                    {
                      integration.name
                    }
                  </h3>

                  <p>
                    {
                      integration.description
                    }
                  </p>
                </div>

                {integration.connected ? (
                  <button
                    type="button"
                    className="connected"
                  >
                    <CheckCircle2
                      size={15}
                    />
                    Connected
                  </button>
                ) : (
                  <button type="button">
                    Connect
                  </button>
                )}
              </article>
            );
          }
        )}
      </div>

      <p className="settings-integration-note">
        Integration buttons are UI-only
        during Phase 7. Authentication
        and provider APIs will be added
        during backend integration.
      </p>
    </section>
  );
};

export default IntegrationsSettings;