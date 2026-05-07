import { lazy, Suspense } from "react";
import Navbar from "./components/layout/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Spinner from "./components/Spinner";
import DashboardListing from "./pages/host/Listing";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import ThemeToggle from "./components/ThemeToggle";
import Listing from "./pages/Listing";
import Footer from "./components/layout/Footer";
import DashboardBooking from "./pages/host/Booking";
import Register from "./pages/Register";

const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Dashboard = lazy(() => import("./pages/host/Dashboard"));

export default function App() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];

  const isDashboard = location.pathname.startsWith("/dashboard");

  const isNotFound =
    !["/", "/login", "/register", "/all-listings"].includes(
      location.pathname,
    ) &&
    !location.pathname.startsWith("/listings/") &&
    !location.pathname.startsWith("/dashboard");

  const isHiddenNavbar =
    isDashboard || hideNavbarRoutes.includes(location.pathname) || isNotFound;

  return (
    <div className="flex flex-col min-h-screen">
      {!isHiddenNavbar && <Navbar />}
      <main
        className={`grow ${!isHiddenNavbar ? "lg:pt-3 px-4 md:px-[6vw] lg:px-[9vw]" : ""}`}
      >
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/all-listings" element={<Listing />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<DashboardBooking />} />
              <Route path="listings" element={<DashboardListing />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isHiddenNavbar && <Footer />}
      <div className="fixed bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
