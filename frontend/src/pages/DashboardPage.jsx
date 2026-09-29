import DashboardWelcome from "../components/dashboard/home/DashboardWelcome";
import QuickActions from "../components/dashboard/home/QuickActions";
import ResearchOverview from "../components/dashboard/home/ResearchOverview";
import ActiveProjects from "../components/dashboard/home/ActiveProjects";
import ContinueResearch from "../components/dashboard/home/ContinueResearch";
import RecentPapers from "../components/dashboard/home/RecentPapers";
import RecentDocuments from "../components/dashboard/home/RecentDocuments";
import AIAssistantCard from "../components/dashboard/home/AIAssistantCard";
import RecommendedPapers from "../components/dashboard/home/RecommendedPapers";
import ResearchActivity from "../components/dashboard/home/ResearchActivity";
import LibraryPreview from "../components/dashboard/home/LibraryPreview";

import "../components/dashboard/home/dashboard-home.css";

const DashboardPage = () => {
  return (
    <div className="dashboard-home">
      <DashboardWelcome />

      <QuickActions />

      <ResearchOverview />

      <div className="dashboard-home__grid dashboard-home__grid--projects">
        <ActiveProjects />
        <ContinueResearch />
      </div>

      <div className="dashboard-home__grid dashboard-home__grid--research">
        <RecentPapers />
        <RecentDocuments />
      </div>

      <AIAssistantCard />

      <div className="dashboard-home__grid dashboard-home__grid--insights">
        <RecommendedPapers />
        <ResearchActivity />
      </div>

      <LibraryPreview />
    </div>
  );
};

export default DashboardPage;