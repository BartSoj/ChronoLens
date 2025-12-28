import React, { useState } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onAddTopic: (query: string) => void;
  suggestions?: string[];
  loadingSuggestions?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onAddTopic, suggestions = [], loadingSuggestions = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onAddTopic(query);
    setQuery(''); // Immediately clear input
  };

  const handleSuggestionClick = (suggestion: string) => {
    onAddTopic(suggestion);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4 flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="relative group z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-md"></div>
        <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-2xl transition-all focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600">
          <Search className="ml-4 text-slate-500 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a topic (e.g., 'The Samurai', 'Bitcoin')..."
            className="w-full bg-transparent text-slate-100 px-4 py-4 focus:outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="mr-2 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </form>

      {/* Suggestions Area */}
      {(suggestions.length > 0 || loadingSuggestions) && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-3 h-3 text-cyan-500 ${loadingSuggestions ? 'animate-spin' : ''}`} />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {loadingSuggestions ? 'Generating Suggestions...' : 'Suggested for you'}
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 text-sm rounded-full transition-all duration-300 cursor-pointer select-none"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputArea;