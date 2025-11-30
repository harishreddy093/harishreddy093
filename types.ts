export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  streak: number;
  lastLoginDate: string; // ISO date
  preferences: {
    currency: string;
    notificationsEnabled: boolean;
    notificationTime: string; // "HH:MM" 24-hour format
    notifyMilestones: boolean;
    notifyStreak: boolean;
    lastNotificationDate?: string;
  };
}

export interface Goal {
  id: string;
  userId: string;
  productName: string;
  productUrl: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  category: string;
  carbonFootprintKg: number; // Estimated CO2
  startDate: string; // ISO date
  targetDate: string; // ISO date
  frequency: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'paused';
  logs: SavingsLog[];
}

export interface SavingsLog {
  id: string;
  amount: number;
  date: string; // ISO date
}

export interface ProductAnalysisResult {
  productName: string;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
  carbonFootprintKg: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  user: User | null;
  goals: Goal[];
  theme: ThemeMode;
}