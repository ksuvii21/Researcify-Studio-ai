import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../ui/Button";
import DashboardPreview from "./DashboardPreview";

const HeroSection = () => {
  return (
    <section className="landing-hero" id="home">
      <div className="landing-hero__decor landing-hero__decor--one" />
      <div className="landing-hero__decor landing-hero__decor--two" />

      <div className="landing-container">
        <div className="landing-hero__content">
          <div className="landing-eyebrow">
            <Sparkles />
            AI-Powered Research Workspace
          </div>

          <h1>
            Research Smarter.
            <br />
            <span>Discover Deeper.</span>
          </h1>

          <p>
            Discover academic papers, organize your knowledge,
            analyze documents and collaborate with AI — all inside
            one intelligent research workspace.
          </p>

          <div className="landing-hero__actions">
            <Link to="/register">
              <Button
                variant="cta"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
              >
                Start Researching
              </Button>
            </Link>

            <a href="#features">
              <Button
                variant="outline"
                size="lg"
                icon={Play}
              >
                Explore Features
              </Button>
            </a>
          </div>

          <span className="landing-hero__note">
            No complicated setup. Build your research workspace in minutes.
          </span>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};

export default HeroSection;