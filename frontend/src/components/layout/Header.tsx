import { Menu, User, LogOut } from "lucide-react";
import type { UserProps } from "../../types";
import ThemeToggle from "../ThemeToggle";
import { Link } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  setIsOpen: (isOpen: boolean) => void;
  user: UserProps;
}

export default function Header({ setIsOpen, user }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {};

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 mr-4 bg-(--color-primary) text-white rounded hover:bg-(--color-primary)/90 md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-gray-800 dark:text-white">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Profile menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.name}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-(--color-primary) flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-gray-700 capitalize dark:text-white hidden sm:block">
              {user?.name}
            </span>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 py-2 z-30">
                <Link
                  to="/admin/profile"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
