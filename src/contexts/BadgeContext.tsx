import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, VolunteerBadge } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface BadgeContextType {
  badge: VolunteerBadge | null;
  loading: boolean;
  error: string | null;
  refreshBadge: () => Promise<void>;
  checkForNewBadge: (previousBadge: VolunteerBadge | null) => Promise<VolunteerBadge | null>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadge = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadge must be used within a BadgeProvider');
  }
  return context;
};

interface BadgeProviderProps {
  children: ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const [badge, setBadge] = useState<VolunteerBadge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchBadge = async () => {
    if (!isAuthenticated || !user || !('volunteer_id' in user)) {
      setBadge(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVolunteerBadge(); // object-only API

      setBadge(response.data ?? null);
    } catch (err: any) {
      console.error('Error fetching badge:', err);
      setError(err.message || 'Failed to load badge');
      setBadge(null);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadge = async (previousBadge: VolunteerBadge | null): Promise<VolunteerBadge | null> => {
    try {
      const response = await apiClient.getVolunteerBadge();
      const currentBadge = response.data ?? null;

      if (currentBadge && (!previousBadge || previousBadge.badge_id !== currentBadge.badge_id)) {
        setBadge(currentBadge);
        toast({
          title: "New Badge Earned! 🎉",
          description: `You've earned the "${currentBadge.badge_name}" badge: ${currentBadge.description}`,
        });
        return currentBadge;
      }

      return null;
    } catch (err: any) {
      console.error('Error checking for new badge:', err);
      return null;
    }
  };

  const refreshBadge = async () => {
    await fetchBadge();
  };

  useEffect(() => {
    fetchBadge();
  }, [isAuthenticated, user]);

  const value = {
    badge,
    loading,
    error,
    refreshBadge,
    checkForNewBadge,
  };

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
};
