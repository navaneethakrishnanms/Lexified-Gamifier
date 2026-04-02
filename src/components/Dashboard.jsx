import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import {
  Flame, Zap, Trophy, Target, BookOpen, Bot, Swords, Globe,
  BookMarked, Users, TrendingUp, AlertTriangle, ArrowRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${glow}`} style={{ background: `${color}20` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
);

const ModeCard = ({ icon: Icon, label, desc, color, onClick, delay }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    className="mode-card card p-6 text-left w-full flex items-start gap-4 cursor-pointer group"
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-bold text-text mb-1 flex items-center gap-2">
        {label}
        <ArrowRight size={16} className="text-text-dim opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </div>
  </motion.button>
);

const generatePastDays = (count) => {
  const days = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const ActivityGraph = ({ activityHistory }) => {
  const days = generatePastDays(7);
  const data = days.map(d => activityHistory[d] || 0);
  const maxXP = Math.max(...data, 100);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 w-full h-full flex flex-col justify-between">
      <h2 className="text-lg font-display font-bold text-text mb-6">7-Day XP Tracker</h2>
      <div className="flex items-end justify-between h-32 gap-3 mt-4">
        {data.map((val, i) => {
          const height = Math.max((val / maxXP) * 100, 4);
          const dayName = new Date(days[i]).toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={i} className="flex flex-col items-center flex-1 group relative">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-elevated px-2 py-1 rounded-lg text-xs font-bold text-text border-2 border-border pointer-events-none whitespace-nowrap z-10 shadow-lg shadow-black/20">
                {val} XP
              </div>
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="w-full max-w-[32px] bg-purple rounded-t-lg hover:bg-lime transition-colors"
                style={{ minHeight: '4%' }}
              />
              <span className="text-xs text-text-muted mt-3 font-semibold tracking-wider uppercase">{dayName}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const GithubStreak = ({ activityHistory }) => {
  const WEEKS = 52;
  const columns = Array.from({ length: WEEKS }).map(() => Array(7).fill(null));
  let currDate = new Date();
  
  for (let c = WEEKS - 1; c >= 0; c--) {
    const startRow = (c === WEEKS - 1) ? currDate.getDay() : 6;
    for (let r = startRow; r >= 0; r--) {
        columns[c][r] = currDate.toISOString().split('T')[0];
        currDate.setDate(currDate.getDate() - 1);
    }
  }

  const getLevel = (xp) => {
    if (!xp) return 'bg-bg-elevated/30 border-border/30';
    if (xp < 50) return 'bg-[#0e4429] border-[#0e4429]/50';
    if (xp < 150) return 'bg-[#006d32] border-[#006d32]/50';
    if (xp < 300) return 'bg-[#26a641] border-[#26a641]/50 z-10';
    return 'bg-[#39d353] border-[#39d353]/50 shadow-sm shadow-[#39d353]/20 z-10'; 
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 w-full h-full flex flex-col justify-between">
      <h2 className="text-lg font-display font-bold text-text mb-4">Contribution Calendar</h2>
      <div className="overflow-x-auto pb-4 custom-scrollbar" style={{ direction: 'rtl' }}>
        <div style={{ direction: 'ltr' }} className="flex gap-[4px] mt-2 w-max items-end">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[4px] text-[10px] text-text-muted justify-between py-[1px] pr-2 font-medium sticky left-0 z-10">
            {/* Top spacer precisely matching the month labels row height */}
            <span className="h-[14px] mb-[2px] block"></span>
            <span className="h-[14px] flex items-center leading-none"></span>
            <span className="h-[14px] flex items-center leading-none">Mon</span>
            <span className="h-[14px] flex items-center leading-none"></span>
            <span className="h-[14px] flex items-center leading-none">Wed</span>
            <span className="h-[14px] flex items-center leading-none"></span>
            <span className="h-[14px] flex items-center leading-none">Fri</span>
            <span className="h-[14px] flex items-center leading-none"></span>
          </div>

          {/* Grid columns */}
          {columns.map((col, colIndex) => {
            // Month label detection logic: Did the month change in this column compared to the previous one?
            let monthLabel = null;
            const firstDayOfCol = col.find(d => d);
            if (firstDayOfCol) {
                const currentMonth = new Date(firstDayOfCol).getMonth();
                if (colIndex === 0) {
                    monthLabel = new Date(firstDayOfCol).toLocaleString('en-US', { month: 'short' });
                } else {
                    const prevCol = columns[colIndex - 1];
                    const prevFirstDay = prevCol.find(d => d);
                    if (prevFirstDay) {
                        const prevMonth = new Date(prevFirstDay).getMonth();
                        if (currentMonth !== prevMonth) {
                            monthLabel = new Date(firstDayOfCol).toLocaleString('en-US', { month: 'short' });
                        }
                    }
                }
            }

            return (
              <div key={colIndex} className="flex flex-col gap-[4px] relative">
                {/* Month Row Header Cell */}
                <div className="h-[14px] mb-[2px] w-full relative">
                   {monthLabel && <span className="absolute left-0 bottom-0 text-[10px] text-text-muted font-medium z-0 pointer-events-none">{monthLabel}</span>}
                </div>
                
                {/* 7 Days of the Week */}
                {col.map((dateStr, rowIndex) => {
                  if (!dateStr) {
                    return <div key={rowIndex} className="w-[14px] h-[14px] rounded-[3px] bg-transparent" />;
                  }
                  const xp = activityHistory[dateStr] || 0;
                  return (
                    <div key={rowIndex} className={`w-[14px] h-[14px] rounded-[3px] border ${getLevel(xp)} group relative transition-colors hover:border-text cursor-crosshair`}>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-elevated px-2 py-1 rounded-md text-xs font-bold text-text border border-border pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: {xp} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted justify-between">
        <div className="text-text-muted">Learn how we count contributions</div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1">Less</span>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-bg-elevated/30 border border-border/30"></div>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-[#0e4429] border border-[#0e4429]/50"></div>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-[#006d32] border border-[#006d32]/50"></div>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-[#26a641] border border-[#26a641]/50"></div>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-[#39d353] border border-[#39d353]/50"></div>
          <span className="ml-1">More</span>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const { profile } = useUser();

  const accuracy = profile.totalAttempted > 0
    ? Math.round((profile.totalCorrect / profile.totalAttempted) * 100)
    : 0;

  const weakWordsList = profile.weakWords.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-display font-bold text-text mb-2"
        >
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime to-sky">{profile.name || 'Master'}</span>! 👋
        </motion.h1>
        <p className="text-text-muted text-lg">
          Continue mastering Tamil polysemy. Level <span className="text-sky font-bold">{profile.level}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day Streak" value={profile.currentStreak} color="var(--color-sun)" glow="glow-sun" />
        <StatCard icon={Zap} label="Total XP" value={profile.xp} color="var(--color-sky)" glow="glow-sky" />
        <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} color="var(--color-lime)" glow="glow-lime" />
        <StatCard icon={Trophy} label="Best Streak" value={profile.bestStreak} color="var(--color-purple)" />
      </div>

      {/* XP Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text">Level {profile.level} Progress</span>
          <span className="text-sm text-text-muted font-mono">{profile.xp % 200} / 200 XP</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill bg-sky" style={{ width: `${(profile.xp % 200) / 2}%` }} />
        </div>
      </motion.div>

      {/* Analytics & Streak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityGraph activityHistory={profile.activityHistory || {}} />
        <GithubStreak activityHistory={profile.activityHistory || {}} />
      </div>

      {/* Quick Modes Grid */}
      <div>
        <h2 className="text-xl font-display font-bold text-text mb-4">Learning Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModeCard icon={BookOpen} label="Quiz Mode" desc="Practice meanings in simple sentences. Great for beginners." color="var(--color-lime)" onClick={() => onNavigate('learn')} delay={0} />
          <ModeCard icon={Bot} label="Play with AI" desc="AI-personalized challenges targeting your weak areas." color="var(--color-purple)" onClick={() => onNavigate('ai')} delay={0.05} />
          <ModeCard icon={Globe} label="Word Explorer" desc="Explore the Knowledge Graph of Tamil word relationships." color="var(--color-sky)" onClick={() => onNavigate('explorer')} delay={0.1} />
          <ModeCard icon={BookMarked} label="Story Quest" desc="Learn through immersive mini-stories set in real-life scenarios." color="var(--color-sun)" onClick={() => onNavigate('story')} delay={0.15} />
          <ModeCard icon={Users} label="Friend Challenge" desc="Challenge friends with your custom quiz rounds." color="var(--color-lime)" onClick={() => onNavigate('friend')} delay={0.2} />
        </div>
      </div>

      {/* Weak Words Section */}
      {weakWordsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-sun" />
            Words to Review
          </h2>
          <div className="flex flex-wrap gap-3">
            {weakWordsList.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-4 py-2 rounded-full bg-fire/10 border border-fire/30 text-fire font-bold tamil text-lg cursor-default"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <button
            onClick={() => onNavigate('ai')}
            className="btn btn-sky mt-4 text-sm"
          >
            <Bot size={16} /> Practice Weak Words with AI
          </button>
        </motion.div>
      )}

      {/* Confusion Pairs */}
      {profile.confusionPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple" />
            Your Confusion Patterns
          </h2>
          <div className="flex flex-col gap-2">
            {profile.confusionPairs.slice(0, 5).map(([a, b], i) => (
              <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-bg-elevated">
                <span className="text-fire font-semibold tamil">{a}</span>
                <span className="text-text-dim">↔</span>
                <span className="text-lime font-semibold tamil">{b}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
