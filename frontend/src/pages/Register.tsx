import { useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Lock, AtSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(name, username, email, password);
      toast.success("Registration successful");
      navigate("/login");
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : "Registration failed";
      toast.error(message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-10 dark:bg-[#1e242d]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#111827] lg:grid-cols-[0.9fr_1fr]">
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="text-2xl font-bold text-gray-950 dark:text-white">
              Air<span className="text-(--color-primary)">b</span>nb
            </Link>
            <div className="mt-10">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
                Create account
              </p>
              <h1
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="mt-2 text-4xl font-semibold text-gray-950 dark:text-white"
              >
                Start booking better stays.
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
                Save homes, manage trips, and keep your profile ready for hosts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <AuthInput
                icon={User}
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Full name"
              />
              <AuthInput
                icon={AtSign}
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="username"
              />
              <AuthInput
                icon={Mail}
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="you@example.com"
              />
              <AuthInput
                icon={Lock}
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                placeholder="Create a password"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-(--color-primary) px-5 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-(--color-primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-[14px] text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-(--color-primary) hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-full lg:block">
          <img
            src="/image/hero-background.jpg"
            alt="Airbnb stay"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/30 bg-white/90 p-5 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#111827]/90">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
              Guest ready
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="mt-2 text-3xl font-semibold text-gray-950 dark:text-white"
            >
              Your next trip starts with a clean profile.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors focus-within:border-(--color-primary) dark:border-white/[0.08] dark:bg-white/[0.04]">
        <Icon className="h-4 w-4 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full bg-transparent text-[14px] text-gray-950 outline-none placeholder:text-gray-300 dark:text-white"
          placeholder={placeholder}
        />
      </span>
    </label>
  );
}
