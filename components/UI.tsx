import React from 'react';
import { LucideIcon } from 'lucide-react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-panel rounded-2xl p-5 border border-white/5 shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/5 active:scale-95' : ''} ${className}`}
  >
    {children}
  </div>
);

export const NeonButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  icon?: LucideIcon;
}> = ({ children, onClick, variant = 'primary', className = '', disabled, type = "button", fullWidth, icon: Icon }) => {
  const baseStyle = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3.5";
  
  const variants = {
    primary: "bg-primary text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-primary/50",
    secondary: "bg-surfaceLight text-white border border-white/10 hover:bg-white/10",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
    <input 
      className={`bg-surfaceLight/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all ${className}`}
      {...props}
    />
  </div>
);

export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <div className={`h-2 w-full bg-surfaceLight rounded-full overflow-hidden ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-primary to-primaryGlow transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string; rightAction?: React.ReactNode }> = ({ title, subtitle, rightAction }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {rightAction && <div>{rightAction}</div>}
  </div>
);
