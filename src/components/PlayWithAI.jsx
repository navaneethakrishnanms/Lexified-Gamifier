import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle2, XCircle, ArrowRight, Sparkles, RotateCcw, Brain } from 'lucide-react';
import { useUser } from '../context/UserContext';
import challengeData from '../data/challenge_data.json';

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Flatten the JSON structure so each question is an independent challenge
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
            options: sense.options,
            context: sense.context
          });
        }
      });
    }
  });
  return list;
};

const fillSentence = (sentence, word) => sentence.replace(/_+/g, '_____');

// Local Ollama config
const OLLAMA_API_URL = 'http://localhost:11434/v1/chat/completions';
const MODEL = 'llama3.1:8b';

const PlayWithAI = () => {
  const { profile, recordAnswer } = useUser();
  const [phase, setPhase] = useState('preparing');
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');
  const [roundScore, setRoundScore] = useState(0);
  const [roundCorrectCount, setRoundCorrectCount] = useState(0);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const validChallenges = getValidChallenges();

  const buildAdaptiveQueue = useCallback(() => {
    setPhase('preparing');
    const weakWords = profile.weakWords || [];
    let adaptiveChallenges = [];

    // Shuffle the entire pool first to guarantee raw baseline randomness
    const shuffledValid = shuffleArray(validChallenges);

    // Priority 1: weak words (Maximum 2 to ensure it doesn't feel entirely static)
    if (weakWords.length > 0) {
      const weakChallenges = shuffledValid.filter(c => weakWords.includes(c.word));
      adaptiveChallenges.push(...weakChallenges.slice(0, 2));
    }

    // Priority 2: low accuracy words (Maximum 1)
    const wordPerf = profile.wordPerformance || {};
    const lowAccWords = Object.entries(wordPerf)
      .filter(([_, stats]) => stats.wrong > 0 && stats.wrong >= stats.correct)
      .map(([word]) => word);
    const lowAccChallenges = shuffledValid.filter(c => lowAccWords.includes(c.word));
    adaptiveChallenges.push(...lowAccChallenges.slice(0, 1));

    // Priority 3: Fill remaining with completely random ones
    const usedSentences = new Set(adaptiveChallenges.map(c => c.sentence));
    const remaining = shuffledValid.filter(c => !usedSentences.has(c.sentence));
    
    // We want 10 questions total to match FriendChallenge length! User will appreciate it!
    const REQUIRED_LENGTH = 10;
    adaptiveChallenges.push(...remaining.slice(0, Math.max(0, REQUIRED_LENGTH - adaptiveChallenges.length)));

    // Deduplicate just in case
    const seen = new Set();
    adaptiveChallenges = adaptiveChallenges.filter(c => {
      const key = `${c.word}_${c.sentence}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, REQUIRED_LENGTH);

    // FIX: Permanently shuffle the options HERE so they don't jump around on re-renders
    adaptiveChallenges = adaptiveChallenges.map(c => ({
      ...c,
      options: shuffleArray([...c.options])
    }));

    setQueue(adaptiveChallenges);
    setCurrentIndex(0);
    setSelected(null);
    setStatus('idle');
    setRoundScore(0);
    setRoundCorrectCount(0);
    setAiExplanation('');
    setAiInsight(weakWords.length > 0
      ? `🧠 Selected ${adaptiveChallenges.length} challenges. Practicing ${Math.min(2, weakWords.length)} weak word(s).`
      : `🧠 Generating a completely random ${adaptiveChallenges.length} challenge round.`
    );

    setTimeout(() => setPhase('playing'), 1500);
  }, [profile]);

  useEffect(() => { buildAdaptiveQueue(); }, []);

  const getAIExplanation = async (challenge, selectedOption, correctAnswer) => {
    setIsLoadingExplanation(true);
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [{
            role: 'user',
            content: `You are a Tamil language tutor. A student was given this fill-in-the-blank sentence:\n"${challenge.sentence}"\n\nFor the root word "${challenge.word}" (${challenge.context}), the correct answer is "${correctAnswer}".\nBut the student incorrectly chose: "${selectedOption}"\n\nExplain WHY "${correctAnswer}" fits grammatically and contextually, and why "${selectedOption}" does not fit in 2-3 short, distinct sentences. Be encouraging.`
          }],
          max_tokens: 200,
          temperature: 0.7,
        })
      });
      const data = await response.json();
      setAiExplanation(data.choices?.[0]?.message?.content || 'Keep practicing! Review the grammatical suffixes.');
    } catch {
      setAiExplanation('Keep practicing! Look at the surrounding words for grammatical context clues.');
    }
    setIsLoadingExplanation(false);
  };

  const handleSelect = (option, correctAnswer) => {
    if (status !== 'idle') return;
    setSelected(option);
    const current = queue[currentIndex];
    const isCorrect = option === correctAnswer;
    recordAnswer(current.word, isCorrect, option, correctAnswer);

    if (isCorrect) {
      setStatus('correct');
      setRoundScore(s => s + 150);
      setRoundCorrectCount(c => c + 1);
      setAiExplanation('');
    } else {
      setStatus('incorrect');
      getAIExplanation(current, option, correctAnswer);
    }
  };

  const handleNext = () => {
    if (currentIndex >= queue.length - 1) { setPhase('complete'); return; }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setStatus('idle');
    setAiExplanation('');
  };

  if (phase === 'preparing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Brain size={64} className="text-purple" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-text">AI is analyzing your profile...</h2>
        <p className="text-text-muted">Building a personalized challenge round</p>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <Sparkles size={80} className="text-purple" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-text">AI Round Complete!</h2>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-lime">{roundCorrectCount}/{queue.length}</p>
            <p className="text-sm text-text-muted">Correct</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple">{roundScore}</p>
            <p className="text-sm text-text-muted">XP Earned</p>
          </div>
        </div>
        <button onClick={buildAdaptiveQueue} className="btn btn-sky text-lg">
          <RotateCcw size={18} /> Generate New AI Round
        </button>
      </div>
    );
  }

  const current = queue[currentIndex];
  if (!current) return null;
  
  // Options are now reliably pre-shuffled in buildAdaptiveQueue!
  const options = current.options;
  const filledSentence = fillSentence(current.sentence, current.word);
  const progress = ((currentIndex + (status !== 'idle' ? 1 : 0)) / queue.length) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {aiInsight && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-start gap-3 border-purple/30">
          <Bot size={20} className="text-purple flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-muted">{aiInsight}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        <div className="progress-track flex-1">
          <div className="progress-fill bg-purple" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-text-muted font-mono">{currentIndex + 1}/{queue.length}</span>
      </div>

      <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple/10 text-purple text-xs font-bold mb-4 uppercase tracking-wider">
          <Bot size={14} /> AI-Curated Challenge
        </div>
        <h2 className="text-4xl font-bold tamil text-purple mb-6">{current.word}</h2>
      </motion.div>

      <div className="card p-6 text-center">
        <p className="text-xl leading-relaxed tamil text-text">
          {filledSentence.split('_____').map((part, i, arr) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < arr.length - 1 && (
                <span className="px-2 py-1 mx-1 rounded-lg bg-purple/20 text-purple font-bold border-b-2 border-purple">_____</span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          let optionStyle = 'border-border hover:border-purple hover:bg-bg-elevated';
          if (status !== 'idle') {
            if (option === current.correct_answer) optionStyle = 'border-lime bg-lime/10 text-lime';
            else if (option === selected && status === 'incorrect') optionStyle = 'border-fire bg-fire/10 text-fire';
            else optionStyle = 'border-border opacity-50';
          }
          return (
            <motion.button key={`${option}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(option, current.correct_answer)} disabled={status !== 'idle'}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 font-semibold text-base transition-all ${optionStyle}`}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-bg-elevated text-text-muted text-sm font-bold mr-3 border border-border">{i + 1}</span>
              {option}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`card p-5 ${status === 'correct' ? 'border-lime/50' : 'border-fire/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {status === 'correct' ? <CheckCircle2 size={28} className="text-lime" /> : <XCircle size={28} className="text-fire" />}
                <p className={`font-bold text-lg ${status === 'correct' ? 'text-lime' : 'text-fire'}`}>
                  {status === 'correct' ? 'Correct! +150 XP' : 'Incorrect'}
                </p>
              </div>
              <button onClick={handleNext} className={`btn ${status === 'correct' ? 'btn-lime' : 'btn-fire'}`}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
            {status === 'incorrect' && (
              <div className="mt-3 p-4 rounded-xl bg-bg-elevated border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={16} className="text-purple" />
                  <span className="text-xs font-bold text-purple uppercase tracking-wider">AI Tutor Explanation</span>
                </div>
                {isLoadingExplanation ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Brain size={14} /></motion.div>
                    Thinking...
                  </div>
                ) : (
                  <p className="text-sm text-text-muted leading-relaxed">{aiExplanation}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayWithAI;
