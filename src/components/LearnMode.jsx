import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Heart, RotateCcw } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Import the huge new database directly from the src/data directory
import fullQuizData from '../data/full_tamil_polysemy_quiz.json';

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// The imported JSON is already a flat array of questions
const allQuestions = fullQuizData;

const ROUND_SIZE = 10;

const LearnMode = () => {
  const { profile, recordAnswer } = useUser();
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, correct, incorrect
  const [lives, setLives] = useState(3);
  const [roundScore, setRoundScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundCorrectCount, setRoundCorrectCount] = useState(0);

  const startRound = useCallback(() => {
    // Pick exactly ROUND_SIZE random questions from our massive pool
    const shuffled = shuffleArray(allQuestions).slice(0, ROUND_SIZE);
    
    // Scramble the options for every question so "A" isn't always the correct answer
    const questionsWithOptionsShuffled = shuffled.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));

    setQueue(questionsWithOptionsShuffled);
    setCurrentIndex(0);
    setSelected(null);
    setStatus('idle');
    setLives(3);
    setRoundScore(0);
    setRoundComplete(false);
    setRoundCorrectCount(0);
  }, []);

  useEffect(() => { startRound(); }, [startRound]);

  const current = queue[currentIndex];
  if (!current && !roundComplete) return null;

  const handleSelect = (option) => {
    if (status !== 'idle') return;
    setSelected(option);

    const isCorrect = option === current.answer;
    
    // We record the user action in our context tracking (even if the exact meaning map is bypassed)
    recordAnswer(current.word, isCorrect, option, current.answer);

    if (isCorrect) {
      setStatus('correct');
      setRoundScore(s => s + 100);
      setRoundCorrectCount(c => c + 1);
    } else {
      setStatus('incorrect');
      setLives(l => l - 1);
    }
  };

  const handleNext = () => {
    if (lives <= 0 || currentIndex >= queue.length - 1) {
      setRoundComplete(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setStatus('idle');
  };

  const progress = ((currentIndex + (status !== 'idle' ? 1 : 0)) / queue.length) * 100;

  if (roundComplete || (lives <= 0 && status !== 'idle')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          {lives > 0
            ? <CheckCircle2 size={80} className="text-lime" />
            : <XCircle size={80} className="text-fire" />
          }
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-text">
          {lives > 0 ? 'Round Complete! 🎉' : 'Out of Lives! 💔'}
        </h2>
        <div className="flex gap-8 text-center bg-bg-elevated p-6 rounded-2xl border border-border">
          <div>
            <p className="text-4xl font-bold text-lime">{roundCorrectCount}</p>
            <p className="text-sm text-text-muted mt-2">Correct Answers</p>
          </div>
          <div className="w-px bg-border"></div>
          <div>
            <p className="text-4xl font-bold text-sky">{roundScore}</p>
            <p className="text-sm text-text-muted mt-2">XP Earned</p>
          </div>
        </div>
        <button onClick={startRound} className="btn btn-lime text-lg mt-4 px-8 py-4 shadow-lg shadow-lime/20">
          <RotateCcw size={20} /> Play Another Round
        </button>
      </div>
    );
  }

  // Split sentence at the blank to style the blank nicely
  const renderSentence = (sentenceText) => {
    if (!/_+/.test(sentenceText)) return <span>{sentenceText}</span>;
    const parts = sentenceText.split(/_+/);
    
    return (
      <span>
        {parts[0]}
        <span className="inline-block min-w-16 px-4 mx-2 border-b-2 border-sky text-sky font-bold">
          {status !== 'idle' && selected === current.answer ? current.answer : ' ' }
        </span>
        {parts.slice(1).join('____')}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-20">
      {/* Top Bar: Progress + Lives */}
      <div className="flex items-center gap-4 bg-bg-elevated p-4 rounded-2xl border border-border">
        <div className="progress-track flex-1">
          <div className="progress-fill bg-lime" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1 text-fire font-bold bg-fire/10 px-3 py-1.5 rounded-xl border border-fire/20">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={18} fill={i < lives ? 'currentColor' : 'transparent'} className={i < lives ? 'text-fire' : 'text-fire/30'} />
          ))}
        </div>
      </div>

      {/* Question Header */}
      <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-purple/10 text-purple mb-6 border border-purple/20">
          <BookOpen size={24} />
        </div>
        <h2 className="text-2xl leading-relaxed tamil text-text font-medium mb-2">
          {renderSentence(current.sentence)}
        </h2>
        <p className="text-text-muted mt-4 text-sm font-semibold uppercase tracking-widest text-sky">Choose the missing word</p>
      </motion.div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {current.options.map((option, i) => {
          let optionStyle = 'border-border hover:border-sky hover:bg-bg-elevated text-text hover:text-sky';
          
          if (status !== 'idle') {
            if (option === current.answer) {
              optionStyle = 'border-lime bg-lime-glow text-lime shadow-lg shadow-lime/20';
            } else if (option === selected && status === 'incorrect') {
              optionStyle = 'border-fire bg-fire-glow text-fire';
            } else {
              optionStyle = 'border-border opacity-40 bg-bg text-text-muted';
            }
          }

          return (
            <motion.button
              key={`${option}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(option)}
              disabled={status !== 'idle'}
              className={`
                text-center px-6 py-5 rounded-2xl border-2 font-tamil text-xl font-bold transition-all relative overflow-hidden
                ${optionStyle}
              `}
            >
              <span className="relative z-10">{option}</span>
              
              {status !== 'idle' && option === current.answer && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lime drop-shadow-md z-10"
                >
                  <CheckCircle2 size={24} fill="currentColor" className="text-bg" />
                </motion.div>
              )}
              {status !== 'idle' && option === selected && status === 'incorrect' && (
                <motion.div 
                  initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-fire drop-shadow-md z-10"
                >
                  <XCircle size={24} fill="currentColor" className="text-bg" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Panel */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 shadow-2xl backdrop-blur-xl border-2
              ${status === 'correct' ? 'border-lime bg-lime-glow' : 'border-fire bg-fire-glow'}
            `}
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              {status === 'correct' ? (
                <div className="w-14 h-14 rounded-full bg-lime/20 flex items-center justify-center shrink-0 border border-lime/30">
                  <CheckCircle2 size={32} className="text-lime" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-fire/20 flex items-center justify-center shrink-0 border border-fire/30">
                  <XCircle size={32} className="text-fire" />
                </div>
              )}
              <div>
                <h3 className={`font-display font-bold text-2xl ${status === 'correct' ? 'text-lime' : 'text-fire'}`}>
                  {status === 'correct' ? 'Brilliant! +100 XP' : 'Not quite! 💔'}
                </h3>
                {status === 'incorrect' && (
                  <p className="text-text mt-1 text-sm font-medium">
                    The correct answer is <span className="text-lime font-bold font-tamil text-base ml-1">{current.answer}</span>
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleNext}
              className={`btn whitespace-nowrap px-8 py-3 text-lg font-bold w-full sm:w-auto
                ${status === 'correct' ? 'btn-lime shadow-lg shadow-lime/20' : 'bg-bg text-text border border-fire/30 hover:bg-fire/10 hover:border-fire'}
              `}
            >
              Continue <ArrowRight size={20} className="stroke-[3]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnMode;
