import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Goal, AppNotification } from '../types';
import { StorageService } from '../services/storageService';
import { signInWithGoogle, signOutUser, getAuth } from '../services/firebase';

interface AppContextType {
  user: User | null;
  goals: Goal[];
  notifications: AppNotification[];
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  updateUser: (updates: Partial<User>) => void;
  refreshData: () => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    // We still sync with local storage for offline capabilities/caching
    const savedGoals = StorageService.getGoals();
    const savedNotifications = StorageService.getNotifications();
    setGoals(savedGoals);
    setNotifications(savedNotifications);
  };

  const mapToAppUser = (firebaseUser: any): User => {
    const storedUser = StorageService.getUser();
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      photoUrl: firebaseUser.photoURL || 'https://i.pravatar.cc/150?u=user',
      streak: storedUser ? storedUser.streak : 1, // Preserve streak if exists
      lastLoginDate: new Date().toISOString(),
      preferences: storedUser ? storedUser.preferences : {
        currency: 'USD',
        notificationsEnabled: false,
        notificationTime: "20:00",
        notifyMilestones: true,
        notifyStreak: true
      }
    };
  };

  // Auth State Listener (For Real Firebase Auth)
  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          const appUser = mapToAppUser(firebaseUser);
          StorageService.saveUser(appUser);
          setUser(appUser);
          refreshData();
        } else {
          // Only clear user if we are not explicitly in a "mock session" handled by login
          // But to be safe, standard auth flow usually dictates checking storage or auth state
          // For mixed mode, we let login() handle the initial set for mock users
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Fallback
      refreshData();
      setIsLoading(false);
    }
  }, []);

  // Check Local Storage on mount (Persistence for Mock Users)
  useEffect(() => {
    const storedUser = StorageService.getUser();
    if (storedUser && !user) {
      setUser(storedUser);
      setIsLoading(false);
    }
  }, []);

  // Daily Notification Scheduler
  useEffect(() => {
    const checkDailyNotification = () => {
      const currentUser = StorageService.getUser();
      if (!currentUser || !currentUser.preferences.notificationsEnabled) return;

      const now = new Date();
      const lastDate = currentUser.preferences.lastNotificationDate;
      const todayStr = now.toISOString().split('T')[0];

      // Parse user preferred time (default 20:00)
      const timeStr = currentUser.preferences.notificationTime || "20:00";
      const [prefHour, prefMinute] = timeStr.split(':').map(Number);

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = prefHour * 60 + prefMinute;

      // Check if it's past the preferred time and we haven't notified today
      if (currentMinutes >= targetMinutes && lastDate !== todayStr) {
        
        // 1. Send Browser Notification
        if (Notification.permission === 'granted') {
          new Notification("Time to Save!", {
            body: `It's ${timeStr}. Update your savings goals for today!`,
            icon: "/icon.png" // Assumed path
          });
        }

        // 2. Add In-App Notification
        const newNotif: AppNotification = {
          id: Date.now().toString(),
          title: "Daily Reminder",
          message: "Don't forget to track your daily savings progress!",
          date: new Date().toISOString(),
          read: false,
          type: 'info'
        };
        StorageService.addNotification(newNotif);
        setNotifications(prev => [newNotif, ...prev]);

        // 3. Update User Last Notified Date
        StorageService.updateUser({
          preferences: {
            ...currentUser.preferences,
            lastNotificationDate: todayStr
          }
        });
        refreshData();
      }
    };

    // Check every minute
    const interval = window.setInterval(checkDailyNotification, 60000);
    checkDailyNotification();

    return () => clearInterval(interval);
  }, []);

  const login = async () => {
    try {
      const authResult = await signInWithGoogle();
      
      // Handle Manual/Mock User State
      if (authResult) {
        const appUser = mapToAppUser(authResult);
        setUser(appUser);
        StorageService.saveUser(appUser);
        refreshData();
      }
    } catch (error: any) {
      console.error("Login failed", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = () => {
    signOutUser();
    StorageService.clear();
    setUser(null);
    setGoals([]);
    setNotifications([]);
  };

  const addGoal = (goal: Goal) => {
    StorageService.addGoal(goal);
    refreshData();
  };

  const updateGoal = (goal: Goal) => {
    StorageService.updateGoal(goal);
    refreshData();
  };

  const deleteGoal = (id: string) => {
    StorageService.deleteGoal(id);
    refreshData();
  };

  const updateUser = (updates: Partial<User>) => {
    StorageService.updateUser(updates);
    refreshData();
    // Also update local state to reflect immediately
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const markNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      user, goals, notifications, isLoading, 
      login, logout, 
      addGoal, updateGoal, deleteGoal, updateUser,
      refreshData, markNotificationsRead 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};