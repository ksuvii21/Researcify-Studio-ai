import { Menu, X, ArrowRight, Bold } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../ui/Button";

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="landing-container landing-navbar__inner">
        <a href="#home" onClick={closeMenu}>
          <Logo compact />
        <span style={{ fontWeight: "bold", fontSize: "1.2rem", fontFamily: "Inter", marginLeft: "1rem" }}>Researcify Studio AI</span>
        </a>

        <nav className={`landing-nav ${mobileOpen ? "open" : ""}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
          <a href="#ai-research" onClick={closeMenu}>AI Research</a>
          <a href="#use-cases" onClick={closeMenu}>Use Cases</a>
          <a href="#about" onClick={closeMenu}>About</a>

          <div className="landing-nav__mobile-actions">
            <Link to="/login" onClick={closeMenu}>
              Sign In
            </Link>

            <Link to="/register" onClick={closeMenu}>
              <Button icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        <div className="landing-navbar__actions">
          <ThemeToggle />

          <Link to="/login" className="landing-signin">
            Sign In
          </Link>

          <Link to="/register">
            <Button icon={ArrowRight} iconPosition="right">
              Get Started
            </Button>
          </Link>

          <button
            type="button"
            className="landing-mobile-menu"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;