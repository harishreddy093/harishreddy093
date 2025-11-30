import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, GlassCard } from '../components/UI';
import { getInsightMessage } from '../services/geminiService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const Insights = () => {
  const { goals } = useApp();
  const [insight, setInsight] = useState("Analyzing your patterns...");

  useEffect(() => {
    if(goals.length > 0) {
      getInsightMessage(goals).then(setInsight);
    }
  }, [goals]);

  // Data Prep
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalCarbon = goals.reduce((acc, g) => acc + g.carbonFootprintKg, 0);

  const categoryData = goals.reduce((acc: any[], goal) => {
    const existing = acc.find(i => i.name === goal.category);
    if(existing) existing.value += 1;
    else acc.push({ name: goal.category, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <PageHeader title="Insights" subtitle="Overview of your financial health" />

      <GlassCard className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
         <p className="text-sm font-medium text-primary mb-1">AI Insight</p>
         <p className="italic text-gray-300">"{insight}"</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <p className="text-xs text-gray-400 uppercase">Savings Rate</p>
          <p className="text-2xl font-bold mt-1">
            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-gray-400 uppercase">Est. Footprint</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{totalCarbon} <span className="text-sm text-gray-500">kg</span></p>
        </GlassCard>
      </div>

      <GlassCard className="h-72">
        <h3 className="font-semibold mb-4">Goals by Category</h3>
        {goals.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
        )}
      </GlassCard>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
         {categoryData.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs bg-white/5 px-2 py-1 rounded">
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
               {entry.name}
            </div>
         ))}
      </div>
    </div>
  );
};
