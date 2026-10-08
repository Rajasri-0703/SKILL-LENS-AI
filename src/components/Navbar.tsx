import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Compass, BarChart3, History, User, Sparkles, Menu, X, Zap } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'analyze' | 'dashboard' | 'history' | 'profile';
  setCurrentTab: (tab: 'home' | 'analyze' | 'dashboard' | 'history' | 'profile') => void;
  hasActiveAnalysis: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, hasActiveAnalysis }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{
    id: 'home' | 'analyze' | 'dashboard' | 'history' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'analyze', label: 'Analyze', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: hasActiveAnalysis ? 'Live' : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 dark:bg-[#0b0d14]/85 border-b border-indigo-500/20 transition-colors duration-200 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <span className="text-base tracking-tight font-black">SL</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  SkillLens
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-extrabold text-lg">
                  AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300">
                  v2.0
                </span>
              </div>
              <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-medium">
                AI Career Skill Gap Analyzer
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-pink-600/20 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('analyze')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-purple-500/25 transition-all duration-150 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Quick Analyze</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl border border-indigo-500/30 bg-slate-900/80 text-zinc-300 hover:text-white hover:border-indigo-400 transition-colors shadow-xs"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-300 hover:bg-white/5 border border-zinc-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-indigo-500/20 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-indigo-600/40 to-purple-600/30 border border-indigo-500/40'
                    : 'text-zinc-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
