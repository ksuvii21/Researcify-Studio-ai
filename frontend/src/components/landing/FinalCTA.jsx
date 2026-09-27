import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../ui/Button";

const FinalCTA = () => {
  return (
    <section className="final-cta">
      <div className="final-cta__glow" />

      <div className="landing-container">
        <h2>
          Your next research breakthrough
          <br />
          <span>starts here.</span>
        </h2>

        <p>
          Bring your papers, notes, projects and AI into one focused
          research workspace.
        </p>

        <div className="final-cta__actions">
          <Link to="/register">
            <Button
              variant="cta"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              Start Researching Free
            </Button>
          </Link>

          <a href="#features">
            <Button variant="outline" size="lg">
              Explore Researcify
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;