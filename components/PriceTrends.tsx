
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { MOCK_HISTORY, CITIES } from '../constants';
import { Icons } from '../constants';

interface PriceTrendsProps {
  darkMode: boolean;
  trendInsights: string;
}

const PriceTrends: React.FC<PriceTrendsProps> = ({ darkMode, trendInsights }) => {
  // Mock data for regional comparison
  const regionalData = [
    { city: 'Juba', petrol: 1435, diesel: 1515 },
    { city: 'Wau', petrol: 1600, diesel: 1680 },
    { city: 'Malakal', petrol: 1750, diesel: 1820 },
    { city: 'Bor', petrol: 1550, diesel: 1610 },
    { city: 'Rumbek', petrol: 1580, diesel: 1640 },
  ];

  const gridColor = darkMode ? '#1e293b' : '#e2e8f0';
  const textColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Fuel Index</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Aggregated real-time pricing intelligence across South Sudan</p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">7 Days</button>
          <button className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">30 Days</button>
          <button className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">6 Months</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Avg. Petrol Price</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">SSP 1,520</h3>
            <span className="text-xs font-bold text-emerald-500">↑ 2.4%</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium italic">Highest in Malakal region</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Avg. Diesel Price</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">SSP 1,595</h3>
            <span className="text-xs font-bold text-amber-500">~ Stable</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium italic">Steady supply from Mombasa route</p>
        </div>
        <div className="bg-slate-900 dark:bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-amber-900/20 text-white transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-amber-900/50 uppercase tracking-[0.2em] mb-2">Market Stability</p>
          <h3 className="text-4xl font-black">MODERATE</h3>
          <div className="mt-4 flex items-center space-x-2">
             <div className="h-1.5 w-full bg-slate-800 dark:bg-amber-600 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 dark:bg-white w-[65%]"></div>
             </div>
             <span className="text-[10px] font-black">65%</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price History Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Historical Fluctuations</h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Petrol</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Diesel</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HISTORY}>
                <defs>
                  <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: textColor, fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: textColor, fontSize: 10, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                    borderColor: darkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area type="monotone" dataKey="avgPetrol" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorPetrol)" />
                <Area type="monotone" dataKey="avgDiesel" stroke="#94a3b8" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Price Comparison */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10">Regional Disparity</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="city" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                    borderColor: darkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '16px',
                  }}
                />
                <Bar dataKey="petrol" radius={[0, 8, 8, 0]} barSize={20}>
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.petrol > 1600 ? '#f43f5e' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6">
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Standard Range</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">High Price Threshold</span>
             </div>
          </div>
        </div>
      </div>

      {/* AI Economic Insights */}
      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-[3rem] p-12 border border-amber-100 dark:border-amber-900/50 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20 text-amber-500">
           <Icons.Trend />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-xl shadow-amber-500/30">
              <Icons.Alert />
            </div>
            <h2 className="text-2xl font-black text-amber-900 dark:text-amber-100">AI Economic Outlook</h2>
          </div>
          <p className="text-amber-800 dark:text-amber-200/80 leading-relaxed text-lg font-medium italic">
            "{trendInsights}"
          </p>
          <div className="mt-8 flex items-center space-x-4">
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 border-2 border-amber-50 dark:border-amber-900"></div>
                <div className="w-8 h-8 rounded-full bg-amber-300 dark:bg-amber-700 border-2 border-amber-50 dark:border-amber-900"></div>
                <div className="w-8 h-8 rounded-full bg-amber-400 dark:bg-amber-600 border-2 border-amber-50 dark:border-amber-900"></div>
             </div>
             <span className="text-xs font-black text-amber-900/40 dark:text-amber-100/40 uppercase tracking-widest">Validated by 2.5k data points today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTrends;
