import {
  Activity,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Library,
  NotebookPen,
  Search,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";

const DashboardPreview = () => {
  return (
    <div className="dashboard-preview-wrap">
      <div className="dashboard-preview">
        <div className="preview-topbar">
          <div className="preview-dots">
            <span />
            <span />
            <span />
          </div>

          <div className="preview-search">
            <Search />
            <span>Search your research...</span>
          </div>
        </div>

        <div className="preview-body">
          <aside className="preview-sidebar">
            <div className="preview-brand">
              <BookOpen />
              <span>Researcify</span>
            </div>

            {[
              [LayoutDashboard, "Dashboard", true],
              [Search, "Discover", false],
              [FolderKanban, "Projects", false],
              [Library, "Library", false],
              [NotebookPen, "Notes", false],
              [Sparkles, "AI Assistant", false],
              [Activity, "Activity", false],
            ].map(([Icon, label, active]) => (
              <div
                key={label}
                className={`preview-nav-item ${active ? "active" : ""}`}
              >
                <Icon />
                <span>{label}</span>
              </div>
            ))}
          </aside>

          <main className="preview-main">
            <div className="preview-heading">
              <div>
                <small>Welcome back</small>
                <strong>Research Dashboard</strong>
              </div>

              <div className="preview-avatar">KG</div>
            </div>

            <div className="preview-stats">
              <div>
                <span>Papers</span>
                <strong>128</strong>
              </div>

              <div>
                <span>Projects</span>
                <strong>6</strong>
              </div>

              <div>
                <span>Notes</span>
                <strong>47</strong>
              </div>

              <div>
                <span>AI Chats</span>
                <strong>23</strong>
              </div>
            </div>

            <div className="preview-content-grid">
              <div>
                <div className="preview-section-label">
                  Active Research
                </div>

                <div className="preview-project">
                  <div>
                    <strong>AI in Education</strong>
                    <span>24 papers · 12 notes</span>
                  </div>

                  <div className="preview-progress">
                    <i style={{ width: "76%" }} />
                  </div>
                </div>

                <div className="preview-project">
                  <div>
                    <strong>Sustainable IoT Systems</strong>
                    <span>18 papers · 8 notes</span>
                  </div>

                  <div className="preview-progress">
                    <i style={{ width: "58%" }} />
                  </div>
                </div>

                <div className="preview-paper">
                  <FileText />
                  <div>
                    <strong>
                      Generative AI and Personalized Learning
                    </strong>
                    <span>Continue reading · 68%</span>
                  </div>
                </div>
              </div>

              <div className="preview-ai">
                <div className="preview-ai__title">
                  <Sparkles />
                  <strong>Ask Researcify AI</strong>
                </div>

                <p>
                  Analyze your papers, compare findings and discover
                  research gaps.
                </p>

                <div className="preview-ai-message">
                  <BrainCircuit />
                  <span>
                    Three major themes emerge across your selected
                    studies...
                  </span>
                </div>

                <div className="preview-ai-chips">
                  <span>Summarize</span>
                  <span>Compare</span>
                  <span>Find gaps</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="floating-research-card floating-research-card--one">
        <CheckCircle2 />
        AI Summary Complete
      </div>

      <div className="floating-research-card floating-research-card--two">
        <BookOpen />
        128 Papers Organized
      </div>

      <div className="floating-research-card floating-research-card--three">
        <Sparkles />
        Research Gap Found
      </div>

      <div className="floating-research-card floating-research-card--four">
        <FolderKanban />
        6 Active Projects
      </div>
    </div>
  );
};

export default DashboardPreview;