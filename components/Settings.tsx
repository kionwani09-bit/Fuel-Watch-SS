import React, { useState } from 'react';
import { User, FuelType } from '../types';
import { CITIES } from '../constants';

interface SettingsProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, darkMode, setDarkMode }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateSubscription = (updates: Partial<User['subscriptions']>) => {
    if (!user) return;
    onUpdateUser({
      ...user,
      subscriptions: { ...user.subscriptions!, ...updates }
    });
  };

  const toggleCity = (city: string) => {
    if (!user?.subscriptions) return;
    const cities = user.subscriptions.cities.includes(city)
      ? user.subscriptions.cities.filter(c => c !== city)
      : [...user.subscriptions.cities, city];
    updateSubscription({ cities });
  };

  const toggleFuelType = (fuelType: FuelType) => {
    if (!user?.subscriptions) return;
    const fuelTypes = user.subscriptions.fuelTypes.includes(fuelType)
      ? user.subscriptions.fuelTypes.filter(f => f !== fuelType)
      : [...user.subscriptions.fuelTypes, fuelType];
    updateSubscription({ fuelTypes });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button
            onClick={() => toggleSection('account')}
            className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Settings</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Update your profile information</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.account ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.account && (
            <div className="px-8 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => onUpdateUser({ ...user, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Notification Settings</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your alert preferences</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.notifications ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.notifications && (
            <div className="px-8 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Significant Changes Only</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Only notify for major price changes</p>
                  </div>
                  <button
                    onClick={() => updateSubscription({ significantChangeOnly: !user.subscriptions?.significantChangeOnly })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      user.subscriptions?.significantChangeOnly ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.subscriptions?.significantChangeOnly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regional Monitoring */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button
            onClick={() => toggleSection('regional')}
            className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Regional Monitoring</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select cities to monitor</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.regional ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.regional && (
            <div className="px-8 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="pt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium italic">
                  Select cities to receive instant SMS and Web notifications when prices shift significantly.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {CITIES.map(city => {
                    const isActive = user.subscriptions?.cities.includes(city);
                    return (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`flex items-center justify-center h-14 rounded-2xl border text-sm font-black transition-all ${
                          isActive
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20'
                            : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500 hover:border-amber-500'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fuel Types */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button
            onClick={() => toggleSection('fuel')}
            className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Fuel Types</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Choose fuel types to track</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.fuel ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.fuel && (
            <div className="px-8 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(FuelType).map(fuelType => {
                    const isActive = user.subscriptions?.fuelTypes.includes(fuelType);
                    return (
                      <button
                        key={fuelType}
                        onClick={() => toggleFuelType(fuelType)}
                        className={`flex items-center justify-center h-14 rounded-2xl border text-sm font-black transition-all ${
                          isActive
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20'
                            : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500 hover:border-amber-500'
                        }`}
                      >
                        {fuelType}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[2.5rem]"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Customize your interface</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.appearance && (
            <div className="px-8 pb-6 border-t border-slate-100 dark:border-slate-800">
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      darkMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
