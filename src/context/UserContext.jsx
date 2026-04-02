import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

const INITIAL_PROFILE = {
  isAuthenticated: false,
  name: '',
  password: '', // Mock stored password
  totalScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  xp: 0,
  level: 1,
  // Tracks per-word performance: { [word]: { correct: N, wrong: N, lastSeen: Date } }
  wordPerformance: {},
  // Ordered list of recently wrong words
  weakWords: [],
  // Confusion pairs: [[meaning_a, meaning_b], ...]
  confusionPairs: [],
  // History of per-session results
  sessionHistory: [],
  // Store daily XP for github streak graph
  activityHistory: {
    // Inject some fake data so the user can see the graphs working immediately
    [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: 120,
    [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: 50,
    [new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]]: 250,
    [new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0]]: 90,
    [new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0]]: 300,
    [new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0]]: 100,
  },
  // Friend challenge seeds
  challengeCodes: {},
};

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const activeUser = localStorage.getItem('tamilsense_active_user');
      if (activeUser) {
        const saved = localStorage.getItem(`tamilsense_profile_${activeUser}`);
        return saved ? { ...INITIAL_PROFILE, ...JSON.parse(saved), isAuthenticated: true } : INITIAL_PROFILE;
      }
      return INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const persist = (updated) => {
    setProfile(updated);
    try {
      if (updated.name) {
        localStorage.setItem(`tamilsense_profile_${updated.name}`, JSON.stringify(updated));
      }
    } catch {}
  };

  // Record an answer
  const recordAnswer = useCallback((word, isCorrect, selectedMeaning, correctMeaning) => {
    setProfile(prev => {
      const next = { ...prev };
      next.totalAttempted += 1;
      const xpEarned = isCorrect ? 10 : 2;
      next.xp += xpEarned;

      // Track daily activity for the github streak
      const today = new Date().toISOString().split('T')[0];
      next.activityHistory = {
        ...(prev.activityHistory || {}),
        [today]: ((prev.activityHistory || {})[today] || 0) + xpEarned
      };

      // Update word performance
      const wp = { ...(prev.wordPerformance[word] || { correct: 0, wrong: 0 }) };
      if (isCorrect) {
        next.totalCorrect += 1;
        next.totalScore += 100;
        next.currentStreak += 1;
        next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
        wp.correct += 1;
      } else {
        next.currentStreak = 0;
        wp.wrong += 1;
        // Track weak word
        if (!next.weakWords.includes(word)) {
          next.weakWords = [word, ...next.weakWords].slice(0, 20);
        }
        // Track confusion pair
        if (selectedMeaning && correctMeaning && selectedMeaning !== correctMeaning) {
          next.confusionPairs = [[selectedMeaning, correctMeaning], ...next.confusionPairs].slice(0, 30);
        }
      }
      wp.lastSeen = Date.now();
      next.wordPerformance = { ...prev.wordPerformance, [word]: wp };

      // Level up every 200 XP
      next.level = Math.floor(next.xp / 200) + 1;

      try { localStorage.setItem(`tamilsense_profile_${next.name}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Store a challenge code
  const storeChallengeCode = useCallback((code, data) => {
    setProfile(prev => {
      const next = { ...prev, challengeCodes: { ...prev.challengeCodes, [code]: data } };
      try { localStorage.setItem(`tamilsense_profile_${next.name}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Get weak words for AI mode
  const getWeakWords = useCallback(() => {
    return profile.weakWords;
  }, [profile.weakWords]);

  // Authentication
  const signup = useCallback((username, password) => {
    const usersStr = localStorage.getItem('tamilsense_users') || '{}';
    const users = JSON.parse(usersStr);
    
    if (users[username]) {
      throw new Error("Username already exists!");
    }

    users[username] = password;
    localStorage.setItem('tamilsense_users', JSON.stringify(users));
    localStorage.setItem('tamilsense_active_user', username);

    const newProfile = { ...INITIAL_PROFILE, isAuthenticated: true, name: username, password };
    persist(newProfile);
    return true;
  }, []);

  const login = useCallback((username, password) => {
    const usersStr = localStorage.getItem('tamilsense_users') || '{}';
    const users = JSON.parse(usersStr);

    if (!users[username]) {
      throw new Error("User not found. Please sign up.");
    }
    if (users[username] !== password) {
      throw new Error("Incorrect password.");
    }

    localStorage.setItem('tamilsense_active_user', username);
    
    const savedMsg = localStorage.getItem(`tamilsense_profile_${username}`);
    const existingProfile = savedMsg ? JSON.parse(savedMsg) : { ...INITIAL_PROFILE, name: username, password };
    
    setProfile({ ...existingProfile, isAuthenticated: true });
    return true;
  }, []);

  const logout = useCallback(() => {
    setProfile(INITIAL_PROFILE);
    localStorage.removeItem('tamilsense_active_user');
  }, []);

  // Reset profile
  const resetProfile = useCallback(() => {
    persist({ ...INITIAL_PROFILE, isAuthenticated: true, name: profile.name, password: profile.password });
  }, [profile.name, profile.password]);

  return (
    <UserContext.Provider value={{ profile, recordAnswer, storeChallengeCode, getWeakWords, login, signup, logout, resetProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};
