import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  ChevronRight
} from "lucide-react";

const UserSidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Removed Dashboard and Profile from main navigation items
  const navItems = [
    { name: "Events", to: "/events", icon: Calendar },
    { name: "Leaderboard", to: "/leaderboard", icon: BarChart3 },
    { name: "Certificates", to: "/certificates", icon: FileText },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        } h-screen`}
      >
        {/* Sidebar header with logo and user info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Plogging Ethiopia Logo"
                className={`h-12 w-auto ${isCollapsed ? 'hidden' : ''}`}
              />
            </Link>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Desktop collapse button */}
            <button 
              onClick={toggleCollapse}
              className="hidden lg:block p-1 rounded-md hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          
          {!isCollapsed && isAuthenticated && user && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
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
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
            
            {/* Add Home link */}
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>Home</span>}
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
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Login</span>}
            </Link>
          )}
        </div>
      </div>
      
      {/* Collapse overlay for desktop */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="hidden lg:block fixed left-0 top-1/2 z-40 p-1 rounded-r-md bg-green-600 text-white shadow-lg"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default UserSidebar;