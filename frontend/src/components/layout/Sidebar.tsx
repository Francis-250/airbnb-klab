import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardLinks } from "../../data";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  setIsOpen,
}: SidebarProps) {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  return (
    <>
      <div
        className={`h-screen fixed top-0 left-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-500 hidden md:flex flex-col z-20 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Admin
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="flex flex-col space-y-1 px-2">
            {DashboardLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = activeLink === link.url;

              return (
                <Link
                  to={link.url}
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-(--color-primary) text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? link.title : ""}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 font-medium truncate">
                      {link.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {!collapsed && (
          <div className="p-4 text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Airbnb
          </div>
        )}
      </div>

      <div
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white z-30 transition-all duration-300 md:hidden transform ${
          closed ? "-translate-x-full" : "translate-x-0"
        } w-64`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Navigation
          </h2>
          <button
            onClick={() => setIsOpen(!closed)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="flex flex-col space-y-1 px-2">
            {DashboardLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = activeLink === link.url;

              return (
                <Link
                  to={link.url}
                  key={index}
                  onClick={() => setIsOpen(!closed)}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-(--color-primary) text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3 font-medium">{link.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Airbnb
        </div>
      </div>

      {!closed && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20 md:hidden"
          onClick={() => setIsOpen(true)}
        />
      )}

      <button
        onClick={() => setIsOpen(false)}
        className="fixed bottom-4 right-4 p-3 bg-(--color-primary) rounded-full md:hidden z-20 hover:bg-(--color-primary)/90 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
