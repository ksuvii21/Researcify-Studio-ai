import {
  BrainCircuit,
  FolderKanban,
  Library,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    icon: Library,
    value: "100+",
    label: "Papers Organized",
  },
  {
    icon: BrainCircuit,
    value: "AI",
    label: "Powered Analysis",
  },
  {
    icon: FolderKanban,
    value: "Smart",
    label: "Knowledge Management",
  },
  {
    icon: Sparkles,
    value: "One",
    label: "Research Workspace",
  },
];

const StatsStrip = () => {
  return (
    <section className="landing-stats">
      <div className="landing-container">
        <h2>
          Everything you need to move from information to insight.
        </h2>

        <div className="landing-stats__grid">
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="landing-stat" key={label}>
              <Icon />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;