import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, GlassCard, NeonButton } from '../components/UI';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications = () => {
  const { notifications, markNotificationsRead } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    markNotificationsRead();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
      default: return <Info size={20} className="text-primary" />;
    }
  };

  return (
    <div className="min-h-screen pb-24">
       <div className="flex items-center mb-6">
         <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
         </button>
         <h1 className="text-2xl font-bold">Notifications</h1>
       </div>

       {notifications.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
           <Bell size={48} className="mb-4 text-gray-600" />
           <p className="text-gray-400">No notifications yet.</p>
         </div>
       ) : (
         <div className="space-y-3">
           {notifications.map((notif) => (
             <GlassCard key={notif.id} className={`flex gap-4 p-4 items-start transition-all ${!notif.read ? 'bg-white/10 border-primary/30' : ''}`}>
               <div className="mt-1 shrink-0 p-2 rounded-full bg-surfaceLight border border-white/5">
                 {getIcon(notif.type)}
               </div>
               <div className="flex-1">
                 <h4 className={`font-semibold text-sm mb-1 ${!notif.read ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h4>
                 <p className="text-gray-400 text-sm leading-relaxed">{notif.message}</p>
                 <p className="text-xs text-gray-600 mt-2">{new Date(notif.date).toLocaleString()}</p>
               </div>
             </GlassCard>
           ))}
         </div>
       )}
    </div>
  );
};