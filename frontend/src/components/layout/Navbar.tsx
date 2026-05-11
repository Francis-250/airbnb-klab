import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Search,
  Home,
  MapPin,
  Phone,
  Heart,
  CalendarDays,
  User,
  LogOut,
  Compass,
  MessageCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../../lib/api";
import ThemeToggle from "../ThemeToggle";
import { useAuthStore } from "../../store/auth.store";
import type { User as AuthUser } from "../../store/auth.store";

type Favorite = {
  id: string;
  listing: {
    id: string;
    title: string;
    location: string;
    price: number;
    image: string;
  };
};

const NAV_ITEMS = [
  { label: "Homes", to: "/all-listings", icon: Home, active: true },
  { label: "Places to stay", to: "/all-listings", icon: MapPin },
  { label: "Contact", to: "/#contact", icon: Phone },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [where, setWhere] = useState(
    () => new URLSearchParams(location.search).get("location") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    () => new URLSearchParams(location.search).get("maxPrice") || "",
  );
  const [guests, setGuests] = useState(
    () => new URLSearchParams(location.search).get("guests") || "",
  );
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const compact = !isHome || scrolled;

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      try {
        const response = await api.get("/users/favorites");
        return response.data.favorites as Favorite[];
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
  });

  const favoritesCount = favorites?.length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (location.hash === "#contact") {
      window.setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  }, [location.hash]);

  const runSearch = () => {
    const params = new URLSearchParams();
    if (where.trim()) params.set("location", where.trim());
    const price = Number(maxPrice);
    if (Number.isFinite(price) && price > 0) {
      params.set("maxPrice", String(price));
    }
    const guestsCount = Number(guests);
    if (Number.isFinite(guestsCount) && guestsCount > 0) {
      params.set("guests", String(guestsCount));
    }
    navigate(`/all-listings${params.toString() ? `?${params}` : ""}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300 dark:bg-[#0f1117]",
          compact
            ? "h-[70px] border-b border-gray-200 dark:border-white/[0.08]"
            : "h-[130px] border-b border-gray-100 dark:border-white/[0.08] md:h-[200px]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-[6vw] lg:px-[9vw]">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Home"
          >
            <span className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-4 h-4 text-white" strokeWidth={2} />
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white">
              Air<span className="text-(--color-primary)">b</span>nb
            </span>
          </Link>

          <div
            className={[
              "absolute left-1/2 hidden -translate-x-1/2 transition-all duration-300 md:block",
              compact
                ? "top-2 scale-100 opacity-100"
                : "top-20 scale-95 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <CompactSearch
              where={where}
              setWhere={setWhere}
              onSearch={runSearch}
            />
          </div>

          <nav
            className={[
              "absolute left-1/2 top-4 hidden -translate-x-1/2 items-end gap-8 transition-all duration-300 md:flex",
              compact
                ? "-translate-y-4 scale-95 opacity-0 pointer-events-none"
                : "translate-y-0 scale-100 opacity-100",
            ].join(" ")}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={[
                    "relative flex h-14 items-center gap-2 px-1 text-sm font-semibold transition-colors",
                    item.active
                      ? "text-gray-950 dark:text-white"
                      : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white",
                  ].join(" ")}
                >
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-800 dark:bg-white/[0.06] dark:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.label}</span>
                  {item.active && (
                    <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-gray-950 dark:bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 transition-colors hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <Avatar user={user} size={32} />
                <Menu className="mr-1.5 h-4 w-4 text-gray-700 dark:text-gray-200" />
              </button>

              {isProfileOpen && (
                <ProfileMenu
                  user={user}
                  favoritesCount={favoritesCount}
                  logout={logout}
                  navigate={navigate}
                  close={() => setIsProfileOpen(false)}
                />
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/[0.08] dark:text-gray-200 dark:hover:bg-white/[0.12] md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className={[
            "absolute left-1/2 hidden w-[min(900px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 md:block",
            compact
              ? "top-14 scale-95 opacity-0 pointer-events-none"
              : "top-[100px] scale-100 opacity-100",
          ].join(" ")}
        >
          <LargeSearch
            where={where}
            setWhere={setWhere}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            guests={guests}
            setGuests={setGuests}
            onSearch={runSearch}
          />
        </div>

        <div className="mx-4 mt-1 md:hidden">
          <CompactSearch
            where={where}
            setWhere={setWhere}
            onSearch={runSearch}
          />
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-3 top-20 z-50 rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/[0.08] dark:bg-[#111827] md:hidden">
            <MobileMenu
              user={user}
              favoritesCount={favoritesCount}
              logout={logout}
              navigate={navigate}
              close={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      <div className={compact ? "h-[70px]" : "h-[130px] md:h-[200px]"} />
    </>
  );
}

function LargeSearch({
  where,
  setWhere,
  maxPrice,
  setMaxPrice,
  guests,
  setGuests,
  onSearch,
}: {
  where: string;
  setWhere: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  guests: string;
  setGuests: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="grid h-[64px] grid-cols-[1fr_1fr_1fr_auto] items-center rounded-full border border-gray-200 bg-white pl-6 pr-2 dark:border-white/[0.1] dark:bg-[#111827]">
      <label className="min-w-0 border-r border-gray-200 pr-5 dark:border-white/[0.1]">
        <span className="block text-xs font-semibold text-gray-950 dark:text-white">
          Where
        </span>
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Search destinations"
          className="mt-0.5 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
      </label>
      <label className="border-r border-gray-200 px-5 text-left dark:border-white/[0.1]">
        <span className="block text-xs font-semibold text-gray-950 dark:text-white">
          Price
        </span>
        <input
          type="number"
          min={1}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Max price"
          className="mt-0.5 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
      </label>
      <label className="px-5 text-left">
        <span className="block text-xs font-semibold text-gray-950 dark:text-white">
          How Many guests
        </span>
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Add guests"
          className="mt-0.5 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
      </label>
      <button
        onClick={onSearch}
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-(--color-primary) text-white transition-colors hover:bg-(--color-primary-dark)"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}

function CompactSearch({
  where,
  setWhere,
  onSearch,
}: {
  where: string;
  setWhere: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex h-[48px] items-center rounded-full border border-gray-200 bg-white pl-4 pr-2 dark:border-white/[0.1] dark:bg-[#111827]">
      <label className="flex min-w-0 flex-1 items-center gap-2 pr-3 text-xs font-semibold text-gray-950 dark:text-white">
        <Home className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Anywhere"
          className="min-w-0 flex-1 bg-transparent text-xs text-gray-950 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-500"
        />
      </label>
      <button
        onClick={onSearch}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary) text-white transition-colors hover:bg-(--color-primary-dark)"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProfileMenu({
  user,
  favoritesCount,
  logout,
  navigate,
  close,
}: {
  user: AuthUser | null;
  favoritesCount: number;
  logout: () => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
  close: () => void;
}) {
  return (
    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 dark:border-white/[0.08] dark:bg-[#111827]">
      {user ? (
        <>
          <div className="px-4 py-2">
            <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <MenuLink to="/profile" close={close} icon={User} label="Profile" />
          <MenuLink
            to="/bookings"
            close={close}
            icon={CalendarDays}
            label="Bookings"
          />
          <MenuLink
            to="/messages"
            close={close}
            icon={MessageCircle}
            label="Messages"
          />
          <MenuLink
            to="/favorites"
            close={close}
            icon={Heart}
            label={`Saved places${favoritesCount ? ` (${favoritesCount})` : ""}`}
          />
          <div className="my-2 h-px bg-gray-100 dark:bg-white/[0.06]" />
          <button
            onClick={async () => {
              await logout();
              close();
              navigate("/");
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </>
      ) : (
        <>
          <MenuLink to="/login" close={close} icon={User} label="Sign in" />
          <MenuLink
            to="/register"
            close={close}
            icon={CalendarDays}
            label="Create account"
          />
        </>
      )}
    </div>
  );
}

function MobileMenu({
  user,
  favoritesCount,
  logout,
  navigate,
  close,
}: {
  user: AuthUser | null;
  favoritesCount: number;
  logout: () => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
  close: () => void;
}) {
  return (
    <div className="space-y-1">
      <MenuLink to="/all-listings" close={close} icon={Home} label="Homes" />
      <MenuLink
        to="/bookings"
        close={close}
        icon={CalendarDays}
        label="Bookings"
      />
      <MenuLink
        to="/messages"
        close={close}
        icon={MessageCircle}
        label="Messages"
      />
      <MenuLink
        to="/favorites"
        close={close}
        icon={Heart}
        label={`Saved places${favoritesCount ? ` (${favoritesCount})` : ""}`}
      />
      <div className="my-2 h-px bg-gray-100 dark:bg-white/[0.06]" />
      {user ? (
        <button
          onClick={async () => {
            await logout();
            close();
            navigate("/");
          }}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      ) : (
        <>
          <MenuLink to="/login" close={close} icon={User} label="Sign in" />
          <MenuLink
            to="/register"
            close={close}
            icon={CalendarDays}
            label="Create account"
          />
        </>
      )}
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  close,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  close: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={close}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
    >
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      {label}
    </Link>
  );
}

function Avatar({ user, size }: { user: AuthUser | null; size: number }) {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  if (!user) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-white/[0.08] dark:text-gray-300"
      >
        <User className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold uppercase text-emerald-700"
    >
      {user.name?.charAt(0) || "U"}
    </span>
  );
}
