import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, Volunteer, Admin } from '@/lib/api';

interface AuthContextType {
  user: Volunteer | Admin | null;
  isLoading: boolean;
  login: (identifier: string, password: string, isAdmin?: boolean) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Volunteer | Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Sync token with apiClient
      apiClient.setToken(token);
      
      // Check if we have stored user type to determine which profile to fetch
      const userType = localStorage.getItem('userType');
      
      if (userType === 'admin') {
        // If we know it's an admin, only try admin profile
        apiClient.getAdminProfile()
          .then(response => {
            setUser(response.data);
          })
          .catch((error) => {
            // Only clear token for 401/403 errors
            if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
              apiClient.clearToken();
              setUser(null);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (userType === 'volunteer') {
        // If we know it's a volunteer, only try volunteer profile
        apiClient.getVolunteerProfile()
          .then(response => {
            setUser(response.data);
          })
          .catch((error) => {
            // Only clear token for 401/403 errors
            if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
              apiClient.clearToken();
              setUser(null);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // If we don't know the user type, try to determine it from the token or make an educated guess
        // For now, we'll try volunteer first as it's more common
        apiClient.getVolunteerProfile()
          .then(response => {
            setUser(response.data);
            localStorage.setItem('userType', 'volunteer');
          })
          .catch((error) => {
            // Only clear token for 401/403 errors
            if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
              apiClient.clearToken();
              setUser(null);
            } else {
              // If volunteer profile fails, try admin profile
              apiClient.getAdminProfile()
                .then(response => {
                  setUser(response.data);
                  localStorage.setItem('userType', 'admin');
                })
                .catch((adminError) => {
                  // Only clear token for 401/403 errors
                  if (adminError.message && (adminError.message.includes('401') || adminError.message.includes('403'))) {
                    apiClient.clearToken();
                    setUser(null);
                  }
                });
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string, isAdmin = false) => {
    try {
      setIsLoading(true);
      let response;
      
      if (isAdmin) {
        response = await apiClient.adminLogin(identifier, password);
        localStorage.setItem('userType', 'admin');
      } else {
        response = await apiClient.volunteerLogin(identifier, password);
        localStorage.setItem('userType', 'volunteer');
      }

      if (response.data.volunteer) {
        setUser(response.data.volunteer);
      } else if (response.data.admin) {
        setUser(response.data.admin);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.volunteerRegister(data);
      
      if (response.data.volunteer) {
        setUser(response.data.volunteer);
        localStorage.setItem('userType', 'volunteer');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('userType');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user ? 'admin_id' in user : false;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};