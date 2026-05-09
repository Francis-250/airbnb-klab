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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 dark:bg-[#0f1117]">
      <div className="w-full max-w-[420px]">
        <Link
          to="/"
          className="inline-flex text-2xl font-bold text-gray-950 dark:text-white"
        >
          Air<span className="text-(--color-primary)">b</span>nb
        </Link>

        <div className="mt-10">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
            Create account
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="mt-2 text-3xl font-semibold text-gray-950 dark:text-white"
          >
            Join Airbnb
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-gray-500 dark:text-gray-400">
            Create your account to save homes and manage trips.
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
