import React, { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { Topic } from '../types';
import { CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from '../constants';
import { Info, ExternalLink } from 'lucide-react';

interface TimelineProps {
  topics: Topic[];
  onRemove: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ topics, onRemove }) => {
  const currentYear = new Date().getFullYear();

  // 1. Calculate Domain (Min Year, Max Year)
  const { minYear, maxYear } = useMemo(() => {
    if (topics.length === 0) return { minYear: currentYear - 100, maxYear: currentYear };
    
    let min = Infinity;
    let max = -Infinity;

    topics.forEach(t => {
      if (t.startYear < min) min = t.startYear;
      const end = t.endYear ?? currentYear;
      if (end > max) max = end;
    });

    // Add 10% buffer
    const range = max - min;
    const buffer = range === 0 ? 50 : range * 0.1;
    
    return { minYear: min - buffer, maxYear: max + buffer };
  }, [topics, currentYear]);

  // 2. Setup Scale
  // We map years to percentage (0 to 100)
  const timeScale = useMemo(() => {
    return scaleLinear()
      .domain([minYear, maxYear])
      .range([0, 100]);
  }, [minYear, maxYear]);

  // Generate grid ticks
  const ticks = useMemo(() => {
    return timeScale.ticks(10).map(tick => ({
      value: tick,
      left: timeScale(tick)
    }));
  }, [timeScale]);

  if (topics.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50 border-dashed">
        <p>Add a topic to start building your timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden shadow-inner mb-8">
      {/* Scroll container */}
      <div className="w-full overflow-x-auto timeline-scroll py-12 px-4 relative min-h-[400px]">
        
        {/* Grid Lines & Labels */}
        <div className="absolute top-0 bottom-0 left-4 right-4 h-full pointer-events-none opacity-20">
            {ticks.map((tick) => (
                <div 
                    key={tick.value} 
                    className="absolute top-0 bottom-0 border-l border-slate-400"
                    style={{ left: `${tick.left}%` }}
                >
                    <span className="absolute -top-6 -translate-x-1/2 text-xs font-mono text-slate-400">
                        {tick.value < 0 ? `${Math.abs(tick.value)} BC` : tick.value}
                    </span>
                </div>
            ))}
        </div>

        {/* Topics Container */}
        <div className="relative w-full h-full min-w-[600px]"> 
          {topics.map((topic, index) => {
            const startPct = timeScale(topic.startYear);
            const endVal = topic.endYear ?? currentYear;
            const endPct = timeScale(endVal);
            const widthPct = Math.max(endPct - startPct, 0.5); // Minimum width for visibility
            
            // Stagger vertical positions to reduce overlap
            const topOffset = (index * 60) % 300 + 40; 

            return (
              <div
                key={topic.id}
                className="absolute group transition-all duration-500 ease-out"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  top: `${topOffset}px`,
                }}
              >
                {/* The Bar */}
                <div 
                    className={`h-3 rounded-full ${CATEGORY_COLORS[topic.category]} cursor-pointer relative z-10 hover:h-4 transition-all`}
                >
                    {/* Tooltip / Card */}
                    <div className="absolute top-6 left-0 w-64 bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 group-hover:top-8 transition-all pointer-events-none group-hover:pointer-events-auto z-50">
                        <div className="flex justify-between items-start mb-2">
                             <h4 className={`text-sm font-bold ${CATEGORY_BORDER_COLORS[topic.category].replace('border', 'text')}`}>
                                {topic.name}
                            </h4>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemove(topic.id); }}
                                className="text-xs text-red-400 hover:text-red-300 ml-2"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="text-xs text-slate-400 mb-2 font-mono">
                            {topic.startYear < 0 ? `${Math.abs(topic.startYear)} BC` : topic.startYear} – 
                            {topic.endYear ? (topic.endYear < 0 ? ` ${Math.abs(topic.endYear)} BC` : ` ${topic.endYear}`) : ' Present'}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {topic.summary}
                        </p>
                        
                        {topic.sources.length > 0 && (
                             <div className="border-t border-slate-800 pt-2 mt-2">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Verified by Google Search</span>
                                <ul className="space-y-1">
                                    {topic.sources.map((src, idx) => (
                                        <li key={idx}>
                                            <a href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] text-cyan-600 hover:text-cyan-400 truncate">
                                                <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                                                {src.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                                {topic.category}
                            </span>
                            {topic.isEstimated && (
                                <span className="text-[10px] text-yellow-600 italic">Dates estimated</span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Label always visible on hover or if space permits (simplified for now: always visible small) */}
                <div className="absolute -top-5 left-0 whitespace-nowrap text-xs text-slate-400 font-medium opacity-70 group-hover:opacity-100 group-hover:text-white transition-opacity">
                    {topic.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;