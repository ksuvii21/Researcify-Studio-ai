import { Menu } from "lucide-react";
import { useState } from "react";

import ThemeToggle from "../common/ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import CreateMenu from "./CreateMenu";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";
import useCreateAction from "../../hooks/useCreateAction";

const DashboardTopbar = ({
  onMobileMenuOpen
}) => {
  const { handleAction } =
    useCreateAction();
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu((current) =>
      current === menu ? null : menu
    );
  };

  const closeMenus = () => setActiveMenu(null);

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__left">
        <button
          type="button"
          className="dashboard-mobile-trigger"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <GlobalSearch />
      </div>

      <div className="dashboard-topbar__actions">
        <CreateMenu
          open={activeMenu === "create"}
          onToggle={() => toggleMenu("create")}
          onClose={closeMenus}
          onAction={handleAction}
        />

        <ThemeToggle />

        <NotificationMenu
          open={activeMenu === "notifications"}
          onToggle={() => toggleMenu("notifications")}
          onClose={closeMenus}
        />

        <ProfileMenu
          open={activeMenu === "profile"}
          onToggle={() => toggleMenu("profile")}
          onClose={closeMenus}
        />
      </div>
    </header>
  );
};

export default DashboardTopbar;