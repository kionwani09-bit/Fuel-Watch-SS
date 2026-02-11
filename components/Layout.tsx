
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  unreadNotifications: number;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleNotifications: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  unreadNotifications, 
  onLogout, 
  activeTab, 
  setActiveTab,
  onToggleNotifications,
  darkMode,
  setDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(unreadNotifications);

  // Trigger bell animation when new notifications arrive
  useEffect(() => {
    if (unreadNotifications > prevCount) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 700);
      setPrevCount(unreadNotifications);
      return () => clearTimeout(timer);
    }
    setPrevCount(unreadNotifications);
  }, [unreadNotifications, prevCount]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="bg-amber-500 p-2 rounded-lg text-white">
                <Icons.Fuel />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FuelWatch <span className="text-amber-500">SS</span></span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-amber-600 border-b-2 border-amber-600 dark:text-amber-400 dark:border-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Explore
              </button>
              <button 
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'trends' ? 'text-amber-600 border-b-2 border-amber-600 dark:text-amber-400 dark:border-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                Price Trends
              </button>
              {user && (
                <button 
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'text-amber-600 border-b-2 border-amber-600 dark:text-amber-400 dark:border-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  My Alerts
                </button>
              )}
              {user && user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'admin' ? 'text-amber-600 border-b-2 border-amber-600 dark:text-amber-400 dark:border-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  Admin
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>

              {user && (
                <button 
                  onClick={onToggleNotifications}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors focus:outline-none">
                  <div className={shouldAnimate ? 'animate-bell-wiggle' : ''}>
                    <Icons.Bell />
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Icons.User />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTab('auth')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              {user && (
                <button 
                  onClick={onToggleNotifications}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors focus:outline-none">
                  <div className={shouldAnimate ? 'animate-bell-wiggle' : ''}>
                    <Icons.Bell />
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-500 dark:text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => {setActiveTab('home'); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 w-full text-left">Explore</button>
              <button onClick={() => {setActiveTab('trends'); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 w-full text-left">Price Trends</button>
              {user && (
                 <button onClick={() => {setActiveTab('subscriptions'); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 w-full text-left">My Alerts</button>
              )}
              {user && user.role === UserRole.ADMIN && (
                <button onClick={() => {setActiveTab('admin'); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 w-full text-left">Admin</button>
              )}
              {user ? (
                <button onClick={() => {onLogout(); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-red-600 w-full text-left">Logout</button>
              ) : (
                <button onClick={() => {setActiveTab('auth'); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-amber-600 w-full text-left">Sign In</button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow transition-colors duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-white py-12 mt-20 border-t border-slate-800 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <Icons.Fuel />
                </div>
                <span className="text-xl font-bold tracking-tight">FuelWatch SS</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm">
                Empowering South Sudan with real-time fuel transparency. Tracking prices and availability in Juba, Wau, Malakal, Yei and across the nation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-slate-100">Support</h3>
              <ul className="space-y-2 text-slate-400 dark:text-slate-500">
                <li><a href="#" className="hover:text-amber-500 transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Report an Issue</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-slate-100">Follow Us</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center cursor-pointer hover:bg-amber-500 transition-all hover:scale-110">FB</div>
                <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center cursor-pointer hover:bg-amber-500 transition-all hover:scale-110">TW</div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 dark:border-slate-900 mt-12 pt-8 text-center text-slate-500 text-sm">
            © 2026 FuelWatch South Sudan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
