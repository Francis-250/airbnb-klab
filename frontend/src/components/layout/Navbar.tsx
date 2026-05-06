import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { Heart, Menu, User, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1e242d] z-50">
        <div className="px-4 sm:px-6 lg:px-[6vw] xl:px-[9vw]">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="shrink-0">
              <img
                src={isDark ? "/image/logo-white.png" : "/image/logo.png"}
                alt="Logo"
                className="h-6 w-auto"
              />
            </Link>
            <nav className="hidden md:flex gap-6 lg:gap-8">
              {["Places to stay", "Experiences", "Online Experiences"].map(
                (label) => (
                  <Link
                    key={label}
                    to="/all-listings"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b border-transparent hover:border-gray-900 dark:hover:border-white pb-0.5 transition-all duration-200"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                <button className="relative w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e242d]">
                    1
                  </span>
                </button>
                <Link
                  to="/login"
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Link>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-[#1e242d] z-40 md:hidden shadow-lg animate-slide-down">
            <div className="p-4 space-y-4">
              <div className="flex flex-col space-y-3">
                {["Places to stay", "Experiences", "Online Experiences"].map(
                  (label) => (
                    <Link
                      key={label}
                      to="/all-listings"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wishlist
                  </span>
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                </button>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Login
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="h-16" />
    </>
  );
}
