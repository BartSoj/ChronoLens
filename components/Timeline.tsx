import React, { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { Topic } from '../types';
import { CATEGORY_COLORS, CATEGORY_BORDER_COLORS } from '../constants';
import { ExternalLink } from 'lucide-react';

interface TimelineProps {
  topics: Topic[];
  onRemove: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ topics, onRemove }) => {
  const currentYear = new Date().getFullYear();

  // Filter for valid topics only
  const activeTopics = useMemo(() => {
    return topics.filter(t => t.status === 'success');
  }, [topics]);

  // 1. Calculate Domain (Min Year, Max Year)
  const { minYear, maxYear } = useMemo(() => {
    if (activeTopics.length === 0) return { minYear: currentYear - 100, maxYear: currentYear };
    
    let min = Infinity;
    let max = -Infinity;

    activeTopics.forEach(t => {
      if (t.startYear < min) min = t.startYear;
      const end = t.endYear ?? currentYear;
      if (end > max) max = end;
    });

    // Add 10% buffer
    const range = max - min;
    const buffer = range === 0 ? 50 : range * 0.1;
    
    return { minYear: min - buffer, maxYear: max + buffer };
  }, [activeTopics, currentYear]);

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

  if (activeTopics.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50 border-dashed">
        <p>Add a topic to start building your timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden shadow-inner mb-8">
      {/* Scroll container */}
      <div className="w-full overflow-x-auto timeline-scroll py-16 px-8 relative min-h-[450px]">
        
        {/* Grid Lines & Labels */}
        <div className="absolute top-0 bottom-0 left-8 right-8 h-full pointer-events-none">
            {ticks.map((tick) => (
                <div 
                    key={tick.value} 
                    className="absolute top-0 bottom-0"
                    style={{ left: `${tick.left}%` }}
                >
                    {/* Line */}
                    <div className="absolute inset-y-0 left-0 border-l border-slate-600 opacity-20"></div>
                    
                    {/* Top Label */}
                    <span className="absolute top-4 -translate-x-1/2 text-xs font-mono text-slate-500 font-semibold bg-slate-900/80 px-1 rounded">
                        {tick.value < 0 ? `${Math.abs(tick.value)} BC` : tick.value}
                    </span>

                    {/* Bottom Label (for readability on long lists) */}
                    <span className="absolute bottom-4 -translate-x-1/2 text-xs font-mono text-slate-500 font-semibold bg-slate-900/80 px-1 rounded">
                        {tick.value < 0 ? `${Math.abs(tick.value)} BC` : tick.value}
                    </span>
                </div>
            ))}
        </div>

        {/* Topics Container */}
        <div className="relative w-full h-full min-w-[700px]"> 
          {activeTopics.map((topic, index) => {
            const startPct = timeScale(topic.startYear);
            const endVal = topic.endYear ?? currentYear;
            const endPct = timeScale(endVal);
            const widthPct = Math.max(endPct - startPct, 0.5); // Minimum width for visibility
            
            // Stagger vertical positions to reduce overlap
            const topOffset = (index * 70) % 350 + 60; 

            const startLabel = topic.startYear < 0 ? `${Math.abs(topic.startYear)} BC` : topic.startYear;
            const endLabel = topic.endYear ? (topic.endYear < 0 ? `${Math.abs(topic.endYear)} BC` : topic.endYear) : 'Now';

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
                {/* Start Year Label (Left) */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                    {startLabel}
                </div>

                {/* The Bar */}
                <div 
                    className={`h-4 rounded-full ${CATEGORY_COLORS[topic.category]} cursor-pointer relative z-10 hover:h-5 hover:-translate-y-0.5 transition-all shadow-lg`}
                >
                    {/* Tooltip / Card */}
                    <div className="absolute top-8 left-0 w-72 bg-slate-950 border border-slate-700 p-4 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-50 translate-y-2 group-hover:translate-y-0">
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
                            {startLabel} – {endLabel}
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
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] text-slate-400 border border-slate-700">
                                {topic.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* End Year Label (Right) */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                    {endLabel}
                </div>
                
                {/* Topic Name Label (Above) */}
                <div className="absolute -top-6 left-0 whitespace-nowrap text-xs text-slate-300 font-semibold opacity-90 group-hover:text-white transition-colors drop-shadow-md">
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