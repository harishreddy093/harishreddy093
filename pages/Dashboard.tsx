import React from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, GlassCard, ProgressBar, NeonButton } from '../components/UI';
import { Flame, Plus, ChevronRight, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, goals, notifications } = useApp();
  const navigate = useNavigate();

  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const activeGoals = goals.filter(g => g.status === 'active');
  const unreadCount = notifications.filter(n => !n.read).length;

  const getCurrencySymbol = (code: string | undefined) => {
    const c = code || user?.preferences?.currency || 'USD';
    if (c === 'USD') return '$';
    if (c === 'INR') return '₹';
    if (c === 'EUR') return '€';
    if (c === 'GBP') return '£';
    if (c === 'JPY') return '¥';
    return c;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm text-gray-400 font-medium">Hello, {user?.name.split(' ')[0]}</h2>
          <h1 className="text-2xl font-bold">Your Progress</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-full bg-surfaceLight hover:bg-white/10 transition-colors border border-white/5"
          >
            <Bell size={20} className="text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full border border-background animate-pulse"></span>
            )}
          </button>
          
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full text-orange-500">
            <Flame size={18} className="fill-orange-500 animate-pulse" />
            <span className="font-bold">{user?.streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="bg-gradient-to-br from-primary/20 to-transparent">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-white">
            {/* Simple sum display, ideally would handle currency conversion */}
            {getCurrencySymbol(user?.preferences?.currency)}
            {totalSaved.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Goals</p>
          <p className="text-2xl font-bold text-white">{activeGoals.length}</p>
        </GlassCard>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h3 className="font-semibold text-lg">Your Goals</h3>
        {goals.length > 0 && (
          <Link to="/add-goal" className="text-primary text-sm font-medium hover:text-primaryGlow">
            + New Goal
          </Link>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-surfaceLight flex items-center justify-center mb-4 text-gray-500">
            <Plus size={32} />
          </div>
          <p className="text-gray-400 mb-6">You don't have any savings goals yet.</p>
          <NeonButton onClick={() => navigate('/add-goal')}>Create First Goal</NeonButton>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map(goal => {
             const progress = (goal.currentAmount / goal.targetAmount) * 100;
             const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
             const symbol = getCurrencySymbol(goal.currency);

             return (
               <GlassCard key={goal.id} className="group relative overflow-hidden" onClick={() => navigate(`/goals/${goal.id}`)}>
                 <div className="flex gap-4">
                   <div className="w-20 h-20 rounded-xl bg-surfaceLight overflow-hidden shrink-0">
                     <img src={goal.imageUrl} alt={goal.productName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="font-semibold truncate pr-2">{goal.productName}</h4>
                       <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">{symbol}{goal.targetAmount}</span>
                     </div>
                     <p className="text-xs text-gray-500 mb-3">{daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'}</p>
                     <ProgressBar progress={progress} className="h-1.5" />
                     <div className="flex justify-between mt-2 text-xs">
                       <span className="text-primary font-medium">{Math.round(progress)}%</span>
                       <span className="text-gray-400">{symbol}{goal.currentAmount.toLocaleString()} saved</span>
                     </div>
                   </div>
                   <div className="flex items-center text-gray-600 group-hover:text-white transition-colors">
                     <ChevronRight size={20} />
                   </div>
                 </div>
               </GlassCard>
             );
          })}
        </div>
      )}
    </div>
  );
};