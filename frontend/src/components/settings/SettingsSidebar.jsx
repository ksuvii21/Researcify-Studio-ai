import {
  Bell,
  Bot,
  BrainCircuit,
  Link2,
  LockKeyhole,
  Palette,
  UserRound,
} from "lucide-react";

const sections = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "research",
    label: "Research",
    icon: BrainCircuit,
  },
  {
    id: "ai",
    label: "AI Assistant",
    icon: Bot,
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: LockKeyhole,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link2,
  },
];

const SettingsSidebar = ({
  active,
  setActive,
}) => {
  return (
    <aside className="settings-nav">
      <span className="settings-nav__title">
        Settings
      </span>

      {sections.map(
        ({
          id,
          label,
          icon: Icon,
        }) => (
          <button
            type="button"
            key={id}
            className={
              active === id
                ? "active"
                : ""
            }
            onClick={() =>
              setActive(id)
            }
          >
            <Icon size={17} />
            {label}
          </button>
        )
      )}
    </aside>
  );
};

export default SettingsSidebar;