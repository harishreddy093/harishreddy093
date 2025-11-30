import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, GlassCard, NeonButton, Input } from '../components/UI';
import { analyzeProductLink } from '../services/geminiService';
import { Loader2, Link as LinkIcon, Calendar, DollarSign, Search, ScanLine, AlertCircle, RefreshCw, Edit3 } from 'lucide-react';
import { Goal } from '../types';

export const AddGoal = () => {
  const { addGoal, user } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [carbon, setCarbon] = useState(0);

  // Calc State
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [calculatedSaving, setCalculatedSaving] = useState(0);

  const getCurrencySymbol = (code: string) => {
    if (code === 'USD') return '$';
    if (code === 'INR') return '₹';
    if (code === 'EUR') return '€';
    if (code === 'GBP') return '£';
    return code;
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeProductLink(url);
      setProductName(result.productName);
      setPrice(result.price);
      setCurrency(result.currency);
      setImageUrl(result.imageUrl || '');
      setCategory(result.category);
      setCarbon(result.carbonFootprintKg);
      setStep(2);
    } catch (e) {
      alert("Could not analyze link automatically. Please enter details manually.");
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time calculation effect
  useEffect(() => {
    if (!price || !targetDate) {
      setCalculatedSaving(0);
      return;
    }
    
    const start = new Date();
    const end = new Date(targetDate);
    // Calc difference in days
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 0) {
      setCalculatedSaving(0);
      return;
    }

    let divisor = diffDays;
    if (frequency === 'weekly') divisor = diffDays / 7;
    if (frequency === 'monthly') divisor = diffDays / 30;

    setCalculatedSaving(Number(price) / Math.max(1, divisor));
  }, [price, targetDate, frequency]);

  const handleSubmit = () => {
    if (!user || !productName || !price || !targetDate) return;

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      userId: user.id,
      productName,
      productUrl: url,
      imageUrl: imageUrl,
      targetAmount: Number(price),
      currentAmount: 0,
      currency: currency,
      category,
      carbonFootprintKg: carbon,
      startDate: new Date().toISOString(),
      targetDate: new Date(targetDate).toISOString(),
      frequency,
      status: 'active',
      logs: []
    };

    addGoal(newGoal);
    navigate('/goals');
  };

  return (
    <div className="pb-24">
      <PageHeader title="New Savings Goal" />

      {step === 1 && (
        <GlassCard className="space-y-8 py-12 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          {isAnalyzing && (
            <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
               <div className="relative mb-8">
                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                 <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                 <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
               </div>
               <p className="text-white font-bold text-lg tracking-wider animate-pulse">ANALYZING LINK...</p>
               <p className="text-primary/70 text-sm mt-2 font-mono">Extracting Price & Emissions</p>
            </div>
          )}

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <LinkIcon size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Paste Product Link</h3>
            <p className="text-gray-400 max-w-xs mx-auto">We'll find the exact real-time price using AI.</p>
          </div>

          <div className="space-y-4 max-w-md mx-auto w-full">
            <Input 
              placeholder="https://..." 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="py-4 text-lg"
            />

            <NeonButton 
              fullWidth 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !url}
              icon={Search}
              className="py-4 text-lg"
            >
              Scan Link
            </NeonButton>
          </div>
          
          <div className="text-center pt-4">
             <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-white transition-colors">
               Enter details manually
             </button>
          </div>
        </GlassCard>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          
          {/* Iconic Product Ticket */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <GlassCard className="relative border-primary/30 overflow-hidden">
              <div className="absolute -top-10 -right-10 p-4 opacity-5 rotate-12 pointer-events-none">
                <DollarSign size={200} />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-surfaceLight overflow-hidden shrink-0 shadow-2xl border border-white/10 relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500"><ScanLine /></div>
                  )}
                  {carbon > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 text-[10px] text-center text-green-400 font-medium">
                      {carbon}kg CO2e
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left w-full min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="inline-flex px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider mb-2 text-primaryGlow border border-white/5">
                      {category || 'ITEM'}
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors">
                      <RefreshCw size={12} /> Rescan
                    </button>
                  </div>
                  
                  <Input 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)} 
                    className="bg-transparent border-none text-xl sm:text-2xl font-bold p-0 focus:ring-0 placeholder-gray-600 mb-2 text-center sm:text-left"
                    placeholder="Product Name"
                  />
                  
                  <div className="flex items-center justify-center sm:justify-start gap-1 relative group/edit">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight shrink-0">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={e => {
                         const val = e.target.value;
                         setPrice(val === '' ? '' : Number(val));
                      }}
                      className="bg-transparent w-full border-none focus:ring-0 p-0 text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 outline-none placeholder-gray-800 caret-white"
                      placeholder="0.00"
                    />
                    <Edit3 size={20} className="text-gray-600 opacity-0 group-hover/edit:opacity-100 transition-opacity absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tap price to edit</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <Input 
                  label="Target Date" 
                  type="date" 
                  value={targetDate} 
                  onChange={e => setTargetDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
               />
               <div>
                 <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Frequency</label>
                 <select 
                    className="w-full bg-surfaceLight/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                 >
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="monthly">Monthly</option>
                 </select>
               </div>
             </div>

            {calculatedSaving > 0 ? (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <div>
                  <p className="text-sm text-blue-200">Savings Plan</p>
                  <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                    {getCurrencySymbol(currency)}{calculatedSaving.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-blue-300">/{frequency}</span>
                  </p>
                </div>
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                  {getCurrencySymbol(currency) === '$' ? <DollarSign size={20} /> : <span className="text-lg">{getCurrencySymbol(currency)}</span>}
                </div>
              </div>
            ) : (
               <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-3 rounded-lg">
                 <AlertCircle size={16} />
                 <span>Set a target date to see your saving plan.</span>
               </div>
            )}

            <div className="flex gap-3 pt-2">
              <NeonButton variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</NeonButton>
              <NeonButton onClick={handleSubmit} className="flex-1" disabled={!calculatedSaving}>Start Goal</NeonButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
