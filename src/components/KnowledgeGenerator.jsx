import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Loader2, BookOpen, AlertCircle, RefreshCw, Send } from 'lucide-react';

// Import our offline generated Knowledge Graph database
import localKG from '../data/local_kg_db.json';

// Dynamically extract unique seed words from the database
const SEED_WORDS = [...new Set(localKG.map(entry => entry.word))];

const KnowledgeGenerator = () => {
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kgData, setKgData] = useState(null);

  const generateKG = (wordToQuery) => {
    const targetWord = wordToQuery || inputWord.trim();
    if (!targetWord) return;

    setLoading(true);
    setError(null);
    setKgData(null);
    setInputWord(targetWord);

    // Simulate a tiny delay for UI transition smoothness, but data is instantly local
    setTimeout(() => {
      // Find all entries matching the word in the flat JSON array
      const matchingEntries = localKG.filter(entry => entry.word === targetWord);

      if (matchingEntries.length > 0) {
        // Reshape the flat data back into the grouped component structure we need
        setKgData({
          input_word: targetWord,
          senses: matchingEntries.map(entry => ({
            context: `${entry.pos.charAt(0).toUpperCase() + entry.pos.slice(1)}: ${entry.sense}`,
            challenge: entry.question,
            options: entry.options,
            answer: entry.answer
          }))
        });
      } else {
        setError(`"${targetWord}" is not in our Learn Base yet. Please try one of the active words below!`);
      }
      setLoading(false);
    }, 400); // 400ms micro-interaction delay
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-glow flex items-center justify-center">
          <Brain size={28} className="text-purple" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-text">Learn Mode</h2>
          <p className="text-text-muted text-sm">Query ambiguous Tamil words instantly to master their meanings</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="card p-6 flex flex-col gap-6">
        <div className="relative">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateKG()}
            placeholder="Type a Tamil word to explore its meanings..."
            className="w-full bg-bg border-2 border-border rounded-xl px-5 py-4 pl-12 text-lg focus:outline-none focus:border-purple transition-colors font-tamil"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          
          <button
            onClick={() => generateKG()}
            disabled={!inputWord.trim() || loading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 btn ${inputWord.trim() && !loading ? 'btn-sky glow-sky' : 'bg-bg-elevated text-text-muted cursor-not-allowed'} !py-2 !px-4`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            <span className="hidden sm:inline">Learn</span>
          </button>
        </div>

        {/* Seed Words */}
        <div>
          <p className="text-sm font-semibold pl-1 mb-3 text-text-muted">Try these words:</p>
          <div className="flex flex-wrap gap-2">
            {SEED_WORDS.map(word => (
              <button
                key={word}
                onClick={() => generateKG(word)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-sm font-tamil text-text-muted hover:text-text hover:border-border-active transition-all disabled:opacity-50"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* States */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-fire-glow border border-fire text-white flex items-center gap-3">
          <AlertCircle size={20} className="text-fire shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </motion.div>
      )}

      {loading && (
        <div className="card p-12 flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Loader2 className="animate-spin text-sky absolute" size={40} />
            <Brain className="text-purple animate-pulse" size={20} />
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-lg text-text">Scanning Database...</h3>
            <p className="text-text-muted text-sm mt-1">Retrieving semantic contexts for "{inputWord}"</p>
          </div>
        </div>
      )}

      {/* Results */}
      {kgData && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-text flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-lime block"></span>
              Results for "<span className="text-lime tamil">{kgData.input_word}</span>"
            </h3>
            <span className="px-3 py-1 bg-bg-elevated rounded-full text-xs font-bold text-text-muted">
              {kgData.senses?.length || 0} Contexts Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kgData.senses?.map((sense, idx) => (
              <div key={idx} className="card-elevated p-5 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-glow rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-20 group-hover:opacity-100"></div>
                
                <div className="flex items-center gap-2 relative z-10">
                  <div className="px-2.5 py-1 rounded-md bg-purple-glow border border-purple/30 text-purple font-bold text-xs uppercase tracking-wider">
                    Context {idx + 1}
                  </div>
                  <span className="font-medium text-text text-sm ml-1">{sense.context}</span>
                </div>

                <div className="bg-bg rounded-lg p-4 border border-border relative z-10">
                  <p className="font-tamil text-lg font-medium text-text leading-relaxed">
                    {sense.challenge}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 relative z-10">
                  {sense.options?.map((opt, i) => {
                    const isCorrect = opt === sense.answer;
                    return (
                      <div 
                        key={i} 
                        className={`text-center py-2 px-3 rounded-lg border text-sm font-tamil font-medium transition-colors
                          ${isCorrect ? 'bg-lime-glow border-lime text-lime' : 'bg-bg border-border text-text-muted'}`}
                      >
                        {opt} {isCorrect && '✓'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default KnowledgeGenerator;
