import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, VolunteerBadge } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface BadgeContextType {
  badges: VolunteerBadge[];
  loading: boolean;
  error: string | null;
  refreshBadges: () => Promise<void>;
  checkForNewBadges: (previousBadges: VolunteerBadge[]) => Promise<VolunteerBadge[]>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadges = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
};

interface BadgeProviderProps {
  children: ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const [badges, setBadges] = useState<VolunteerBadge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchBadges = async () => {
    if (!isAuthenticated || !user || !('volunteer_id' in user)) {
      setBadges([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVolunteerBadges();
      
      // Ensure we always have an array
      const badgesData = Array.isArray(response.data) ? response.data : [];
      setBadges(badgesData);
    } catch (err: any) {
      console.error('Error fetching badges:', err);
      setError(err.message || 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async (previousBadges: VolunteerBadge[]): Promise<VolunteerBadge[]> => {
    try {
      const response = await apiClient.getVolunteerBadges();
      
      // Ensure we always have an array
      const currentBadges = Array.isArray(response.data) ? response.data : [];
      
      // Find newly earned badges by comparing badge IDs
      const previousBadgeIds = new Set(previousBadges.map(b => b.badge_id));
      const newBadges = currentBadges.filter(badge => !previousBadgeIds.has(badge.badge_id));
      
      // Update state with current badges
      setBadges(currentBadges);
      
      // Show notifications for new badges
      newBadges.forEach(badge => {
        toast({
          title: "New Badge Earned! 🎉",
          description: `You've earned the "${badge.badge_name}" badge: ${badge.description}`,
        });
      });
      
      return newBadges;
    } catch (err: any) {
      console.error('Error checking for new badges:', err);
      return [];
    }
  };

  const refreshBadges = async () => {
    await fetchBadges();
  };

  useEffect(() => {
    fetchBadges();
  }, [isAuthenticated, user]);

  const value = {
    badges,
    loading,
    error,
    refreshBadges,
    checkForNewBadges
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
};