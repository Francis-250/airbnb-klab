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
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "md:ml-17.5" : "md:ml-64"
        }`}
      >
        <Header setIsOpen={setIsOpen} user={user} />
        <main className="container mx-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
