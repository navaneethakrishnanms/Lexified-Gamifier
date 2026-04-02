import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, UserPlus, LogIn, Network, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { login, signup } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        signup(username.trim(), password);
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        login(username.trim(), password);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full min-h-screen bg-bg flex font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 xl:p-24 relative z-10">
        
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-lime flex items-center justify-center shadow-lg shadow-lime/20">
              <Brain size={24} className="text-bg" />
            </div>
            <h1 className="text-3xl font-display font-bold text-text">Lexifyd</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-display font-bold text-text mb-3">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-text-muted text-lg mb-8">
              {isSignUp 
                ? "Join the next generation of language mastery." 
                : "Sign in to continue your contextual reality shift."}
            </p>

            {/* Toggle Tabs */}
            <div className="flex w-full bg-bg-elevated rounded-xl p-1 mb-8 border border-border">
              <button
                onClick={() => !isSignUp || toggleMode()}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all ${!isSignUp ? 'bg-bg text-lime shadow' : 'text-text-muted hover:text-text'}`}
              >
                <LogIn size={18} /> Sign In
              </button>
              <button
                onClick={() => isSignUp || toggleMode()}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all ${isSignUp ? 'bg-bg text-lime shadow' : 'text-text-muted hover:text-text'}`}
              >
                <UserPlus size={18} /> Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-fire/10 border border-fire/30 text-fire text-sm rounded-xl font-medium text-center">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text uppercase tracking-wider ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-elevated border-2 border-border focus:border-sky rounded-xl px-5 py-4 text-text placeholder:text-text-dim transition-colors outline-none font-medium text-lg"
                  placeholder="e.g. TamilMaster99"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-elevated border-2 border-border focus:border-purple rounded-xl px-5 py-4 text-text placeholder:text-text-dim transition-colors outline-none font-medium text-lg"
                  placeholder="••••••••"
                />
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 overflow-hidden">
                    <label className="text-sm font-bold text-text uppercase tracking-wider ml-1 mt-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-bg-elevated border-2 border-border focus:border-purple rounded-xl px-5 py-4 text-text placeholder:text-text-dim transition-colors outline-none font-medium text-lg"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full btn btn-lime text-xl py-5 mt-4 flex items-center justify-center gap-3 group shadow-[0_0_30px_rgba(163,230,53,0.15)]"
              >
                {isSignUp ? 'Create Account' : 'Start Learning'}
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: Feature Graphic Layer (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-bg-card relative items-center justify-center overflow-hidden border-l border-border/50">
        {/* Deep Space Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_60%)] z-0" />
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-sky/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-lime/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Central Glowing Brain */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-lime/20 blur-[50px] scale-150 rounded-full" />
            <div className="w-32 h-32 rounded-3xl bg-lime flex items-center justify-center shadow-[0_0_50px_rgba(163,230,53,0.4)] relative z-10">
              <Brain size={64} className="text-bg" />
            </div>

            {/* Orbital Icon 1 */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-[-100px] border border-dashed border-border/50 rounded-full">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-bg-elevated border border-border rounded-xl flex items-center justify-center shadow-lg text-sky" style={{ transform: "translate(-50%, -50%) rotate(-360deg)" }}>
                <Network size={20} />
              </div>
            </motion.div>

            {/* Orbital Icon 2 */}
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-[-180px] border border-dashed border-border/30 rounded-full">
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-12 bg-bg-elevated border border-border rounded-xl flex items-center justify-center shadow-lg text-purple" style={{ transform: "translate(50%, -50%) rotate(360deg)" }}>
                <Sparkles size={20} />
              </div>
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-12 bg-bg-elevated border border-border rounded-xl flex items-center justify-center shadow-lg text-fire" style={{ transform: "translate(-50%, -50%) rotate(360deg)" }}>
                <MessageSquare size={20} />
              </div>
            </motion.div>
          </motion.div>

          {/* Typography */}
          <div className="mt-40 text-center max-w-sm">
            <h1 className="text-5xl font-display font-black tracking-tight text-white mb-4">
              Lexifyd <span className="text-lime glow-lime text-2xl align-top block mt-2">v2.0</span>
            </h1>
            <p className="text-xl text-text-muted leading-relaxed">
              Experience the Context X-Ray. Dive deep into the dimensions of Tamil polysemy.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
