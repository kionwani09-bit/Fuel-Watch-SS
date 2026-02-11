
import React from 'react';
import { Station, AvailabilityStatus } from '../types';

interface StationCardProps {
  station: Station;
  onUpdate: (station: Station) => void;
  isAdmin: boolean;
}

const StationCard: React.FC<StationCardProps> = ({ station, onUpdate, isAdmin }) => {
  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case AvailabilityStatus.LOW_STOCK: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case AvailabilityStatus.OUT_OF_STOCK: return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-amber-900/10 transition-all overflow-hidden group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{station.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{station.location.address}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getStatusColor(station.availability)} uppercase tracking-wider transition-colors`}>
            {station.availability.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold mb-1 tracking-tight">Petrol</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">SSP {station.petrolPrice.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold mb-1 tracking-tight">Diesel</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">SSP {station.dieselPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Updated {getTimeAgo(station.lastUpdated)}</span>
          {isAdmin && (
            <button 
              onClick={() => onUpdate(station)}
              className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-black hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20 active:scale-95">
              Manage Prices
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationCard;
