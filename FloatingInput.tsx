import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Tag, 
  Flag, 
  CornerDownLeft, 
  Sparkles,
  Clock,
  Hash
} from 'lucide-react';
import { cn } from '../utils/cn';
import { PriorityLevel } from '../types';

interface FloatingInputProps {
  onAddTask: (text: string, priority: PriorityLevel, tag?: string) => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ onAddTask }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('medium');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to blur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    onAddTask(inputValue, selectedPriority, selectedTag);
    setInputValue('');
    setSelectedPriority('medium');
    setSelectedTag(undefined);
    // Keep focus for rapid entry if needed, or blur. Let's keep focus.
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const priorityColors = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    high: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 px-4 z-50 flex justify-center pointer-events-none">
      <div 
        ref={containerRef}
        className={cn(
          "w-full max-w-2xl pointer-events-auto transition-all duration-500 ease-out",
          isFocused ? "translate-y-0" : "translate-y-0"
        )}
      >
        <motion.div
          layout
          className="relative group"
          initial={false}
          animate={isFocused ? "focused" : "idle"}
        >
          {/* Animated Glow / Stroke Background */}
          <motion.div
            className="absolute -inset-0.5 rounded-2xl opacity-0 blur-md transition-opacity duration-500"
            variants={{
              idle: { opacity: 0 },
              focused: { opacity: 1 }
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-shimmer bg-[length:200%_100%]" />
          </motion.div>

          {/* Main Input Container */}
          <motion.div 
            layout
            className={cn(
              "relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300",
              isFocused ? "border-transparent bg-slate-900" : "hover:border-slate-600"
            )}
            style={{ borderRadius: 16 }} // Fix for framer motion layout border radius issues
          >
            <div className="flex items-center px-4 py-4 md:px-6 md:py-5 gap-3">
              <motion.div 
                layout
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-300",
                  isFocused ? "text-blue-400" : "text-slate-500"
                )}
              >
                {isFocused ? <Sparkles size={20} /> : <Plus size={20} />}
              </motion.div>
              
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDownInput}
                placeholder={isFocused ? "What needs to be done?" : "Press '/' to add task"}
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-lg md:text-xl font-light"
                autoComplete="off"
              />

              <AnimatePresence>
                {!isFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="hidden md:flex items-center gap-1.5"
                  >
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 rounded-md border border-slate-700">
                      <span className="text-[10px]">⌘</span> /
                    </kbd>
                  </motion.div>
                )}
                {isFocused && (
                   <motion.button
                   initial={{ opacity: 0, scale: 0.8, x: 10 }}
                   animate={{ opacity: 1, scale: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.8, x: 10 }}
                   onClick={() => handleSubmit()}
                   disabled={!inputValue.trim()}
                   className={cn(
                     "p-2 rounded-lg transition-all duration-200",
                     inputValue.trim() 
                       ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600" 
                       : "bg-slate-800 text-slate-500 cursor-not-allowed"
                   )}
                 >
                   <CornerDownLeft size={20} />
                 </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Expandable Chips Section */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-800/50"
                >
                  <div className="px-4 py-3 md:px-6 bg-slate-900/50 flex flex-wrap gap-2 items-center">
                    
                    {/* Priority Selector */}
                    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setSelectedPriority(p)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize flex items-center gap-1.5",
                            selectedPriority === p 
                              ? priorityColors[p] + " shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          )}
                        >
                          <Flag size={12} className={cn(selectedPriority === p ? "fill-current" : "")} />
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-6 bg-slate-700/50 mx-1" />

                    {/* Quick Tags */}
                    <button
                      onClick={() => setSelectedTag(selectedTag === 'Personal' ? undefined : 'Personal')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200",
                        selectedTag === 'Personal'
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:border-slate-600"
                      )}
                    >
                      <Tag size={12} />
                      Personal
                    </button>
                    
                    <button
                       onClick={() => setSelectedTag(selectedTag === 'Work' ? undefined : 'Work')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200",
                        selectedTag === 'Work'
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:border-slate-600"
                      )}
                    >
                      <Hash size={12} />
                      Work
                    </button>

                    <div className="flex-1" />
                    
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">
                        <Clock size={12} />
                        Due Today
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FloatingInput;
