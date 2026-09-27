import {
  Bookmark,
  FileText,
  Filter,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

const papers = [
  {
    title: "Generative AI and Personalized Learning",
    author: "R. Sharma et al.",
    year: "2026",
    tag: "AI Education",
  },
  {
    title: "Artificial Intelligence in Higher Education",
    author: "M. Chen et al.",
    year: "2025",
    tag: "Education",
  },
  {
    title: "Human-AI Collaboration in Learning Systems",
    author: "S. Patel et al.",
    year: "2026",
    tag: "HCI",
  },
];

const ProductShowcase = () => {
  return (
    <>
      <section className="landing-section landing-section--alternate">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span>
              <Sparkles />
              Research Projects
            </span>

            <h2>
              Everything about a research topic.
              <br />
              <em>Finally connected.</em>
            </h2>
          </div>

          <div className="project-showcase">
            <div className="project-showcase__header">
              <div>
                <small>RESEARCH PROJECT</small>
                <h3>Artificial Intelligence in Education</h3>

                <div className="showcase-tags">
                  <span>Artificial Intelligence</span>
                  <span>Education</span>
                  <span>Machine Learning</span>
                </div>
              </div>

              <button type="button">Open Project →</button>
            </div>

            <div className="project-showcase__stats">
              <div>
                <strong>24</strong>
                <span>Papers</span>
              </div>
              <div>
                <strong>12</strong>
                <span>Notes</span>
              </div>
              <div>
                <strong>5</strong>
                <span>AI Conversations</span>
              </div>
              <div>
                <strong>76%</strong>
                <span>Progress</span>
              </div>
            </div>

            <div className="project-showcase__content">
              <div>
                <h4>Recent Papers</h4>

                {papers.map((paper) => (
                  <div className="showcase-paper" key={paper.title}>
                    <FileText />

                    <div>
                      <strong>{paper.title}</strong>
                      <span>
                        {paper.author} · {paper.year}
                      </span>
                    </div>

                    <Bookmark />
                  </div>
                ))}
              </div>

              <div>
                <h4>AI Insights</h4>

                <div className="showcase-insight">
                  <Sparkles />
                  Personalized AI learning environments appear across
                  68% of the papers in this project.
                </div>

                <div className="showcase-insight">
                  <Sparkles />
                  Explainability and academic integrity remain recurring
                  unresolved research areas.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <div className="library-showcase-grid">
            <div className="landing-section-heading">
              <span>
                <Bookmark />
                Smart Library
              </span>

              <h2>
                Your research library.
                <br />
                <em>Finally organized.</em>
              </h2>

              <p>
                Stop losing papers across folders, browser tabs and
                downloads. Keep your research searchable and connected.
              </p>
            </div>

            <div className="library-demo">
              <div className="library-demo__toolbar">
                <div>
                  <Search />
                  Search papers...
                </div>

                <button type="button">
                  <Filter />
                  Filter
                </button>
              </div>

              {papers.map((paper, index) => (
                <div className="library-paper" key={paper.title}>
                  <div className="library-paper__icon">
                    <FileText />
                  </div>

                  <div className="library-paper__content">
                    <strong>{paper.title}</strong>

                    <span>
                      {paper.author} · {paper.year}
                    </span>

                    <small>{paper.tag}</small>
                  </div>

                  <button type="button">
                    <Star className={index === 0 ? "star-active" : ""} />
                  </button>

                  <button type="button">
                    <Bookmark />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductShowcase;