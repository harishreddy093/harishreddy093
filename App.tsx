import React, { PropsWithChildren } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddGoal } from './pages/AddGoal';
import { GoalDetails } from './pages/GoalDetails';
import { Insights } from './pages/Insights';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user, isLoading } = useApp();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (!user) return <Navigate to="/onboarding" replace />;

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
      <Route path="/add-goal" element={<ProtectedRoute><AddGoal /></ProtectedRoute>} />
      <Route path="/goals/:id" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}