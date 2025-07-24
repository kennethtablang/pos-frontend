// src/components/dashboard/Navbar.tsx
import { Menu, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import ThemeToggle from "../ThemeToggle";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear token/session
    navigate("/login"); // redirect to login
  };

  return (
    <header className="sticky top-0 z-30 bg-base-100 shadow px-6 py-4 flex justify-between items-center">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="md:hidden btn btn-ghost btn-sm p-2"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
      </div>

      {/* Right: User menu */}
      {/* Right: Theme toggle + User menu */}
      <div className="flex items-center gap-4">
        {/* Theme Switch */}
        <ThemeToggle />

        {/* User dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm avatar p-1"
            aria-label="User menu"
          >
            <div className="w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content mt-3 p-2 shadow menu menu-sm bg-base-100 rounded-box w-48"
          >
            <li>
              <button
                type="button"
                onClick={() => navigate("/dashboard/profile")}
                className="justify-start"
              >
                My Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="justify-start text-error flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
