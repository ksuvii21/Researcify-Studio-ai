import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import Logo from "../common/Logo";

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer__grid">
          <div className="landing-footer__brand">
            <Logo showTagline />

            <p>
              An intelligent workspace for discovering, organizing
              and understanding research.
            </p>

            <div className="landing-footer__socials">
              <button type="button" aria-label="GitHub">
                <FaGithub />
              </button>

              <button type="button" aria-label="LinkedIn">
                <FaLinkedinIn />
              </button>
            </div>
          </div>

          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#ai-research">AI Assistant</a>
            <a href="#how-it-works">Research Projects</a>
            <a href="#features">Library</a>
            <a href="#features">Notes</a>
          </div>

          <div>
            <h4>Resources</h4>
            <a href="#home">Documentation</a>
            <a href="#home">Help Center</a>
            <a href="#home">Research Guide</a>
            <a href="#home">Updates</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#home">Contact</a>
            <a href="#home">Privacy</a>
            <a href="#home">Terms</a>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>© 2026 Researcify Studio. All rights reserved.</span>

          <span>Research Smarter. Discover Deeper.</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;