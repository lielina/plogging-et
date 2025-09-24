import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Users, Eye, EyeOff, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [isVolunteerLogin, setIsVolunteerLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been successfully logged in.",
      });
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password, true);
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Administrator!",
      });
      
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-800">Plogging Ethiopia</span>
            </div>
            
            <nav>
              <div className="hidden md:flex items-center space-x-8">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `font-medium transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-600'}`
                  }
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/events" 
                  className={({ isActive }) => 
                    `font-medium transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-600'}`
                  }
                >
                  Events
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `font-medium transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-600'}`
                  }
                >
                  About
                </NavLink>
                <NavLink 
                  to="/membership" 
                  className={({ isActive }) => 
                    `font-medium transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-600'}`
                  }
                >
                  Membership
                </NavLink>
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) => 
                    `font-medium transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-600'}`
                  }
                >
                  Contact
                </NavLink>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-green-600 font-medium hidden md:block">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Register
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Login Content */}
      <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
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
                <form onSubmit={handleVolunteerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
                
                <div className="text-center text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="text-green-600 hover:text-green-800"
                  >
                    Forgot Password?
                  </Link>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-green-600 font-medium hover:text-green-800"
                  >
                    Register
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
                
                <div className="text-center text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="text-green-600 hover:text-green-800"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}