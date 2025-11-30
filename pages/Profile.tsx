import React from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, GlassCard, NeonButton } from '../components/UI';
import { LogOut, Moon, Bell, Shield, Wallet, ChevronRight, Clock, Award, Flame } from 'lucide-react';

export const Profile = () => {
  const { user, logout, updateUser } = useApp();

  if (!user) return null;

  const handleNotificationToggle = async () => {
    const currentState = user.preferences?.notificationsEnabled || false;
    
    if (!currentState) {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateUser({
          preferences: {
            ...user.preferences,
            notificationsEnabled: true,
            // Set defaults if missing
            notificationTime: user.preferences.notificationTime || "20:00",
            notifyMilestones: user.preferences.notifyMilestones ?? true,
            notifyStreak: user.preferences.notifyStreak ?? true,
          }
        });
        // Test notification
        new Notification("Notifications Enabled", { body: "You will receive reminders at your scheduled time." });
      } else {
        alert("Please enable notifications in your browser settings first.");
      }
    } else {
      updateUser({
        preferences: {
          ...user.preferences,
          notificationsEnabled: false
        }
      });
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUser({
      preferences: {
        ...user.preferences,
        currency: e.target.value
      }
    });
  };

  const updatePreference = (key: string, value: any) => {
    updateUser({
      preferences: {
        ...user.preferences,
        [key]: value
      }
    });
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <PageHeader title="Profile" />

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-accent mb-4 shadow-lg shadow-primary/20">
          <img src={user.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-background" />
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>
        
        <div className="flex gap-4 mt-6">
           <div className="text-center">
              <p className="font-bold text-xl">{user.streak}</p>
              <p className="text-xs text-gray-500">Streak</p>
           </div>
           <div className="w-px bg-white/10"></div>
           <div className="text-center">
              <p className="font-bold text-xl">PRO</p>
              <p className="text-xs text-gray-500">Status</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* General Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase ml-1 mb-2 tracking-wider">General</h3>
          <div className="space-y-3">
            {/* Currency Selector */}
            <GlassCard className="flex justify-between items-center py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                  <Wallet size={20} />
                </div>
                <span className="font-medium">Currency</span>
              </div>
              <select 
                className="bg-surfaceLight/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                value={user.preferences?.currency || 'USD'}
                onChange={handleCurrencyChange}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </GlassCard>
            
            <GlassCard className="flex justify-between items-center py-3 px-4 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <Moon size={20} />
                </div>
                <span className="font-medium">Appearance</span>
              </div>
              <span className="text-sm text-gray-500">Dark</span>
            </GlassCard>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase ml-1 mb-2 tracking-wider">Notifications</h3>
          <GlassCard className="p-0 overflow-hidden">
            {/* Master Toggle */}
            <div 
              className="flex justify-between items-center p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={handleNotificationToggle}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${user.preferences?.notificationsEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                  <Bell size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Enable Notifications</span>
                  <span className="text-xs text-gray-500">{user.preferences?.notificationsEnabled ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${user.preferences?.notificationsEnabled ? 'bg-primary' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${user.preferences?.notificationsEnabled ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            {/* Detailed Settings (Collapsible) */}
            {user.preferences?.notificationsEnabled && (
              <div className="bg-white/5 animate-in slide-in-from-top-2 duration-200">
                {/* Time Picker */}
                <div className="flex justify-between items-center p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Daily Reminder Time</span>
                  </div>
                  <input 
                    type="time" 
                    value={user.preferences.notificationTime || "20:00"}
                    onChange={(e) => updatePreference('notificationTime', e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Milestone Toggle */}
                <div 
                  className="flex justify-between items-center p-4 border-b border-white/5 cursor-pointer hover:bg-white/5"
                  onClick={() => updatePreference('notifyMilestones', !user.preferences.notifyMilestones)}
                >
                  <div className="flex items-center gap-3">
                    <Award size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Goal Milestones</span>
                  </div>
                   <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${user.preferences.notifyMilestones ? 'bg-green-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${user.preferences.notifyMilestones ? 'left-4.5' : 'left-0.5'}`} style={{left: user.preferences.notifyMilestones ? '1.125rem' : '0.125rem'}} />
                  </div>
                </div>

                {/* Streak Toggle */}
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5"
                   onClick={() => updatePreference('notifyStreak', !user.preferences.notifyStreak)}
                >
                  <div className="flex items-center gap-3">
                    <Flame size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">Streak Warnings</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${user.preferences.notifyStreak ? 'bg-orange-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300`} style={{left: user.preferences.notifyStreak ? '1.125rem' : '0.125rem'}} />
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Other Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase ml-1 mb-2 tracking-wider">Other</h3>
          <GlassCard className="flex justify-between items-center py-3 px-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                <Shield size={20} />
              </div>
              <span className="font-medium">Privacy & Security</span>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </GlassCard>
        </div>
      </div>

      <NeonButton variant="danger" className="mt-8 w-full" onClick={logout} icon={LogOut}>
        Log Out
      </NeonButton>
      
      <p className="text-center text-xs text-gray-600 mt-8 mb-4">Prizio v1.2.0</p>
    </div>
  );
};