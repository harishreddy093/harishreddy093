import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/UI';
import { ArrowRight, Target, Leaf, TrendingUp } from 'lucide-react';

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Target,
      title: "Set Smart Goals",
      desc: "Paste any product link. We'll track the price, extract details, and build a custom savings plan for you.",
      color: "text-blue-400"
    },
    {
      icon: Leaf,
      title: "Track Your Impact",
      desc: "See the carbon footprint of your purchases. Make conscious decisions and save the planet while you save money.",
      color: "text-green-400"
    },
    {
      icon: TrendingUp,
      title: "Build Streaks",
      desc: "Consistency is key. Save daily to keep your flame lit and unlock savings milestones.",
      color: "text-orange-400"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/login');
    }
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        <div className="mb-12 relative">
          <div className={`w-32 h-32 rounded-3xl bg-surfaceLight/50 border border-white/10 flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 transform ${step % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
            <CurrentIcon size={64} className={`${steps[step].color} transition-all duration-500`} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 transition-all duration-300 min-h-[80px]">
          {steps[step].title}
        </h1>
        
        <p className="text-gray-400 text-lg leading-relaxed mb-12 min-h-[100px]">
          {steps[step].desc}
        </p>

        <div className="flex gap-2 mb-12">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
          ))}
        </div>

        <NeonButton fullWidth onClick={handleNext} className="group">
          {step === steps.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </NeonButton>

        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-gray-500 font-medium hover:text-white transition-colors">
          Skip Intro
        </button>
      </div>
    </div>
  );
};
