import React, { PropsWithChildren } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, PlusCircle, PieChart, User, Target } from 'lucide-react';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-white pb-24 sm:pb-0 sm:pl-20">
      <div className="max-w-md mx-auto sm:max-w-4xl p-4 sm:p-8">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: PlusCircle, label: 'Add', path: '/add-goal', isMain: true },
    { icon: PieChart, label: 'Insights', path: '/insights' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:top-0 sm:bottom-auto sm:left-0 sm:right-auto sm:h-screen sm:w-20 sm:p-0">
      {/* Mobile Bar */}
      <div className="glass-panel mx-auto max-w-md rounded-2xl flex justify-between items-center p-2 sm:hidden relative">
        {navItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
              item.isMain 
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] -mt-8 h-16 w-16' 
                : isActive(item.path) ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={item.isMain ? 28 : 22} />
            {!item.isMain && <span className="text-[9px] mt-1 font-medium">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden sm:flex flex-col h-full bg-surface border-r border-white/5 w-20 items-center py-8 gap-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-lg">P</div>
        <div className="flex flex-col gap-4 flex-1">
           {navItems.map((item) => (
            <Link 
              key={item.label} 
              to={item.path}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                item.isMain ? 'bg-primary text-white' : isActive(item.path) ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
              }`}
              title={item.label}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};