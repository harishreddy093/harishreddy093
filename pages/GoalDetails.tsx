import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, GlassCard, ProgressBar, NeonButton, Input } from '../components/UI';
import { Trash2, Edit2, Calendar, Leaf, Plus, Save, X, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Goal } from '../types';

export const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goals, updateGoal, deleteGoal } = useApp();
  const [addAmount, setAddAmount] = useState('');
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDate, setEditDate] = useState('');
  const [editFrequency, setEditFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const goal = goals.find(g => g.id === id);

  const getCurrencySymbol = (code: string) => {
    if (code === 'USD') return '$';
    if (code === 'INR') return '₹';
    if (code === 'EUR') return '€';
    if (code === 'GBP') return '£';
    return code || '$';
  };

  // Sync state when entering edit mode
  useEffect(() => {
    if (goal && isEditing) {
      setEditName(goal.productName);
      setEditAmount(goal.targetAmount.toString());
      // Format date for input[type="date"] (YYYY-MM-DD)
      try {
        setEditDate(new Date(goal.targetDate).toISOString().split('T')[0]);
      } catch (e) {
        setEditDate('');
      }
      setEditFrequency(goal.frequency);
    }
  }, [isEditing, goal]);

  if (!goal) return <div className="p-8 text-center">Goal not found</div>;

  const symbol = getCurrencySymbol(goal.currency);
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  // Calculate required savings based on current edit state or actual goal
  const calculateRequiredRate = (targetTotal: number, targetD: string, freq: string) => {
    if (!targetD || !targetTotal) return 0;
    const end = new Date(targetD);
    const start = new Date(); 
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    
    const remaining = Math.max(0, targetTotal - goal.currentAmount);
    
    let divisor = diffDays;
    if (freq === 'weekly') divisor = diffDays / 7;
    if (freq === 'monthly') divisor = diffDays / 30;
    
    return remaining / Math.max(1, divisor);
  };

  const currentRate = calculateRequiredRate(goal.targetAmount, goal.targetDate, goal.frequency);
  const estimatedNewRate = isEditing 
    ? calculateRequiredRate(Number(editAmount), editDate, editFrequency) 
    : currentRate;

  const handleAddSavings = () => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;

    const updatedGoal: Goal = {
      ...goal,
      currentAmount: goal.currentAmount + amount,
      logs: [...goal.logs, { id: Date.now().toString(), amount, date: new Date().toISOString() }]
    };

    if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
      updatedGoal.status = 'completed';
    }

    updateGoal(updatedGoal);
    setAddAmount('');
  };

  const handleSaveEdit = () => {
    if (!editName || !editAmount || !editDate) return;

    const updatedGoal: Goal = {
      ...goal,
      productName: editName,
      targetAmount: Number(editAmount),
      targetDate: new Date(editDate).toISOString(),
      frequency: editFrequency,
    };
    
    // Check if status needs update based on new amount
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
        updatedGoal.status = 'completed';
    } else if (updatedGoal.status === 'completed' && updatedGoal.currentAmount < updatedGoal.targetAmount) {
        updatedGoal.status = 'active';
    }

    updateGoal(updatedGoal);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goal.id);
      navigate('/goals');
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Header Image */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 shadow-2xl">
        <img src={goal.imageUrl} className="w-full h-full object-cover" alt={goal.productName} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white border border-white/10 shadow-lg">{goal.category}</span>
          {goal.status === 'completed' && (
            <span className="text-xs font-bold bg-green-500 text-black px-2 py-1 rounded shadow-lg shadow-green-500/20 flex items-center gap-1">
              <CheckCircle size={12} /> COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Title & Price Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-4">
             {isEditing ? (
               <Input 
                 value={editName} 
                 onChange={(e) => setEditName(e.target.value)} 
                 className="text-xl font-bold bg-white/5 border-white/20 mb-2"
                 placeholder="Product Name"
               />
             ) : (
               <>
                <h1 className="text-2xl font-bold leading-tight truncate">{goal.productName}</h1>
                <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                  <Clock size={14} /> Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
               </>
             )}
          </div>
          <div className="text-right shrink-0">
             <div className="flex flex-col items-end">
               {isEditing ? (
                 <div className="flex items-center justify-end gap-1">
                   <span className="text-gray-400 text-xl font-bold">{symbol}</span>
                   <input 
                     type="number"
                     step="any"
                     value={editAmount} 
                     onChange={(e) => setEditAmount(e.target.value)}
                     className="bg-transparent border-b-2 border-primary/50 text-2xl font-bold text-white text-right focus:outline-none focus:border-primary py-1 w-32 placeholder-gray-600"
                     placeholder="0.00"
                   />
                 </div>
               ) : (
                 <p className="text-2xl font-bold text-primary">{symbol}{goal.currentAmount.toLocaleString()}</p>
               )}
               <p className="text-xs text-gray-500 mt-1">
                 of {isEditing ? 'Target' : `${symbol}${goal.targetAmount.toLocaleString()}`}
               </p>
             </div>
          </div>
        </div>

        {/* Edit Fields Row 2 */}
        {isEditing && (
           <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner">
              <Input 
                label="Target Date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Frequency</label>
                <select 
                    className="w-full bg-surfaceLight/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value as any)}
                 >
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="monthly">Monthly</option>
                 </select>
              </div>
           </div>
        )}
      </div>

      <ProgressBar progress={progress} className="h-3 mb-2" />
      <div className="flex justify-between text-xs text-gray-400 mb-8 font-mono">
        <span>{Math.round(progress)}%</span>
        {estimatedNewRate > 0 ? (
          <span className={`${isEditing ? 'text-primary animate-pulse font-bold' : ''}`}>
             Need {symbol}{estimatedNewRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {isEditing ? editFrequency : goal.frequency}
          </span>
        ) : (
          <span>On Track</span>
        )}
      </div>

      {/* Action Buttons for Edit Mode */}
      {isEditing && (
        <div className="flex gap-3 mb-8">
          <NeonButton onClick={handleSaveEdit} className="flex-1" icon={Save}>Save Changes</NeonButton>
          <NeonButton variant="secondary" onClick={() => setIsEditing(false)} className="flex-1" icon={X}>Cancel</NeonButton>
        </div>
      )}

      {/* Add Savings Card (Hidden in Edit Mode) */}
      {!isEditing && goal.status === 'active' && (
        <GlassCard className="mb-6 border-primary/20 bg-primary/5">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-200">
            <Plus size={16} className="text-primary" /> Add Savings
          </h3>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder={`Amount (${symbol})`} 
              value={addAmount} 
              onChange={e => setAddAmount(e.target.value)} 
              className="bg-background border-primary/20 focus:border-primary"
            />
            <NeonButton onClick={handleAddSavings} disabled={!addAmount}>
              Save
            </NeonButton>
          </div>
        </GlassCard>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="flex flex-col items-center justify-center p-4 text-center">
           <Calendar className="text-blue-400 mb-2" size={24} />
           <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Frequency</span>
           <span className="font-semibold capitalize text-lg">{goal.frequency}</span>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center p-4 text-center">
           <Leaf className="text-green-400 mb-2" size={24} />
           <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Impact</span>
           <span className="font-semibold text-lg">{goal.carbonFootprintKg}kg</span>
        </GlassCard>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          History <span className="text-xs font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{goal.logs.length}</span>
        </h3>
        {goal.logs.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
             <p className="text-gray-500 text-sm">No savings logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...goal.logs].reverse().map(log => (
              <GlassCard key={log.id} className="flex justify-between items-center py-3 px-4 border-white/5 !bg-white/5">
                <span className="text-sm text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                <span className="font-mono text-green-400 font-bold">+{symbol}{log.amount.toLocaleString()}</span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions (Hidden in Edit Mode) */}
      {!isEditing && (
        <div className="mt-12 flex gap-4">
          <NeonButton variant="secondary" fullWidth onClick={() => setIsEditing(true)} icon={Edit2}>Edit</NeonButton>
          <NeonButton variant="danger" fullWidth onClick={handleDelete} icon={Trash2}>Delete</NeonButton>
        </div>
      )}
    </div>
  );
};