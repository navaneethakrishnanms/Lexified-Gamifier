import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Bot, Swords, Globe, BookMarked,
  Users, Menu, X, Brain, Flame, Zap
} from 'lucide-react';
import { useUser } from './context/UserContext';
import Dashboard from './components/Dashboard';
import LearnMode from './components/LearnMode';
import PlayWithAI from './components/PlayWithAI';
import WordExplorer from './components/WordExplorer';
import StoryQuest from './components/StoryQuest';
import FriendChallenge from './components/FriendChallenge';
import KnowledgeGenerator from './components/KnowledgeGenerator';

import Login from './components/Login';

const modeConfig = [
  { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, color: 'var(--color-sky)'    },
  { id: 'learn',      label: 'Quiz Mode',        icon: BookOpen,        color: 'var(--color-lime)'   },
  { id: 'ai',         label: 'Play with AI',      icon: Bot,             color: 'var(--color-purple)' },
  { id: 'explorer',   label: 'Word Explorer',     icon: Globe,           color: 'var(--color-sky)'    },
  { id: 'story',      label: 'Story Quest',       icon: BookMarked,      color: 'var(--color-sun)'    },
  { id: 'friend',     label: 'Friend Challenge',  icon: Users,           color: 'var(--color-lime)'   },
  { id: 'kg',         label: 'Learn Mode',   icon: Brain,           color: 'var(--color-purple)' },
];

const App = () => {
  const [activeMode, setActiveMode] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, logout } = useUser();

  if (!profile.isAuthenticated) {
    return <Login />;
  }

  const renderMode = () => {
    switch (activeMode) {
      case 'dashboard':  return <Dashboard onNavigate={setActiveMode} />;
      case 'learn':      return <LearnMode />;
      case 'ai':         return <PlayWithAI />;
      case 'explorer':   return <WordExplorer />;
      case 'story':      return <StoryQuest />;
      case 'friend':     return <FriendChallenge />;
      case 'kg':         return <KnowledgeGenerator />;
      default:           return <Dashboard onNavigate={setActiveMode} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ===== Sidebar (Desktop) ===== */}
      <aside className="hidden lg:flex flex-col w-72 bg-bg-card border-r border-border fixed top-0 left-0 h-screen z-40">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
            <Brain size={22} className="text-bg" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-text tracking-tight">TamilSense</h1>
            <span className="text-xs font-medium text-lime tracking-wider">AI POWERED</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {modeConfig.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-bg-elevated text-text' 
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text'}
                `}
              >
                <Icon size={20} style={{ color: isActive ? mode.color : undefined }} />
                {mode.label}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full" style={{ background: mode.color }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Stats Footer */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="card-elevated rounded-xl p-4 flex items-center gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-sky flex items-center justify-center text-bg font-bold text-lg">
              {profile.level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">Level {profile.level}</p>
              <div className="progress-track mt-1">
                <div className="progress-fill bg-sky" style={{ width: `${(profile.xp % 200) / 2}%` }} />
              </div>
            </div>
          </div>
          <button onClick={logout} className="w-full py-2.5 text-sm font-semibold text-fire bg-fire/10 hover:bg-fire/20 rounded-xl transition-colors duration-200">
            Log Out
          </button>
        </div>
      </aside>

      {/* ===== Mobile Top Bar ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
            <Brain size={16} className="text-bg" />
          </div>
          <span className="font-display font-bold text-text text-base">TamilSense</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sun font-bold text-sm">
            <Flame size={16} /> {profile.currentStreak}
          </div>
          <div className="flex items-center gap-1 text-sky font-bold text-sm">
            <Zap size={16} /> {profile.xp}
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-text-muted hover:text-text p-1">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-bg-card z-50 flex flex-col lg:hidden"
            >
              <div className="p-4 flex justify-between items-center border-b border-border">
                <span className="font-display font-bold text-text">Navigation</span>
                <button onClick={() => setSidebarOpen(false)} className="text-text-muted hover:text-text">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
                {modeConfig.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => { setActiveMode(mode.id); setSidebarOpen(false); }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all
                        ${activeMode === mode.id ? 'bg-bg-elevated text-text' : 'text-text-muted hover:bg-bg-elevated'}
                      `}
                    >
                      <Icon size={20} style={{ color: activeMode === mode.id ? mode.color : undefined }} />
                      {mode.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== Main Content ===== */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {renderMode()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
