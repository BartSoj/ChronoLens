import React from 'react';
import { Topic } from '../types';
import { CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from '../constants';
import { Trash2, ExternalLink, Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';

interface TopicListProps {
  topics: Topic[];
  onRemove: (id: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onRemove }) => {
  if (topics.length === 0) return null;

  // Show newest topics first
  const sortedTopics = [...topics].reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4 pb-20">
      {sortedTopics.map((topic) => {
        // --- LOADING STATE ---
        if (topic.status === 'loading') {
          return (
            <div 
              key={topic.id} 
              className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                <span className="text-slate-400 font-medium">Analyzing "{topic.name}"...</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-3/4 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-1/2 bg-slate-800 rounded animate-pulse" />
              </div>
              {/* Optional: Cancel/Remove button for loading state */}
               <button 
                  onClick={() => onRemove(topic.id)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-slate-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          );
        }

        // --- ERROR STATE ---
        if (topic.status === 'error') {
           return (
            <div 
              key={topic.id} 
              className="bg-red-950/10 border border-red-900/50 rounded-xl p-4 relative"
            >
               <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">{topic.name}</h3>
                </div>
                <button 
                    onClick={() => onRemove(topic.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <p className="text-xs text-red-400/70 mb-2">
                {topic.errorMessage || "Failed to retrieve data."}
            </p>
            </div>
           );
        }

        // --- SUCCESS STATE ---
        return (
          <div 
              key={topic.id} 
              className={`bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors group relative overflow-hidden`}
          >
            {/* Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_COLORS[topic.category].split(' ')[0]}`} />
            
            <div className="pl-3">
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <h3 className="text-slate-200 font-semibold">{topic.name}</h3>
                      <span className="text-xs text-slate-500 font-mono">
                          {topic.startYear < 0 ? `${Math.abs(topic.startYear)} BC` : topic.startYear} – 
                          {topic.endYear ? (topic.endYear < 0 ? ` ${Math.abs(topic.endYear)} BC` : ` ${topic.endYear}`) : ' Present'}
                      </span>
                  </div>
                  <button 
                      onClick={() => onRemove(topic.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      aria-label="Remove topic"
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
              </div>
              
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {topic.summary}
              </p>

              <div className="flex flex-wrap gap-2 items-center justify-between mt-auto">
                   <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 ${CATEGORY_BORDER_COLORS[topic.category].replace('border', 'text')}`}>
                      {topic.category}
                  </span>
                  
                  {topic.sources.length > 0 && (
                       <a href={topic.sources[0].uri} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 hover:text-cyan-400 flex items-center transition-colors">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Source
                       </a>
                  )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopicList;