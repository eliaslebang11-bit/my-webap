/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gem, 
  Hammer, 
  ShoppingBag, 
  Lightbulb, 
  RotateCcw, 
  Trophy, 
  Coins, 
  Lock,
  CheckCircle2,
  XCircle,
  Menu,
  ArrowRight,
  Pickaxe,
  Compass,
  Lamp,
  Drill
} from 'lucide-react';
import { LEVELS } from './levels';

// --- Types ---
const SHOP_ITEMS = [
  { id: 'hint', name: 'Hint', icon: Lightbulb, description: 'Reveals the first letter of a random hidden word.' },
  { id: 'multiplier', name: '2x Multiplier', icon: ZapIcon, description: 'Double points for the next level.' },
  { id: 'theme_dark', name: 'Obsidian Theme', icon: Gem, description: 'Unlock the dark obsidian visual theme.' },
  { id: 'auto_fill', name: 'Auto-Fill', icon: CheckCircle2, description: 'Instantly solves one random missing word.' },
  { id: 'reveal_short', name: 'Short Reveal', icon: Lightbulb, description: 'Reveals the shortest missing word.' },
  { id: 'magnet', name: 'Letter Magnet', icon: Gem, description: 'Fills the first letter of all missing words.' },
  { id: 'pickaxe', name: 'Iron Pickaxe', icon: Hammer, description: 'Mining efficiency increased. +5% Score bonus.' },
  { id: 'helmet', name: 'Mining Helmet', icon: Lightbulb, description: 'Better visibility. Reveals 1st letter of longest word.' },
  { id: 'drill', name: 'Power Drill', icon: ZapIcon, description: 'Advanced mining. +10% Score bonus.' },
  { id: 'diamond_drill', name: 'Diamond Drill', icon: Gem, description: 'Ultimate mining tool. +20% Score bonus.' },
];

function ZapIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}

export default function App() {
  // --- State ---
  const [levelIndex, setLevelIndex] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelReward, setLevelReward] = useState(0);
  const [totalWordsFound, setTotalWordsFound] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  const currentLevel = LEVELS[levelIndex];

  // Initialize letters on level change
  useEffect(() => {
    setShuffledLetters([...currentLevel.letters].sort(() => Math.random() - 0.5));
  }, [currentLevel]);
  
  // --- Derived State ---
  const progress = useMemo(() => {
    return Math.min(100, (score / currentLevel.targetScore) * 100);
  }, [score, currentLevel]);

  const isLevelComplete = foundWords.length === currentLevel.words.length;

  // Handle Level Completion
  useEffect(() => {
    if (isLevelComplete && levelReward === 0) {
      const baseReward = 50;
      const scoreBonus = Math.floor(score / 10);
      const totalReward = baseReward + scoreBonus;
      
      setLevelReward(totalReward);
      setCoins(prev => prev + totalReward);
      
      if (currentLevel.id === maxUnlockedLevel && maxUnlockedLevel < LEVELS.length) {
        setMaxUnlockedLevel(prev => prev + 1);
      }
    }
  }, [isLevelComplete, levelReward, score, currentLevel.id, maxUnlockedLevel]);

  // Group words by length for the "boxes" display
  const wordsByLength = useMemo(() => {
    const grouped: Record<number, string[]> = {};
    currentLevel.words.forEach(word => {
      const len = word.length;
      if (!grouped[len]) grouped[len] = [];
      grouped[len].push(word);
    });
    // Sort words within groups alphabetically for consistent display
    Object.keys(grouped).forEach(key => {
        grouped[Number(key)].sort();
    });
    return grouped;
  }, [currentLevel]);

  // --- Handlers ---
  const handleLetterClick = (letter: string, index: number) => {
    if (currentInput.length < 8) {
      setCurrentInput(prev => prev + letter);
    }
  };

  const handleBackspace = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentInput) return;
    
    const word = currentInput.toUpperCase();
    
    if (foundWords.includes(word)) {
      showMessage("Already found!", 'info');
      setCurrentInput('');
      return;
    }

    if (currentLevel.words.includes(word)) {
      // Success!
      let bonus = 1;
      if (inventory.includes('pickaxe')) bonus += 0.05;
      if (inventory.includes('drill')) bonus += 0.10;
      if (inventory.includes('diamond_drill')) bonus += 0.20;

      const wordScore = Math.floor(word.length * 10 * (multiplierActive ? 2 : 1) * bonus);
      
      setFoundWords(prev => [...prev, word]);
      setTotalWordsFound(prev => prev + 1);
      setScore(prev => prev + wordScore);
      // Coins are now awarded on level completion
      showMessage(`+${wordScore} pts`, 'success');
      setCurrentInput('');
      
      if (multiplierActive) setMultiplierActive(false);
    } else {
      showMessage("Not in word list", 'error');
      setCurrentInput('');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const buyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (item.id === 'multiplier') {
      setMultiplierActive(true);
      showMessage("2x Multiplier Active!", 'success');
    } else if (item.id === 'theme_dark') {
      if (inventory.includes('theme_dark')) {
        showMessage("Already owned", 'info');
      } else {
        setInventory(prev => [...prev, 'theme_dark']);
        showMessage("Theme Unlocked!", 'success');
      }
    } else if (item.id === 'hint' || item.id === 'auto_fill' || item.id === 'reveal_short' || item.id === 'magnet') {
      useFreeTool(item as any);
    } else {
      // Mastery items
      if (inventory.includes(item.id)) {
        showMessage("Already equipped!", 'info');
      } else {
        setInventory(prev => [...prev, item.id]);
        showMessage(`${item.name} Equipped!`, 'success');
      }
    }
  };

  const useFreeTool = (tool: typeof SHOP_ITEMS[0]) => {
    if (tool.id === 'hint') {
      const missing = currentLevel.words.filter(w => !foundWords.includes(w) && !revealedHints.includes(w));
      if (missing.length > 0) {
        const randomWord = missing[Math.floor(Math.random() * missing.length)];
        setRevealedHints(prev => [...prev, randomWord]);
        showMessage(`Hint revealed for a ${randomWord.length}-letter word!`, 'info');
      } else {
        const stillMissing = currentLevel.words.filter(w => !foundWords.includes(w));
        if (stillMissing.length > 0) {
           showMessage("All missing words already have hints!", 'info');
        } else {
           showMessage("All words found!", 'info');
        }
      }
    } else if (tool.id === 'auto_fill') {
      const missing = currentLevel.words.filter(w => !foundWords.includes(w));
      if (missing.length > 0) {
        const randomWord = missing[Math.floor(Math.random() * missing.length)];
        setFoundWords(prev => [...prev, randomWord]);
        setScore(prev => prev + (randomWord.length * 10));
        showMessage(`Auto-filled: ${randomWord}`, 'success');
      }
    } else if (tool.id === 'reveal_short') {
      const missing = currentLevel.words.filter(w => !foundWords.includes(w));
      if (missing.length > 0) {
        const shortest = missing.reduce((a, b) => a.length <= b.length ? a : b);
        setFoundWords(prev => [...prev, shortest]);
        setScore(prev => prev + (shortest.length * 10));
        showMessage(`Revealed: ${shortest}`, 'success');
      }
    } else if (tool.id === 'magnet') {
      const missing = currentLevel.words.filter(w => !foundWords.includes(w));
      if (missing.length > 0) {
        setRevealedHints(prev => [...new Set([...prev, ...missing])]);
        showMessage("Magnetized! All first letters revealed.", 'success');
      }
    }
  };

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
      setFoundWords([]);
      setScore(0);
      setCurrentInput('');
      setMultiplierActive(false);
      setLevelReward(0); // Reset reward state
      setRevealedHints([]); // Reset hints
    } else {
      showMessage("All levels complete!", 'success');
    }
  };

  const shuffleLetters = () => {
    setShuffledLetters(prev => [...prev].sort(() => Math.random() - 0.5));
    showMessage("Shuffled!", 'info');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLevelMenu(true)}
            className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 shadow-amber-500/20 shadow-lg hover:bg-amber-400 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-amber-500">LexiMine</h1>
            <p className="text-xs text-slate-500 font-mono">Level {currentLevel.id} / {LEVELS.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
               <Coins size={16} />
               <span>{coins}</span>
             </div>
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Gold</span>
          </div>
          
          <button 
            onClick={() => setShowShop(!showShop)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors relative"
          >
            <ShoppingBag size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 overflow-hidden">
        
        {/* Left Panel: Word Grid (The "Boxes") */}
        <section className="flex-1 bg-slate-800/30 border border-slate-700 rounded-2xl p-6 overflow-y-auto custom-scrollbar order-1">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
               <Gem size={14} /> Collection
             </h3>
             <span className="text-xs text-slate-500">{foundWords.length} / {currentLevel.words.length} found</span>
          </div>

          <div className="space-y-6">
            {Object.entries(wordsByLength).sort((a, b) => Number(a[0]) - Number(b[0])).map(([length, words]) => (
              <div key={length} className="space-y-2">
                <div className="text-xs font-mono text-slate-600 border-b border-slate-800 pb-1 mb-2">{length} LETTERS</div>
                <div className="flex flex-wrap gap-3">
                  {(words as string[]).map((word, idx) => {
                    const isFound = foundWords.includes(word);
                    const isRevealed = revealedHints.includes(word);
                    return (
                      <div 
                        key={word} 
                        className={`
                          flex gap-1 p-1 rounded-md transition-all duration-500
                          ${isFound ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'}
                          border
                        `}
                      >
                        {word.split('').map((char, charIdx) => {
                          const showHint = isRevealed && charIdx === 0 && !isFound;
                          return (
                            <div 
                              key={charIdx}
                              className={`
                                w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded font-bold text-lg
                                ${isFound 
                                  ? 'bg-amber-500 text-slate-900 shadow-sm' 
                                  : showHint
                                    ? 'bg-slate-700 text-amber-500 border border-amber-500/50'
                                    : 'bg-slate-800 text-transparent'}
                              `}
                            >
                              {isFound ? char : showHint ? char : ''}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Panel: Game Controls */}
        <section className="w-full md:w-[400px] flex flex-col items-center justify-end md:justify-center relative order-2 shrink-0">
          
          {/* Message Toast */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`absolute top-0 md:-top-12 px-6 py-2 rounded-full font-bold text-sm shadow-xl z-20 flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-green-500 text-slate-950' : 
                  message.type === 'error' ? 'bg-red-500 text-white' : 
                  'bg-blue-500 text-white'
                }`}
              >
                {message.type === 'success' && <CheckCircle2 size={16} />}
                {message.type === 'error' && <XCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Complete Overlay */}
          <AnimatePresence>
            {isLevelComplete && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 p-6 text-center"
              >
                <Trophy size={64} className="text-amber-500 mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-white mb-2">CONGRATULATIONS!</h2>
                <p className="text-slate-400 mb-4">Level {currentLevel.id} Complete</p>
                
                <div className="bg-slate-800 rounded-xl p-4 mb-8 w-full max-w-xs border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Reward Earned</p>
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-amber-400">
                    <Coins size={28} />
                    <span>+{levelReward}</span>
                  </div>
                </div>

                <button
                  onClick={nextLevel}
                  className="px-8 py-4 bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all text-lg w-full"
                >
                  Next Level <ArrowRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Display */}
          <div className="mb-8 h-16 flex items-center justify-center gap-2 w-full">
            {currentInput.split('').map((char, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-10 h-12 md:w-12 md:h-14 bg-slate-800 border-b-4 border-amber-500 rounded flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg"
              >
                {char}
              </motion.div>
            ))}
            {currentInput.length === 0 && !isLevelComplete && (
              <span className="text-slate-600 animate-pulse font-mono text-sm">TAP LETTERS</span>
            )}
          </div>

          {/* Letter Wheel */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 shrink-0">
             {/* Center Decoration */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full border border-slate-700" />
             </div>

             {/* Letters */}
             {shuffledLetters.map((letter, i) => {
               const total = shuffledLetters.length;
               const angle = (i * (360 / total)) - 90;
               const radius = 110; // px
               const x = Math.cos((angle * Math.PI) / 180) * radius;
               const y = Math.sin((angle * Math.PI) / 180) * radius;

               return (
                 <motion.button
                   key={`${letter}-${i}`}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => handleLetterClick(letter, i)}
                   className="absolute w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-amber-500/30 border-2 border-amber-300"
                   style={{
                     left: `calc(50% + ${x}px - 2rem)`,
                     top: `calc(50% + ${y}px - 2rem)`,
                   }}
                 >
                   {letter}
                 </motion.button>
               );
             })}
          </div>

          {/* Controls */}
          <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={handleBackspace}
              className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              DEL
            </button>
            <button 
              onClick={shuffleLetters}
              className="px-4 bg-slate-800 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 py-4 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              ENTER
            </button>
          </div>

        </section>
      </main>

      {/* Level Menu Modal */}
      <AnimatePresence>
        {showLevelMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLevelMenu(false)}
          >
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h2 className="text-xl font-bold text-white">Level Select</h2>
                <button onClick={() => setShowLevelMenu(false)}><XCircle className="text-slate-500 hover:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 md:grid-cols-6 gap-4">
                {LEVELS.map((level) => {
                  const isLocked = level.id > maxUnlockedLevel;
                  const isCurrent = level.id === levelIndex + 1;
                  const isCompleted = level.id < maxUnlockedLevel || (level.id === maxUnlockedLevel && isLevelComplete);

                  return (
                    <button
                      key={level.id}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          setLevelIndex(level.id - 1);
                          setFoundWords([]);
                          setScore(0);
                          setCurrentInput('');
                          setShowLevelMenu(false);
                          setMultiplierActive(false);
                          setLevelReward(0);
                          setRevealedHints([]);
                        }
                      }}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden
                        ${isCurrent 
                          ? 'border-amber-500 bg-amber-500/20 text-amber-500' 
                          : isLocked
                            ? 'border-slate-800 bg-slate-950 text-slate-700 cursor-not-allowed opacity-50'
                            : 'border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20'}
                      `}
                    >
                      {isLocked ? (
                        <Lock size={20} />
                      ) : (
                        <>
                          <span className="text-lg font-bold">{level.id}</span>
                          {isCompleted && !isCurrent && <CheckCircle2 size={12} className="absolute bottom-2" />}
                          {isCurrent && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 animate-pulse" />}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal Overlay */}
      <AnimatePresence>
        {showShop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShop(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
                  <ShoppingBag /> Free Tools & Upgrades
                </h2>
                <button onClick={() => setShowShop(false)} className="text-slate-500 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                <p className="text-xs text-slate-500 italic mb-4">All mining equipment and tools are free! Equip them to help you solve words faster.</p>
                {SHOP_ITEMS.map(item => {
                  const isOwned = inventory.includes(item.id);
                  const isConsumable = ['hint', 'multiplier', 'auto_fill', 'reveal_short', 'magnet'].includes(item.id);
                  const isDisabled = isOwned && !isConsumable;

                  return (
                    <button
                      key={item.id}
                      onClick={() => buyItem(item)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all group text-left ${
                        isDisabled 
                          ? 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed' 
                          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                        isOwned ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 group-hover:text-amber-500'
                      }`}>
                        <item.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${isOwned ? 'text-amber-400' : 'text-slate-200'}`}>{item.name}</h4>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase ${isOwned && !isConsumable ? 'text-slate-600' : 'text-green-500'}`}>
                          {isOwned && !isConsumable ? 'Equipped' : 'FREE'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                <button 
                  onClick={() => setShowShop(false)}
                  className="text-slate-500 hover:text-white text-sm font-medium"
                >
                  Close Shop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

