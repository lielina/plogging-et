import { useState } from "react";
import { useNavigate, Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Users, Menu } from "lucide-react";

export default function Login() {
  const [isVolunteerLogin, setIsVolunteerLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { login, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password, !isVolunteerLogin);
      // Redirect based on user type
      if (!isVolunteerLogin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Plogging Ethiopia Logo"
                  className="h-28 w-auto ml-5"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12 mr-10">
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
                    className={`relative pb-1 font-normal text-xl transition-colors ${
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
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `relative pb-1 font-normal text-xl transition-colors ${
                        isActive
                          ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                          : "text-black hover:text-green-600"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `relative pb-1 font-normal text-xl transition-colors ${
                        isActive
                          ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                          : "text-black hover:text-green-600"
                      }`
                    }
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={logout}
                    className="relative pb-1 font-normal text-xl transition-colors text-black hover:text-green-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `relative pb-1 font-normal text-xl transition-colors ${
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
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
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
                      className={
                        isActive
                          ? "text-green-600 font-medium"
                          : "text-gray-700 hover:text-green-600"
                      }
                    >
                      {link.name}
                    </NavLink>
                  );
                })}
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        isActive
                          ? "text-green-600 font-medium"
                          : "text-gray-700 hover:text-green-600"
                      }
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        isActive
                          ? "text-green-600 font-medium"
                          : "text-gray-700 hover:text-green-600"
                      }
                    >
                      Profile
                    </NavLink>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-green-600 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? "text-green-600 font-medium"
                        : "text-gray-700 hover:text-green-600"
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

      {/* Login Content */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Plogging Ethiopia
            </CardTitle>
            <CardDescription>
              Environmental Care + Community Wellness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={isVolunteerLogin ? "volunteer" : "admin"}
              onValueChange={(value) =>
                setIsVolunteerLogin(value === "volunteer")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="volunteer"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Volunteer
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="volunteer" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-green-600 hover:underline"
                    >
                      Register here
                    </Link>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Username</Label>
                    <Input
                      id="admin-email"
                      type="text"
                      placeholder="Enter your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Admin Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
