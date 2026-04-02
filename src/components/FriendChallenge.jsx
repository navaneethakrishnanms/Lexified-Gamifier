import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, CheckCircle2, ArrowRight, Share2, Trophy, Hash, Zap, Swords, Loader2, Play } from 'lucide-react';
import { useUser } from '../context/UserContext';
import challengeData from '../data/challenge_data.json';
import { io } from 'socket.io-client';

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Map flattened JSON challenges
const getValidChallenges = () => {
  const list = [];
  challengeData.forEach(item => {
    if (item.senses) {
      item.senses.forEach(sense => {
        if (sense.challenge && sense.options) {
          list.push({
            word: item.word,
            sentence: sense.challenge,
            correct_answer: sense.correct_answer,
            options: shuffleArray(sense.options),
            context: sense.context
          });
        }
      });
    }
  });
  return list;
};

const fillSentence = (sentence, word) => sentence.replace(/_+/g, '_____');

const getChallengesFromSeed = (seed, count = 10) => {
  const valid = getValidChallenges();
  const sorted = [...valid];
  let s = seed;
  for (let i = sorted.length - 1; i > 0; i--) { 
    s = (s * 16807 + 0) % 2147483647; 
    const j = s % (i + 1); 
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]]; 
  }
  return sorted.slice(0, count);
};

const BATTLE_TIME = 120; // 2 minutes max per battle

const FriendChallenge = () => {
  const { profile, recordAnswer } = useUser();
  const [mode, setMode] = useState('menu'); // menu, join_input, lobby, playing, finished, results
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [roundScore, setRoundScore] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [copied, setCopied] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(BATTLE_TIME);
  const [socket, setSocket] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [opponentFinished, setOpponentFinished] = useState(false);
  
  // NEW REVEAL STATES
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const timerRef = useRef(null);

  // Initialize Socket.io connection on mount
  useEffect(() => {
    // Dynamic host connection exactly where the frontend is served
    const s = io(`http://${window.location.hostname}:3001`);
    setSocket(s);
    
    return () => {
      s.disconnect();
    };
  }, []);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', ({ code, seed }) => {
      setCode(code);
      setQueue(getChallengesFromSeed(seed));
      setMode('lobby');
      setIsHost(true);
    });

    socket.on('join_error', ({ message }) => {
      alert(message);
      setMode('menu');
    });

    socket.on('room_ready', ({ host, guest, seed }) => {
      // Called when the room gets full
      setOpponent(isHost ? guest : host);
      if (!isHost) {
        setQueue(getChallengesFromSeed(seed));
        setMode('lobby');
      }
    });

    socket.on('match_started', () => {
      // Boom, snap to battle mode!
      setMode('playing');
      setCurrentIndex(0);
      setRoundScore(0);
      setRoundCorrect(0);
      setTimeRemaining(BATTLE_TIME);
      setIsRevealed(false);
      setSelectedOption(null);
      
      // Start Unified Timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            finishGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    });

    socket.on('opponent_finished', ({ username }) => {
      setOpponentFinished(true);
    });

    socket.on('battle_complete', (results) => {
      setMatchResults(results);
      setMode('results');
    });

    return () => {
      socket.off('room_created');
      socket.off('join_error');
      socket.off('room_ready');
      socket.off('match_started');
      socket.off('opponent_finished');
      socket.off('battle_complete');
    };
  }, [socket, isHost]);

  // Clean up timer
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const createChallenge = useCallback(() => {
    if (!socket) return;
    socket.emit('create_room', { username: profile.name });
    setMode('loading');
  }, [socket, profile.name]);

  const joinChallenge = useCallback(() => {
    if (!socket || joinCode.length < 4) return;
    setCode(joinCode.toUpperCase());
    socket.emit('join_room', { code: joinCode.toUpperCase(), username: profile.name });
    setMode('loading');
    setIsHost(false);
  }, [socket, joinCode, profile.name]);

  const startMatch = () => {
    socket.emit('start_match', { code });
  };

  const finishGame = useCallback((finalScore = roundScore, finalCorrect = roundCorrect) => {
    clearInterval(timerRef.current);
    const timeTaken = BATTLE_TIME - timeRemaining;
    socket.emit('submit_score', { 
      code, 
      score: finalScore, 
      correct: finalCorrect, 
      timeTaken 
    });
    setMode('finished');
  }, [socket, code, roundScore, roundCorrect, timeRemaining]);

  const handleSelect = (option, correctAnswer) => {
    if (status !== 'idle' || isRevealed) return;
    
    setIsRevealed(true);
    setSelectedOption(option);
    
    const current = queue[currentIndex];
    const isCorrect = option === correctAnswer;
    
    // Internal user profile tracking
    recordAnswer(current.word, isCorrect, option, correctAnswer);
    
    const newScore = roundScore + (isCorrect ? 100 : 0);
    const newCorrect = roundCorrect + (isCorrect ? 1 : 0);
    
    setRoundScore(newScore);
    setRoundCorrect(newCorrect);
    
    // Auto advance after giving time to read it
    setTimeout(() => {
      if (currentIndex >= queue.length - 1) {
        finishGame(newScore, newCorrect);
      } else {
        setCurrentIndex(i => i + 1);
        setIsRevealed(false);
        setSelectedOption(null);
      }
    }, 2000); // Wait exactly 2 seconds before disappearing
  };

  const copyCode = () => { 
    navigator.clipboard.writeText(code).then(() => { 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000); 
    }); 
  };

  // Views rendering
  if (mode === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={48} className="animate-spin text-lime" />
        <p className="text-xl font-bold text-text-muted">Connecting to battle server...</p>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="flex flex-col gap-8 max-w-xl mx-auto py-12">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-text flex items-center justify-center gap-3 mb-2">
            <Swords className="text-lime" /> Battle Arena
          </h2>
          <p className="text-text-muted text-lg">Challenge friends in real-time synchronous battles</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={createChallenge} className="mode-card card p-8 text-center cursor-pointer">
            <Share2 size={40} className="text-lime mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text mb-2">Host Battle</h3>
            <p className="text-sm text-text-muted">Create a lobby and invite a friend</p>
          </motion.button>
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onClick={() => setMode('join_input')} className="mode-card card p-8 text-center cursor-pointer">
            <Hash size={40} className="text-sky mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text mb-2">Join Battle</h3>
            <p className="text-sm text-text-muted">Enter a lobby code to fight</p>
          </motion.button>
        </div>
      </div>
    );
  }

  if (mode === 'join_input') {
    return (
      <div className="flex flex-col gap-8 max-w-md mx-auto py-12 items-center">
        <h2 className="text-2xl font-display font-bold text-text">Enter Battle Code</h2>
        <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A3B7K2" maxLength={6}
          className="text-center text-4xl font-mono font-bold p-4 bg-bg-elevated border-2 border-border focus:border-sky rounded-2xl text-sky w-full tracking-[0.3em] outline-none transition-colors" />
        <div className="flex gap-4 w-full">
          <button onClick={() => setMode('menu')} className="flex-1 btn btn-ghost">Back</button>
          <button onClick={joinChallenge} disabled={joinCode.length < 4} className="flex-1 btn btn-sky">Join <ArrowRight size={16} /></button>
        </div>
      </div>
    );
  }

  if (mode === 'lobby') {
    return (
      <div className="flex flex-col gap-8 max-w-md mx-auto py-12 items-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-bg-elevated border-4 border-lime flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
          <Swords size={40} className="text-lime" />
        </motion.div>
        
        <h2 className="text-3xl font-display font-bold text-text">Battle Lobby</h2>
        
        <div className="card p-6 w-full flex flex-col gap-4">
          <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-mono font-bold text-sky tracking-[0.2em]">{code}</span>
            <button onClick={copyCode} className="btn bg-bg-elevated border border-border p-3 hover:border-lime transition-colors">
              {copied ? <CheckCircle2 size={24} className="text-lime" /> : <Copy size={24} className="text-text-muted" />}
            </button>
          </div>
        </div>

        <div className="w-full card p-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center mb-2">
              <Users size={20} className="text-lime" />
            </div>
            <p className="font-bold text-text">{isHost ? profile.name : opponent}</p>
            <p className="text-xs text-text-muted">Host</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-sky/20 rounded-full flex items-center justify-center mb-2">
              {(!isHost || opponent) ? <Users size={20} className="text-sky" /> : <Loader2 size={20} className="text-sky animate-spin" />}
            </div>
            <p className="font-bold text-text">{!isHost ? profile.name : (opponent || 'Waiting...')}</p>
            <p className="text-xs text-text-muted">Challenger</p>
          </div>
        </div>

        {isHost ? (
          <button 
            onClick={startMatch} 
            disabled={!opponent} 
            className="w-full btn btn-lime text-xl py-4 shadow-[0_0_20px_rgba(163,230,53,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            Start Battle <Play size={20} className="ml-2 fill-current" />
          </button>
        ) : (
          <div className="w-full text-center p-4 bg-bg-elevated rounded-xl border border-border animate-pulse font-bold text-sky">
            Waiting for Host to start the battle...
          </div>
        )}
      </div>
    );
  }

  if (mode === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 size={64} className="animate-spin text-purple" />
        <h2 className="text-2xl font-display font-bold text-text">You Finished!</h2>
        <p className="text-text-muted text-lg">Waiting for opponent to complete their battle...</p>
        <div className="card p-6 flex items-center gap-4 border border-lime/30 bg-lime/5">
          <CheckCircle2 size={30} className="text-lime" />
          <div>
            <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Your Raw Score</p>
            <p className="text-2xl font-bold text-text">{roundScore} XP</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'results' && matchResults) {
    const isWinner = matchResults.winner === profile.name;
    const isTie = matchResults.winner === 'Tie';
    
    // Determine which stats object is mine vs opponents
    const myStats = matchResults.hostStats.username === profile.name ? matchResults.hostStats : matchResults.guestStats;
    const oppStats = matchResults.hostStats.username !== profile.name ? matchResults.hostStats : matchResults.guestStats;

    return (
      <div className="flex flex-col items-center py-10 gap-8 max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <Trophy size={100} className={isWinner ? 'text-sun drop-shadow-[0_0_30px_rgba(252,211,77,0.5)]' : isTie ? 'text-sky' : 'text-text-dim'} />
        </motion.div>
        
        <h2 className="text-5xl font-display font-black text-text uppercase tracking-widest text-center">
          {isWinner ? <span className="text-sun glow-sun">Victory!</span> : isTie ? <span className="text-sky glow-sky">Draw!</span> : <span className="text-fire glow-fire">Defeat!</span>}
        </h2>
        
        <div className="grid grid-cols-2 w-full gap-4 sm:gap-8 mt-4">
          {/* MY STATS */}
          <div className={`card p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden ${isWinner ? 'border-sun/50 shadow-lg shadow-sun/20' : 'border-border'}`}>
            {isWinner && <div className="absolute inset-0 bg-gradient-to-br from-sun/10 to-transparent z-0" />}
            <div className="relative z-10">
              <p className="font-bold text-lg text-text mb-4">You ({profile.name})</p>
              <p className="text-5xl font-black text-white glow-white mb-2">{myStats.finalScore}</p>
              <p className="text-sm text-text-muted uppercase tracking-wider mb-6">Total Score</p>
              
              <div className="flex flex-col gap-2 text-sm w-full">
                <div className="flex justify-between w-full bg-bg-elevated p-2 rounded-lg">
                  <span className="text-text-muted">Accuracy:</span>
                  <span className="font-bold text-lime">{myStats.correct}/{queue.length}</span>
                </div>
                <div className="flex justify-between w-full bg-bg-elevated p-2 rounded-lg">
                  <span className="text-text-muted">Speed:</span>
                  <span className="font-bold text-sky">{myStats.timeTaken}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* OPPONENT STATS */}
          <div className={`card p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden ${!isWinner && !isTie ? 'border-sun/50 shadow-lg shadow-sun/20' : 'border-border opacity-70'}`}>
            {!isWinner && !isTie && <div className="absolute inset-0 bg-gradient-to-br from-sun/10 to-transparent z-0" />}
            <div className="relative z-10">
              <p className="font-bold text-lg text-text mb-4">Opponent ({oppStats.username})</p>
              <p className="text-5xl font-black text-white glow-white mb-2">{oppStats.finalScore}</p>
              <p className="text-sm text-text-muted uppercase tracking-wider mb-6">Total Score</p>
              
              <div className="flex flex-col gap-2 text-sm w-full">
                <div className="flex justify-between w-full bg-bg-elevated p-2 rounded-lg">
                  <span className="text-text-muted">Accuracy:</span>
                  <span className="font-bold text-lime">{oppStats.correct}/{queue.length}</span>
                </div>
                <div className="flex justify-between w-full bg-bg-elevated p-2 rounded-lg">
                  <span className="text-text-muted">Speed:</span>
                  <span className="font-bold text-sky">{oppStats.timeTaken}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setMode('menu')} className="btn btn-purple text-lg px-8 py-4 mt-4 w-full sm:w-auto">
          Return to Arena
        </button>
      </div>
    );
  }

  // Active Gameplay playing screen
  const current = queue[currentIndex];
  if (!current && mode === 'playing') return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated border border-border">
          <Zap size={16} className={timeRemaining < 30 ? "text-fire animate-pulse" : "text-sun"} />
          <span className={`font-mono font-bold text-lg ${timeRemaining < 30 ? "text-fire" : "text-sun"}`}>
             {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
           <span className="text-sm font-bold text-text-muted">Opponent Status:</span>
           {opponentFinished ? (
             <span className="px-3 py-1 bg-lime/20 text-lime text-xs font-bold rounded-full border border-lime/30">Finished!</span>
           ) : (
             <span className="px-3 py-1 bg-sky/20 text-sky text-xs font-bold rounded-full border border-sky/30 flex items-center gap-2">
               <Loader2 size={12} className="animate-spin" /> Fighting
             </span>
           )}
        </div>

        <div className="font-mono font-bold text-sm text-text-muted bg-bg-elevated px-4 py-2 rounded-full border border-border">
          {currentIndex + 1} / {queue.length}
        </div>
      </div>

      <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 mt-4 text-center border-purple/30 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-border"><div className="h-full bg-gradient-to-r from-purple to-sky" style={{width: `${((currentIndex)/10)*100}%`}}></div></div>
        
        <p className="text-2xl leading-relaxed tamil text-text font-medium mt-4">
          {fillSentence(current.sentence, current.word).split('_____').map((part, i, arr) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < arr.length - 1 && <span className="px-4 py-1 mx-2 rounded-xl bg-bg border-b-4 border-purple shadow-inner text-purple/20 select-none">_____</span>}
            </React.Fragment>
          ))}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {current.options.map((option, i) => {
          const isCorrect = option === current.correct_answer;
          const isSelected = option === selectedOption;
          
          let btnClass = "w-full text-left px-6 py-5 rounded-2xl border-2 border-border bg-bg-elevated hover:border-purple hover:bg-purple/5 font-semibold text-lg transition-all shadow-sm hover:shadow-purple/20";
          
          if (isRevealed) {
            if (isCorrect) {
              btnClass = "w-full text-left px-6 py-5 rounded-2xl border-2 border-lime bg-lime/10 font-semibold text-lg text-lime shadow-[0_0_15px_rgba(163,230,53,0.3)]";
            } else if (isSelected) {
              btnClass = "w-full text-left px-6 py-5 rounded-2xl border-2 border-fire bg-fire/10 font-semibold text-lg text-fire shadow-[0_0_15px_rgba(239,68,68,0.3)]";
            } else {
              btnClass = "w-full text-left px-6 py-5 rounded-2xl border-2 border-border/30 bg-bg opacity-40 font-semibold text-lg text-text-muted";
            }
          }

          return (
            <motion.button 
              key={`${option}-${i}`} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSelect(option, current.correct_answer)} 
              className={btnClass}
              disabled={isRevealed}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FriendChallenge;
