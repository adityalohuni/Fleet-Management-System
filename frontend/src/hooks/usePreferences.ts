import { useEffect, useState } from 'react';

export interface UserPreferences {
  distance_unit: string;
  currency: string;
  date_format: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  distance_unit: 'Miles',
  currency: 'USD ($)',
  date_format: 'MM/DD/YYYY',
};

/**
 * Hook to access user preferences from localStorage
 * Preferences are synced from backend settings
 */
export const usePreferences = (): UserPreferences => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userPreferences' && e.newValue) {
        try {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(e.newValue) });
        } catch (error) {
          console.error('Failed to parse preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return preferences;
};

/**
 * Format a number as currency based on user preferences
 */
export const formatCurrency = (amount: number, preferences: UserPreferences): string => {
  const currencySymbol = preferences.currency.match(/\((.+)\)/)?.[1] || '$';
  return `${currencySymbol}${amount.toFixed(2)}`;
};

/**
 * Format distance based on user preferences
 */
export const formatDistance = (distance: number, preferences: UserPreferences): string => {
  return `${distance.toFixed(2)} ${preferences.distance_unit.toLowerCase()}`;
};

/**
 * Format date based on user preferences
 */
export const formatDate = (date: Date | string, preferences: UserPreferences): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  switch (preferences.date_format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};
