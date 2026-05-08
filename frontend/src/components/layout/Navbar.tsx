import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { Heart, Menu, User, X, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get("/users/favorites");
      return response.data;
    },
    enabled: !!user,
  });

  const favoritesCount = favorites?.length || 0;

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
              {/* <img
                src={isDark ? "/image/logo-white.png" : "/image/logo.png"}
                alt="Logo"
                className="h-6 w-auto"
              /> */}
              <h1 className="text-2xl font-bold">
                Air<span className="text-(--color-primary)">b</span>nb
              </h1>
            </Link>
            <nav className="hidden md:flex gap-6 lg:gap-8">
              {user && (
                <>
                  <Link
                    to="/all-listings"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b border-transparent hover:border-gray-900 dark:hover:border-white pb-0.5 transition-all duration-200"
                  >
                    Places to stay
                  </Link>
                  <Link
                    to="/bookings"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b border-transparent hover:border-gray-900 dark:hover:border-white pb-0.5 transition-all duration-200"
                  >
                    Bookings
                  </Link>
                </>
              )}
              {!user && (
                <Link
                  to="/all-listings"
                  className="text-[11px] font-medium tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b border-transparent hover:border-gray-900 dark:hover:border-white pb-0.5 transition-all duration-200"
                >
                  Places to stay
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                <Link
                  to="/favorites"
                  className="relative w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e242d]">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            await logout();
                            setIsProfileDropdownOpen(false);
                            navigate("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </Link>
                )}
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
                {user ? (
                  <>
                    <Link
                      to="/all-listings"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Places to stay
                    </Link>
                    <Link
                      to="/bookings"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/all-listings"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Places to stay
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wishlist
                  </span>
                </button>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate("/");
                      }}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Login
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="h-16" />
    </>
  );
}
