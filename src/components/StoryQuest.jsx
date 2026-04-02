import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, MapPin, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
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

const getMeaningOptions = (item) => {
  const correctSense = item.senses.find(s => s.id === item.correct_sense_id);
  const wrongSenses = item.senses.filter(s => s.id !== item.correct_sense_id);
  const correctMeaning = correctSense?.meaning_en || 'Unknown';
  const distractorMeanings = wrongSenses.map(s => s.meaning_en);
  return { correctMeaning, distractorMeanings };
};

const fillSentence = (sentence, word) => sentence.replace(/_+/g, word);

const scenarios = [
  { id: 'school', title: 'பள்ளி (School)', emoji: '🏫', desc: 'A day at a Tamil medium school', color: 'var(--color-lime)', storyIntro: 'You are a student walking into your Tamil medium school. The teacher asks the class to read aloud. As you follow along, you encounter words with multiple meanings...' },
  { id: 'market', title: 'சந்தை (Market)', emoji: '🛒', desc: 'Shopping at the village market', color: 'var(--color-sun)', storyIntro: 'The weekly market is bustling with activity. Vendors shout, customers haggle. You overhear conversations full of polysemous Tamil words...' },
  { id: 'village', title: 'கிராமம் (Village)', emoji: '🌾', desc: 'Life in a Tamil village', color: 'var(--color-sky)', storyIntro: 'The sun rises over the paddy fields. Farmers work, children play near the river. Everyday language carries deep, context-specific meanings...' },
  { id: 'temple', title: 'கோயில் (Temple)', emoji: '🛕', desc: 'Visiting an ancient Tamil temple', color: 'var(--color-purple)', storyIntro: 'You enter the grand Meenakshi Temple. Devotional chants echo. Ancient inscriptions use Tamil words in sacred contexts...' },
  { id: 'busstand', title: 'பேருந்து நிலையம் (Bus Stand)', emoji: '🚌', desc: 'Waiting at the bus stand', color: 'var(--color-fire)', storyIntro: 'The town bus stand is a whirlwind of activity. Announcements crackle, passengers rush. You catch snippets of conversation...' },
];

const StoryQuest = () => {
  const { recordAnswer } = useUser();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [phase, setPhase] = useState('select');
  const [storyQueue, setStoryQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');
  const [storyScore, setStoryScore] = useState(0);
  const [storyCorrect, setStoryCorrect] = useState(0);

  const startScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
    const valid = challengeData.filter(c => c.senses && c.senses.length >= 2);
    const questions = shuffleArray(valid).slice(0, 4);
    setStoryQueue(questions);
    setCurrentIndex(0);
    setSelected(null);
    setStatus('idle');
    setStoryScore(0);
    setStoryCorrect(0);
    setPhase('intro');
  }, []);

  const handleSelect = (option, correctMeaning) => {
    if (status !== 'idle') return;
    setSelected(option);
    const current = storyQueue[currentIndex];
    const isCorrect = option === correctMeaning;
    recordAnswer(current.word, isCorrect, option, correctMeaning);
    if (isCorrect) { setStatus('correct'); setStoryScore(s => s + 120); setStoryCorrect(c => c + 1); }
    else { setStatus('incorrect'); }
  };

  const handleNext = () => {
    if (currentIndex >= storyQueue.length - 1) { setPhase('complete'); return; }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setStatus('idle');
  };

  if (phase === 'select') {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-text mb-2 flex items-center justify-center gap-3">
            <BookMarked className="text-sun" /> Story Quest
          </h2>
          <p className="text-text-muted text-lg">Choose a scenario to begin your contextual learning journey</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s, i) => (
            <motion.button key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => startScenario(s)} className="mode-card card p-6 text-left cursor-pointer group">
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h3 className="text-lg font-bold tamil text-text mb-1">{s.title}</h3>
              <p className="text-sm text-text-muted">{s.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: s.color }}>
                <MapPin size={14} /> Enter Scenario →
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">{selectedScenario.emoji}</motion.div>
        <h2 className="text-3xl font-display font-bold tamil text-text text-center">{selectedScenario.title}</h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card p-6 text-center">
          <p className="text-text-muted leading-relaxed text-lg">{selectedScenario.storyIntro}</p>
        </motion.div>
        <button onClick={() => setPhase('playing')} className="btn btn-lime text-lg">Start Quest <ArrowRight size={18} /></button>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <span className="text-7xl">{selectedScenario.emoji}</span>
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-text">Quest Complete!</h2>
        <div className="flex gap-8 text-center">
          <div><p className="text-3xl font-bold text-lime">{storyCorrect}/{storyQueue.length}</p><p className="text-sm text-text-muted">Correct</p></div>
          <div><p className="text-3xl font-bold text-sun">{storyScore}</p><p className="text-sm text-text-muted">Story XP</p></div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setPhase('select')} className="btn btn-ghost">Choose Another</button>
          <button onClick={() => startScenario(selectedScenario)} className="btn btn-lime"><RotateCcw size={16} /> Replay</button>
        </div>
      </div>
    );
  }

  const current = storyQueue[currentIndex];
  if (!current) return null;
  const { correctMeaning, distractorMeanings } = getMeaningOptions(current);
  const options = shuffleArray([correctMeaning, ...distractorMeanings]);
  const filledSentence = fillSentence(current.sentence, current.word);
  const progress = ((currentIndex + (status !== 'idle' ? 1 : 0)) / storyQueue.length) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{selectedScenario.emoji}</span>
        <div className="progress-track flex-1">
          <div className="progress-fill" style={{ width: `${progress}%`, background: selectedScenario.color }} />
        </div>
        <span className="text-sm text-text-muted font-mono">{currentIndex + 1}/{storyQueue.length}</span>
      </div>

      <motion.div key={currentIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: `${selectedScenario.color}20`, color: selectedScenario.color }}>
          <BookMarked size={14} /> Scene {currentIndex + 1}
        </div>
        <h2 className="text-3xl font-bold tamil text-text mb-2">{current.word}</h2>
      </motion.div>

      <div className="card p-6 text-center" style={{ borderColor: `${selectedScenario.color}30` }}>
        <p className="text-xl leading-relaxed tamil text-text">
          {filledSentence.split(current.word).map((part, i, arr) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < arr.length - 1 && (
                <span className="px-2 py-1 mx-1 rounded-lg font-bold border-b-2" style={{ background: `${selectedScenario.color}20`, color: selectedScenario.color, borderColor: selectedScenario.color }}>
                  {current.word}
                </span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option, i) => {
          let style = 'border-border hover:bg-bg-elevated';
          if (status !== 'idle') {
            if (option === correctMeaning) style = 'border-lime bg-lime/10 text-lime';
            else if (option === selected && status === 'incorrect') style = 'border-fire bg-fire/10 text-fire';
            else style = 'border-border opacity-50';
          }
          return (
            <motion.button key={`${option}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(option, correctMeaning)} disabled={status !== 'idle'}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 font-semibold ${style} transition-all`}>{option}</motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`card p-5 flex items-center justify-between ${status === 'correct' ? 'border-lime/50' : 'border-fire/50'}`}>
            <div className="flex items-center gap-3">
              {status === 'correct' ? <CheckCircle2 size={28} className="text-lime" /> : <XCircle size={28} className="text-fire" />}
              <p className={`font-bold ${status === 'correct' ? 'text-lime' : 'text-fire'}`}>
                {status === 'correct' ? 'Correct! +120 XP' : `Correct meaning: ${correctMeaning}`}
              </p>
            </div>
            <button onClick={handleNext} className={`btn ${status === 'correct' ? 'btn-lime' : 'btn-fire'}`}>Next <ArrowRight size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryQuest;
