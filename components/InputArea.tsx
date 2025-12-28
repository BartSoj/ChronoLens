import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

interface InputAreaProps {
  onAddTopic: (query: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onAddTopic }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onAddTopic(query);
    setQuery(''); // Immediately clear input
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <form onSubmit={handleSubmit} className="relative group">
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
    </div>
  );
};

export default InputArea;