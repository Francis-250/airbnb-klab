import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] dark:bg-[#111]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "md:ml-16" : "md:ml-60"
        }`}
      >
        {user && <Header setIsOpen={setIsOpen} user={user} />}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
