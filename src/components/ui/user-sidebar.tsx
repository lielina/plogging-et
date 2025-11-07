import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import QRScanner from "@/components/ui/qr-scanner";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  User,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ScanLine,
  Award,
  Camera,
} from "lucide-react";

const UserSidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { openSurvey } = useSurvey();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { toast } = useToast();
  const location = useLocation();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add Dashboard back to main navigation items
  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Events", to: "/events", icon: Calendar },
    { name: "ePlogging", to: "/eplogging/manage", icon: Camera },
    { name: "Leaderboard", to: "/leaderboard", icon: BarChart3 },
    { name: "Certificates", to: "/certificates", icon: FileText },
    { name: "My Badge", to: "/badges", icon: Award },
  ];

  const handleQRScan = async (result: string) => {
    try {
      // Parse the QR code result
      // Expected format: "event:{eventId}"
      let eventId: number | null = null;

      if (result.startsWith("event:")) {
        eventId = parseInt(result.split(":")[1]);
      } else {
        eventId = parseInt(result);
      }

      if (isNaN(eventId) || eventId <= 0) {
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code is not valid for event check-in.",
          variant: "destructive",
        });
        return;
      }

      // Get user's QR code (volunteer ID)
      // Check if user is a volunteer before accessing volunteer_id
      const volunteerId =
        user && "volunteer_id" in user ? user.volunteer_id : null;
      if (!volunteerId) {
        toast({
          title: "Authentication Error",
          description: "Unable to identify volunteer. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Perform check-in
      // The QR code parameter should be "volunteer:{volunteerId}" as expected by the API
      await apiClient.checkIn(eventId, `volunteer:${volunteerId}`);

      toast({
        title: "Check-in Successful",
        description: "You have been successfully checked in to the event!",
      });
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQRScan}
        title="Event Check-in"
        description="Scan the event QR code to check in"
      />

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 p-3 rounded-full bg-gray-600 text-white 
               shadow-lg hover:bg-gray-700 transition-transform duration-300 
               focus:outline-none focus:ring-2 focus:ring-green-400 
               flex items-center justify-center z-50 transform hover:scale-105"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out flex flex-col ${
          isMobile
            ? isMobileMenuOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64"
            : isCollapsed
            ? "w-20"
            : "w-64"
        } h-screen`}
      >
        {/* Sidebar header with logo and user info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2"
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              <img
                src="/logo.png"
                alt="Plogging Ethiopia Logo"
                className={`h-12 w-auto ${
                  isCollapsed && !isMobile ? "hidden" : ""
                }`}
              />
            </Link>
            {/* Desktop collapse button - only show on desktop */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}
            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {(!isCollapsed || isMobile) && isAuthenticated && user && (
            <div className="flex items-center space-x-3">
              {"profile_image" in user && user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    // If the image fails to load, show the initials fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector(
                        ".initials-fallback"
                      ) as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center initials-fallback"
                style={{
                  display:
                    "profile_image" in user && user.profile_image
                      ? "none"
                      : "flex",
                }}
              >
                <span className="text-white font-bold">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-500">Volunteer</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}

            {/* Check-in option */}
            <li>
              <button
                onClick={() => {
                  setIsScannerOpen(true);
                  isMobile && setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ScanLine className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>Check In</span>}
              </button>
            </li>

            {/* Take Survey option */}
            <li>
              <button
                onClick={() => {
                  openSurvey();
                  isMobile && setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
              >
                <Clipboard className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>Take Survey</span>}
              </button>
            </li>

            {/* Profile link moved here for better UX */}
            <li>
              <Link
                to="/profile"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>Profile</span>}
              </Link>
            </li>

            {/* Add Home link */}
            <li>
              <Link
                to="/"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>Home</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                isMobile && setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span>Logout</span>}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span>Login</span>}
            </Link>
          )}
        </div>
      </div>

      {/* Collapse overlay for desktop */}
      {!isMobile && isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="fixed left-0 top-1/2 z-40 p-1 rounded-r-md bg-green-600 text-white shadow-lg"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default UserSidebar;
