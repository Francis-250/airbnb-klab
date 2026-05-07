import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
          <rect
            x="20"
            y="30"
            width="140"
            height="80"
            rx="10"
            className="fill-[#F5F5F5] dark:fill-[#1A1A1A] stroke-[#EBEBEB] dark:stroke-[#2A2A2A]"
            strokeWidth="1"
          />
          <rect
            x="20"
            y="30"
            width="140"
            height="22"
            rx="10"
            className="fill-[#EBEBEB] dark:fill-[#2A2A2A] stroke-[#EBEBEB] dark:stroke-[#2A2A2A]"
            strokeWidth="1"
          />
          <rect
            x="20"
            y="41"
            width="140"
            height="11"
            className="fill-[#EBEBEB] dark:fill-[#2A2A2A]"
          />
          <circle
            cx="35"
            cy="41"
            r="5"
            className="fill-[#CCCCCC] dark:fill-[#444]"
          />
          <circle
            cx="51"
            cy="41"
            r="5"
            className="fill-[#CCCCCC] dark:fill-[#444]"
          />
          <circle
            cx="67"
            cy="41"
            r="5"
            className="fill-[#CCCCCC] dark:fill-[#444]"
          />
          <rect
            x="36"
            y="64"
            width="108"
            height="8"
            rx="4"
            className="fill-[#EBEBEB] dark:fill-[#2A2A2A]"
          />
          <rect
            x="55"
            y="80"
            width="70"
            height="8"
            rx="4"
            className="fill-[#EBEBEB] dark:fill-[#2A2A2A]"
          />
        </svg>
      </div>

      <h1
        style={{ fontFamily: "'Playfair Display', serif" }}
        className="text-[80px] font-semibold leading-none tracking-tight text-[#111] dark:text-white"
      >
        4<span className="text-[#CCCCCC] dark:text-[#444]">0</span>4
      </h1>

      <h2 className="text-xl font-semibold text-[#111] dark:text-white mt-4 mb-2">
        Page not found
      </h2>
      <p className="text-[14px] text-[#AAAAAA] mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-xl text-[14px] font-medium hover:opacity-80 transition-opacity"
        >
          ← Go back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#AAAAAA] rounded-xl text-[14px] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
        >
          <Home /> Home
        </button>
      </div>
    </div>
  );
}
