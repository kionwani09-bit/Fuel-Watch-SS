
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import StationCard from './components/StationCard';
import PriceTrends from './components/PriceTrends';
import Settings from './components/Settings';
import { Station, User, UserRole, AvailabilityStatus, Notification, FuelType, Subscription } from './types';
import { MOCK_STATIONS, MOCK_HISTORY, CITIES, Icons } from './constants';
import { getMarketInsights, getTrendAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
  const [selectedCity, setSelectedCity] = useState('Juba');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('price');
  const [insights, setInsights] = useState<string>('Ready for analysis...');
  const [trendInsights, setTrendInsights] = useState<string>('Ready for analysis...');
  const [showUpdateModal, setShowUpdateModal] = useState<Station | null>(null);
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  
  // Track last request parameters to prevent redundant calls during rapid tab switching
  const lastRequestParams = useRef({ city: '', tab: '', dataHash: '' });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('fuelwatch_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fuelwatch_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fuelwatch_theme', 'light');
    }
  }, [darkMode]);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      title: 'Welcome to FuelWatch',
      message: 'Start tracking fuel prices in your city today!',
      timestamp: new Date().toISOString(),
      type: 'SYSTEM',
      isRead: false
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.BODA);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredStations = useMemo(() => {
    return stations
      .filter(s => s.city === selectedCity)
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'price') return a.petrolPrice - b.petrolPrice;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  }, [stations, selectedCity, searchQuery, sortBy]);

  const cityStations = useMemo(() => {
    return stations.filter(s => s.city === selectedCity);
  }, [stations, selectedCity]);

  const fetchInsights = useCallback(async (force = false) => {
    const dataHash = JSON.stringify(cityStations.map(s => s.petrolPrice));
    
    // Skip if already loading or if params haven't changed (unless forced)
    if (!force && 
        lastRequestParams.current.city === selectedCity && 
        lastRequestParams.current.tab === activeTab &&
        lastRequestParams.current.dataHash === dataHash) {
      return;
    }

    lastRequestParams.current = { city: selectedCity, tab: activeTab, dataHash };

    if (activeTab === 'home') {
      if (cityStations.length === 0) {
        setInsights("No data available for AI analysis in this city.");
        return;
      }
      setInsights("Consulting AI market expert...");
      const res = await getMarketInsights(selectedCity, cityStations);
      setInsights(res);
    } else if (activeTab === 'trends') {
      setTrendInsights("Generating national economic summary...");
      const res = await getTrendAnalysis(MOCK_HISTORY);
      setTrendInsights(res);
    }
  }, [selectedCity, cityStations, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 1000); // Increased debounce to 1s to protect quota
    return () => clearTimeout(timer);
  }, [fetchInsights]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultSub: Subscription = {
      cities: ['Juba'],
      fuelTypes: [FuelType.PETROL, FuelType.DIESEL],
      significantChangeOnly: true
    };

    if (isRegistering) {
      const newUser: User = {
        id: Math.random().toString(),
        name: authName,
        email: authEmail,
        role: authRole,
        subscriptions: defaultSub
      };
      setRegisteredUsers([...registeredUsers, newUser]);
      setUser(newUser);
      setIsRegistering(false);
      setActiveTab('subscriptions'); 
    } else {
      if (authEmail === 'admin@fuelwatch.ss' && authPassword === 'admin123') {
        setUser({ id: 'admin', name: 'System Admin', email: authEmail, role: UserRole.ADMIN });
        setActiveTab('admin');
      } else {
        const found = registeredUsers.find(u => u.email === authEmail);
        if (found) {
          setUser(found);
          setActiveTab('subscriptions');
        } else {
          alert("Invalid credentials. Try registering a new account!");
        }
      }
    }
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const petrol = parseFloat((form.elements.namedItem('petrol') as HTMLInputElement).value);
    const diesel = parseFloat((form.elements.namedItem('diesel') as HTMLInputElement).value);
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as AvailabilityStatus;

    if (showUpdateModal) {
      const updated = stations.map(s => 
        s.id === showUpdateModal.id 
        ? { ...s, petrolPrice: petrol, dieselPrice: diesel, availability: status, lastUpdated: new Date().toISOString() } 
        : s
      );
      setStations(updated);
      setShowUpdateModal(null);
      
      addNotification({
        title: 'Price Update',
        message: `Prices at ${showUpdateModal.name} have been updated.`,
        type: 'PRICE_ALERT',
        stationId: showUpdateModal.id
      });
    }
  };

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const company = (form.elements.namedItem('company') as HTMLInputElement).value;
    const city = (form.elements.namedItem('city') as HTMLSelectElement).value;
    const petrol = parseFloat((form.elements.namedItem('petrol') as HTMLInputElement).value);
    const diesel = parseFloat((form.elements.namedItem('diesel') as HTMLInputElement).value);

    const newSt: Station = {
      id: Math.random().toString(),
      name,
      company,
      city,
      location: { lat: 0, lng: 0, address: 'New Location' },
      petrolPrice: petrol,
      dieselPrice: diesel,
      availability: AvailabilityStatus.AVAILABLE,
      lastUpdated: new Date().toISOString(),
    };

    setStations([...stations, newSt]);
    setShowAddStationModal(false);
  };

  const toggleSubscriptionCity = (city: string) => {
    if (!user || !user.subscriptions) return;
    const cities = user.subscriptions.cities.includes(city)
      ? user.subscriptions.cities.filter(c => c !== city)
      : [...user.subscriptions.cities, city];
    setUser({ ...user, subscriptions: { ...user.subscriptions, cities } });
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* AI Insight Header */}
            <div className="mb-8 bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/50 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 ${insights.includes('Consulting') ? 'animate-pulse' : ''}`}>
                    <Icons.Alert />
                  </div>
                  <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">AI Local Market Expert: {selectedCity}</h2>
                </div>
                {insights.includes("paused") || insights.includes("unavailable") ? (
                  <button 
                    onClick={() => fetchInsights(true)}
                    className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:underline px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    Retry Analysis
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-amber-600/40 dark:text-amber-400/20 uppercase tracking-[0.2em]">Session Cached</span>
                )}
              </div>
              <p className="text-amber-800 dark:text-amber-200/80 leading-relaxed text-sm italic font-medium min-h-[40px]">
                {insights}
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors">
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icons.Search />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-64 text-slate-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Sort by:</span>
                 <button onClick={() => setSortBy('price')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${sortBy === 'price' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Price</button>
                 <button onClick={() => setSortBy('recent')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${sortBy === 'recent' ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Updates</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStations.map(station => (
                <StationCard 
                  key={station.id} 
                  station={station} 
                  isAdmin={user?.role === UserRole.ADMIN}
                  onUpdate={(s) => setShowUpdateModal(s)}
                />
              ))}
              {filteredStations.length === 0 && (
                <div className="col-span-full py-24 text-center">
                  <div className="inline-flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900 rounded-full mb-4">
                     <Icons.Search />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">No results for "{searchQuery}" in {selectedCity}.</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-amber-500 font-bold hover:underline">Clear Search</button>
                </div>
              )}
            </div>
          </div>
        );

      case 'trends':
        return <PriceTrends darkMode={darkMode} trendInsights={trendInsights} />;
      
      case 'subscriptions':
        if (!user) { setActiveTab('auth'); return null; }
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl transition-colors">
                  <div className="inline-flex items-center justify-center p-4 bg-amber-500 rounded-2xl mb-6 shadow-xl shadow-amber-500/20">
                    <Icons.Bell />
                  </div>
                  <p className="text-[10px] text-amber-400 font-black uppercase tracking-[0.2em] mb-1">Authenticated</p>
                  <h2 className="text-3xl font-black text-white mb-6">{user.name}</h2>
                  <div className="p-5 bg-slate-800/50 dark:bg-slate-900/50 rounded-2xl border border-slate-700/50">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Account Role</p>
                     <p className="text-sm font-bold text-amber-500">{user.role} Partner</p>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm transition-colors">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recent Alerts</h2>
                    <button onClick={markAllRead} className="text-[10px] font-black text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest">Mark All Read</button>
                  </div>
                  <div className="space-y-4">
                     {notifications.length === 0 ? (
                       <div className="text-center py-16 opacity-40">
                          <Icons.Bell />
                          <p className="mt-4 font-bold">No active alerts</p>
                       </div>
                     ) : (
                       notifications.map(n => (
                          <div key={n.id} className="flex items-start space-x-5 p-6 rounded-3xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                             <div className={`p-3 rounded-2xl shrink-0 ${n.type === 'PRICE_ALERT' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                <Icons.Alert />
                             </div>
                             <div className="flex-1">
                                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{n.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">{n.message}</p>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 block font-black uppercase tracking-widest">{new Date(n.timestamp).toLocaleString()}</span>
                             </div>
                          </div>
                       ))
                     )}
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm transition-colors">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10">Regional Monitoring</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium italic">Select cities to receive instant SMS and Web notifications when prices shift significantly.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CITIES.map(city => {
                      const isActive = user?.subscriptions?.cities.includes(city);
                      return (
                        <button 
                          key={city}
                          onClick={() => toggleSubscriptionCity(city)}
                          className={`flex items-center justify-center h-14 rounded-2xl border text-sm font-black transition-all ${
                            isActive 
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20' 
                              : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500 hover:border-amber-500'
                          }`}>
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'admin':
        if (user?.role !== UserRole.ADMIN) {
           setActiveTab('home');
           return null;
        }
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Terminal Control</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Global pricing and station metadata management</p>
              </div>
              <button 
                onClick={() => setShowAddStationModal(true)}
                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20 active:scale-95 flex items-center space-x-2">
                <Icons.Fuel />
                <span>Onboard New Station</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Asset</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Region</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Petrol (SSP)</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {stations.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-10 py-6">
                          <p className="font-black text-slate-900 dark:text-slate-100">{s.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{s.company}</p>
                        </td>
                        <td className="px-10 py-6 text-slate-500 dark:text-slate-400 font-bold">{s.city}</td>
                        <td className="px-10 py-6 font-black text-amber-600 dark:text-amber-500">{s.petrolPrice}</td>
                        <td className="px-10 py-6">
                          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${s.availability === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800'}`}>
                            {s.availability.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <button 
                            onClick={() => setShowUpdateModal(s)}
                            className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                            <Icons.Settings />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'auth':
        return (
          <div className="min-h-[85vh] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg transition-colors">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-8 bg-amber-500 rounded-[2.5rem] mb-8 shadow-2xl shadow-amber-500/30">
                   <Icons.Fuel />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{isRegistering ? 'Create Profile' : 'Partner Sign In'}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium px-4 leading-relaxed">
                  Join the most trusted energy transparency network in South Sudan.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-8">
                {isRegistering && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                      <input 
                        type="text" 
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-900 dark:text-white transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector Affiliation</label>
                      <select 
                          value={authRole}
                          onChange={(e) => setAuthRole(e.target.value as UserRole)}
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer transition-colors"
                        >
                          <option value={UserRole.BODA}>Boda Boda Logistics</option>
                          <option value={UserRole.TAXI}>Public Transport (Taxi)</option>
                          <option value={UserRole.NGO}>NGO / Humanitarian</option>
                          <option value={UserRole.LOGISTICS}>Freight / Logistics</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-900 dark:text-white transition-colors"
                    placeholder="name@organization.ss"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Pass</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-900 dark:text-white transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-amber-500 text-white py-6 rounded-[2rem] font-black hover:bg-slate-800 dark:hover:bg-amber-600 transition-all shadow-2xl shadow-slate-200 dark:shadow-amber-900/30 active:scale-[0.98]">
                  {isRegistering ? 'Finalize Registration' : 'Authorize Session'}
                </button>
              </form>

              <div className="mt-12 text-center">
                 <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs font-black text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors uppercase tracking-[0.2em]">
                   {isRegistering ? 'Switch to Login' : 'Register New Partner'}
                 </button>
              </div>

              {!isRegistering && (
                <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 text-center transition-colors">
                   <p className="text-[10px] text-amber-700 dark:text-amber-600 font-black uppercase tracking-widest">Master Admin Override</p>
                   <p className="text-[10px] text-amber-600/40 dark:text-amber-600/20 mt-2 font-bold tracking-widest">ADMIN@FUELWATCH.SS : ADMIN123</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <Layout 
      user={user} 
      unreadNotifications={unreadCount}
      onLogout={() => { setUser(null); setActiveTab('home'); }} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderContent()}

      {/* Slide-out Notification Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}></div>
          <div className="relative w-full max-sm:max-w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-colors">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-black text-white">
              <div className="flex items-center space-x-4">
                <Icons.Bell />
                <h2 className="text-2xl font-black tracking-tight">Intelligence</h2>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white transition-all hover:rotate-90">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 opacity-30">
                     <Icons.Bell />
                     <p className="mt-4 font-black uppercase tracking-widest text-[10px]">No recent alerts</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-8 rounded-[2.5rem] border transition-all ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 shadow-xl shadow-amber-500/10'}`}>
                      <h4 className={`text-sm font-black mb-2 ${n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-amber-900 dark:text-amber-400'}`}>{n.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">{n.message}</p>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button 
                          onClick={() => { setActiveTab('home'); setIsNotificationsOpen(false); }}
                          className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:underline">
                          View
                        </button>
                      </div>
                    </div>
                  ))
                )}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button 
                onClick={markAllRead}
                className="w-full py-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-[0.2em] shadow-sm">
                Clear Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Station Modal */}
      {showAddStationModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl w-full max-w-xl my-8 animate-in fade-in zoom-in duration-300 overflow-hidden transition-colors border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-900 dark:bg-black px-12 py-8 text-white flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black uppercase tracking-[0.2em]">New Station Asset</h3>
                 <p className="text-[10px] text-slate-500 font-bold mt-1">Registering a new delivery point</p>
              </div>
              <button onClick={() => setShowAddStationModal(false)} className="text-slate-400 hover:text-white transition-all hover:rotate-90">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleAddStation} className="p-12 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                  <input name="name" required placeholder="Juba Terminal" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Brand</label>
                  <input name="company" required placeholder="Trinity Energy" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Region</label>
                <select name="city" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer transition-colors">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Petrol Initial (SSP)</label>
                  <input name="petrol" type="number" required placeholder="1400" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diesel Initial (SSP)</label>
                  <input name="diesel" type="number" required placeholder="1450" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setShowAddStationModal(false)} className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Onboard Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Price Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 transition-colors border border-slate-200 dark:border-slate-800">
            <div className="bg-amber-500 px-12 py-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-[0.2em]">Live Pricing Sync</h3>
                <p className="text-[10px] text-amber-100 font-bold mt-1">Adjusting market rates in real-time</p>
              </div>
              <button onClick={() => setShowUpdateModal(null)} className="text-white hover:rotate-90 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmission} className="p-12 space-y-10">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl transition-colors">
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Current Active Station</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{showUpdateModal.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Petrol Rate</label>
                  <input name="petrol" type="number" defaultValue={showUpdateModal.petrolPrice} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diesel Rate</label>
                  <input name="diesel" type="number" defaultValue={showUpdateModal.dieselPrice} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventory Level</label>
                <select name="status" defaultValue={showUpdateModal.availability} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer transition-colors">
                  <option value={AvailabilityStatus.AVAILABLE}>High Supply (Stock OK)</option>
                  <option value={AvailabilityStatus.LOW_STOCK}>Critical Supply (Warning)</option>
                  <option value={AvailabilityStatus.OUT_OF_STOCK}>Depleted (Unavailable)</option>
                </select>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setShowUpdateModal(null)} className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Discard</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-slate-900 dark:bg-amber-500 text-white rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-amber-600 shadow-2xl shadow-slate-200 dark:shadow-amber-900/30 transition-all active:scale-95">Commit Rates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
