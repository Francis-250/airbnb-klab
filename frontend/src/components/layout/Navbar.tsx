import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { Heart, Home, Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBottomNav, setShowBottomNav] = useState(true);

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
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowBottomNav(false);
      } else if (currentScrollY < lastScrollY) {
        setShowBottomNav(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1e242d] z-50 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <img
              src={isDark ? "/image/logo-white.png" : "/image/logo.png"}
              alt="Logo"
              className="h-6 w-auto"
            />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600">
                <Menu className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search destinations…"
              className="w-full bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-9 pr-3 text-[13px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none tracking-wide"
            />
          </div>
        </div>
      </div>
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-[#1e242d] z-50">
        <div className="flex items-center justify-between h-16 px-[6vw] lg:px-[9vw]">
          <img
            src={isDark ? "/image/logo-white.png" : "/image/logo.png"}
            alt="Logo"
            className="h-7 w-auto"
          />
          <nav className="flex gap-8">
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
            <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button className="relative w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e242d]">
                1
              </span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e242d] border-t border-gray-200 dark:border-gray-700 z-50 md:hidden transition-transform duration-300 ${
          showBottomNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-around items-center pt-1.5 pb-3">
          {[
            { icon: Home, label: "Explore", href: "/" },
            { icon: Search, label: "Search" },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href ?? "#"}
              className="flex flex-col items-center gap-1 px-4 py-1.5 group"
            >
              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
              <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {label}
              </span>
            </a>
          ))}
          <button className="relative flex flex-col items-center gap-1 px-4 py-1.5 group">
            <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            <span className="absolute top-0.5 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e242d]">
              1
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Wishlist
            </span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-1.5 group">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Login
            </span>
          </button>
        </div>
      </div>
      <div className="h-21.25 md:h-0" />
      <div className="h-16 md:hidden" />
    </>
  );
}
