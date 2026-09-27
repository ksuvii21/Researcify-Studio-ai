import {
  CircleHelp,
  Keyboard,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProfileMenu = ({
  open,
  onToggle,
  onClose,
}) => {
  const navigate = useNavigate();

  const auth = useAuth();

  const user = auth?.user;

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Researcher";

  const email =
    user?.email ||
    "Your research workspace";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "R";

  const handleLogout = async () => {
    onClose();

    if (auth?.logout) {
      await auth.logout();
    }

    navigate("/login");
  };

  return (
    <div className="dashboard-dropdown-wrapper">
      <button
        type="button"
        className="dashboard-profile-trigger"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{initials}</span>

        <div>
          <strong>{displayName}</strong>
          <small>Researcher</small>
        </div>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="dashboard-dropdown-backdrop"
            onClick={onClose}
            aria-label="Close profile menu"
          />

          <div className="dashboard-dropdown dashboard-profile-menu">
            <div className="dashboard-profile-menu__user">
              <div>{initials}</div>

              <span>
                <strong>{displayName}</strong>
                <small>{email}</small>
              </span>
            </div>

            <div className="dashboard-profile-menu__divider" />

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/profile");
              }}
            >
              <UserRound size={16} />
              My Profile
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/settings");
              }}
            >
              <Settings size={16} />
              Account Settings
            </button>

            <button type="button">
              <Palette size={16} />
              Appearance
            </button>

            <button type="button">
              <Keyboard size={16} />
              Keyboard Shortcuts
            </button>

            <button type="button">
              <CircleHelp size={16} />
              Help
            </button>

            <div className="dashboard-profile-menu__divider" />

            <button
              type="button"
              className="dashboard-profile-menu__logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMenu;