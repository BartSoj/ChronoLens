import React from 'react';
import { Topic } from '../types';
import { CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from '../constants';
import { Trash2, ExternalLink } from 'lucide-react';

interface TopicListProps {
  topics: Topic[];
  onRemove: (id: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onRemove }) => {
  if (topics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4 pb-20">
      {topics.map((topic) => (
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
      ))}
    </div>
  );
};

export default TopicList;