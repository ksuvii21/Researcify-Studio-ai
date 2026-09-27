import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import StatsStrip from "../components/landing/StatsStrip";
import FeaturesSection from "../components/landing/FeaturesSection";
import AIShowcase from "../components/landing/AIShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import ProductShowcase from "../components/landing/ProductShowcase";
import ResearchWorkflow from "../components/landing/ResearchWorkflow";
import UseCases from "../components/landing/UseCases";
import WhyResearcify from "../components/landing/WhyResearcify";
import ProductivitySection from "../components/landing/ProductivitySection";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

import "../components/landing/landing.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <LandingNavbar />

      <main>
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <AIShowcase />
        <HowItWorks />
        <ProductShowcase />
        <ResearchWorkflow />
        <UseCases />
        <WhyResearcify />
        <ProductivitySection />
        <Testimonials />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;