import { Outlet, useLocation, useNavigate, Link, NavLink } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Menu, X, Home, Calendar, FileText, Award, User, LogOut, LogIn, Users, Image, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import UserSidebar from '@/components/ui/user-sidebar'; // Import UserSidebar instead
import { useSidebar } from '@/contexts/SidebarContext'; // Import useSidebar hook

import React, { useState } from 'react';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isCollapsed } = useSidebar(); // Get sidebar collapse state
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Show sidebar on dashboard pages when authenticated
  // Note: '/events' is intentionally excluded so Events remains a public page
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/profile') || 
                          location.pathname.startsWith('/leaderboard') ||
                          location.pathname.startsWith('/certificates') ||
                          location.pathname.startsWith('/survey') ||
                          location.pathname === '/events';

  // Check if user is admin
  const isAdmin = user && 'role' in user;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Simulate API call - in a real implementation, this would connect to a newsletter service
      // Note: Since the backend endpoints may not exist yet, we'll keep the simulation
      // await apiClient.subscribeToNewsletter(email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success!",
        description: "You have been subscribed to our newsletter.",
      });
      
      // Reset form
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Use UserSidebar component for proper vertical sidebar */}
      {isAuthenticated && isDashboardRoute && <UserSidebar />}
      
      {/* Main content area - dynamically adjust margin based on sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isAuthenticated && isDashboardRoute 
          ? isCollapsed 
            ? 'md:ml-20'  // Collapsed sidebar width
            : 'md:ml-64'  // Expanded sidebar width
          : ''
      }`}>
        {/* Header - only show on non-dashboard pages or for unauthenticated users */}
        {(!isAuthenticated || !isDashboardRoute) && (
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-2 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-2">
                    <img
                      src="/logo.png"
                      alt="Plogging Ethiopia Logo"
                      className="h-20 sm:h-24 lg:h-28 w-auto ml-2 sm:ml-5"
                    />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12 mr-6 lg:mr-10">
                  {[
                    { name: "Home", to: "/" },
                    { name: "About", to: "/#aboutus" },
                    { name: "Membership", to: "/membership" },
                    { name: "Gallery", to: "/gallery" },
                    { name: "Blog", to: "/blog" },
                    { name: "Event", to: "/events" },
                    { name: "Contact", to: "/contact" },
                  ].map((link) => {
                    const isHomeActive =
                      location.pathname === "/" && location.hash === "";
                    const isAboutActive = location.hash === "#aboutus";
                    let isActive = false;
                    if (link.to === "/") {
                      isActive = isHomeActive;
                    } else if (link.to === "/#aboutus") {
                      isActive = isAboutActive;
                    } else {
                      isActive = location.pathname === link.to;
                    }

                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={`relative pb-1 font-normal text-lg xl:text-xl transition-colors ${
                          isActive
                            ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                            : "text-black hover:text-green-600"
                        }`}
                      >
                        {link.name}
                      </NavLink>
                    );
                  })}
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                      {/* Account dropdown for authenticated users */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            {user?.profile_image ? (
                              <img 
                                src={user.profile_image}
                                alt="Profile" 
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  // If the image fails to load, show the initials fallback
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const initials = parent.querySelector('.initials-fallback') as HTMLElement;
                                    if (initials) initials.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <span className="text-white font-bold text-sm initials-fallback" style={{ display: user?.profile_image ? 'none' : 'flex' }}>
                              {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </span>
                          </div>
                          <span className="text-lg xl:text-xl text-black hover:text-green-600">
                            Account
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to="/dashboard" className="w-full">
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/profile" className="w-full">
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link to="/leaderboard" className="w-full">
                                Leaderboard
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={logout}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `relative pb-1 font-normal text-lg xl:text-xl transition-colors ${
                          isActive
                            ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                            : "text-black hover:text-green-600"
                          }`
                      }
                    >
                      Login
                    </NavLink>
                  )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>

              {/* Mobile Navigation */}
              {isMenuOpen && (
                <nav className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
                  <div className="flex flex-col space-y-3">
                    {[
                      { name: "Home", to: "/" },
                      { name: "About", to: "/#aboutus" },
                      { name: "Membership", to: "/membership" },
                      { name: "Gallery", to: "/gallery" },
                      { name: "Blog", to: "/blog" },
                      { name: "Event", to: "/events" },
                      { name: "Contact", to: "/contact" },
                    ].map((link) => {
                      const isHomeActive =
                        location.pathname === "/" && location.hash === "";
                      const isAboutActive = location.hash === "#aboutus";
                      let isActive = false;
                      if (link.to === "/") {
                        isActive = isHomeActive;
                      } else if (link.to === "/#aboutus") {
                        isActive = isAboutActive;
                      } else {
                        isActive = location.pathname === link.to;
                      }
                      return (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMenuOpen(false)}
                          className={
                            isActive
                              ? "text-green-600 font-medium py-2 px-3 bg-green-50 rounded-md"
                              : "text-gray-700 hover:text-green-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                          }
                        >
                          {link.name}
                        </NavLink>
                      );
                    })}
                    {isAuthenticated ? (
                      <div className="pt-2 border-t border-gray-200">
                        <NavLink
                          to="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) =>
                            isActive
                              ? "text-green-600 font-medium py-2 px-3 bg-green-50 rounded-md block"
                              : "text-gray-700 hover:text-green-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors block"
                          }
                        >
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) =>
                            isActive
                              ? "text-green-600 font-medium py-2 px-3 bg-green-50 rounded-md block"
                              : "text-gray-700 hover:text-green-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors block"
                          }
                        >
                          Profile
                        </NavLink>
                        {isAdmin && (
                          <NavLink
                            to="/leaderboard"
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                              isActive
                                ? "text-green-600 font-medium py-2 px-3 bg-green-50 rounded-md block"
                                : "text-gray-700 hover:text-green-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors block"
                            }
                          >
                            Leaderboard
                          </NavLink>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="text-gray-700 hover:text-red-600 text-left py-2 px-3 rounded-md hover:bg-red-50 transition-colors w-full text-left"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <NavLink
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          isActive
                            ? "text-green-600 font-medium py-2 px-3 bg-green-50 rounded-md"
                            : "text-gray-700 hover:text-green-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                        }
                      >
                        Login
                      </NavLink>
                    )}
                  </div>
                </nav>
              )}
            </div>
          </header>
        )}
        
        {/* Main content */}
        <main className={`flex-1 ${isAuthenticated && isDashboardRoute ? 'pt-0' : ''}`}>
          <Outlet />
        </main>
        
        {/* Footer - only show on non-dashboard pages or for unauthenticated users */}
        {(!isAuthenticated || !isDashboardRoute) && (
          <footer className="w-full flex flex-col items-center bg-green-500/10">
            <section className="flex justify-between w-[80%] py-10 md:flex-row flex-col gap-10">
              {/* Useful Links */}
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-green-500 font-semibold">Useful Links</h1>
                <a className="hover:text-green-500" href="/">
                  Home
                </a>
                <a className="hover:text-green-500" href="/gallery">
                  Gallery
                </a>
                <a className="hover:text-green-500" href="/blog">
                  Blog
                </a>
                <a className="hover:text-green-500" href="/contact">
                  Contact Us
                </a>
              </div>

              {/* Subscribe */}
              <div className="flex flex-col md:items-center gap-3">
                <h1 className="uppercase font-semibold text-green-700">
                  Subscribe
                </h1>
                <p className="text-sm text-gray-700 text-center md:text-left">
                  Sign up with your email address to receive news and updates.
                </p>
                <form onSubmit={handleSubscribe} className="flex w-full max-w-md">
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded-l-md border-2 border-green-500 w-full border-r-0 focus:outline-none text-gray-800"
                    placeholder="Your email address"
                    disabled={isSubscribing}
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 border-2 border-green-500 text-white font-bold py-2 px-4 rounded-r-md disabled:opacity-50"
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>

              {/* Social Media */}
              <div className="flex flex-col items-start gap-3">
                <h1 className="text-green-600 font-semibold">Social Media</h1>
                <div className="flex gap-6 items-center">
                  <a href="https://www.facebook.com/profile.php?id=100078976189435&mibextid=ZbWKwL">
                    <img src="/facebook.png" alt="icon" />
                  </a>
                  <a href="https://www.instagram.com/ploggingethiopia?igsh=MXRua2kzcXdsZnZraA==">
                    <img src="/instagram.png" alt="icon" />
                  </a>
                  <a href="https://wa.me/251911647424">
                    <img src="/whatsapp.png" alt="icon" />
                  </a>
                  <a href="https://t.me/plogging_ethiopia">
                    <img src="/telegram.png" alt="icon" />
                  </a>
                  <a href="https://www.youtube.com/@plogging-ethiopia6643">
                    <img src="/youtube.png" alt="icon" />
                  </a>
                </div>
              </div>
            </section>

            {/* Footer Bottom */}
            <div className="w-full flex py-2 text-white items-center justify-around bg-green-500/80 text-sm">
              <p>&copy; 2024 Plogging-Ethiopia, All rights reserved.</p>
              <p>
                Powered by{" "}
                <a
                  href="https://kasmasolution.com"
                  className="hover:text-white/70 cursor-pointer"
                >
                  Pixel Addis Solutions
                </a>
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;