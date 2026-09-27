import { CalendarDays } from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const DashboardWelcome = () => {
  const auth = useAuth();
  const user = auth?.user;

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Researcher";

  const firstName = name.split(" ")[0];

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <section className="dashboard-welcome">
      <div>
        <span className="dashboard-welcome__eyebrow">
          Research Workspace
        </span>

        <h1>
          Good to see you, {firstName}
          <span>👋</span>
        </h1>

        <p>
          Ready to continue your research? You have{" "}
          <strong>3 active projects</strong> and{" "}
          <strong>8 papers</strong> waiting for review.
        </p>
      </div>

      <div className="dashboard-welcome__date">
        <CalendarDays size={16} />
        <span>{today}</span>
      </div>
    </section>
  );
};

export default DashboardWelcome;