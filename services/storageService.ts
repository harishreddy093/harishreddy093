import { User, Goal, AppNotification } from "../types";

const KEYS = {
  USER: 'savepath_user',
  GOALS: 'savepath_goals',
  NOTIFICATIONS: 'savepath_notifications',
};

export const StorageService = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  updateUser: (updates: Partial<User>): User | null => {
    const user = StorageService.getUser();
    if (!user) return null;
    const updatedUser = { ...user, ...updates };
    StorageService.saveUser(updatedUser);
    return updatedUser;
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },

  saveGoals: (goals: Goal[]): void => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  addGoal: (goal: Goal): void => {
    const goals = StorageService.getGoals();
    goals.push(goal);
    StorageService.saveGoals(goals);
  },

  updateGoal: (updatedGoal: Goal): void => {
    const goals = StorageService.getGoals();
    const index = goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      StorageService.saveGoals(goals);
    }
  },

  deleteGoal: (id: string): void => {
    const goals = StorageService.getGoals();
    const filtered = goals.filter(g => g.id !== id);
    StorageService.saveGoals(filtered);
  },

  getNotifications: (): AppNotification[] => {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveNotifications: (notifications: AppNotification[]): void => {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  addNotification: (notification: AppNotification): void => {
    const notifications = StorageService.getNotifications();
    notifications.unshift(notification); // Add to top
    // Limit to 50
    if (notifications.length > 50) notifications.pop();
    StorageService.saveNotifications(notifications);
  },

  markAllNotificationsRead: (): void => {
    const notifications = StorageService.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    StorageService.saveNotifications(updated);
  },
  
  clear: () => {
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem(KEYS.GOALS);
      localStorage.removeItem(KEYS.NOTIFICATIONS);
  }
};