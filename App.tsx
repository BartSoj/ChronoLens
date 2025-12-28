import React, { useState, useEffect } from 'react';
import { Topic } from './types';
import { fetchTopicData } from './services/geminiService';
import InputArea from './components/InputArea';
import Timeline from './components/Timeline';
import TopicList from './components/TopicList';
import { Clock, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTopic = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check for duplicate
      if (topics.some(t => t.name.toLowerCase() === query.toLowerCase())) {
         setError("This topic is already on the timeline.");
         setIsLoading(false);
         return;
      }

      const newTopic = await fetchTopicData(query);
      
      // Functional update to avoid stale state if user double submits somehow, 
      // though UI blocks it.
      setTopics(prev => [...prev, newTopic]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch topic data. Please try again or check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  // Add an initial example if empty on mount (optional)
  useEffect(() => {
    // We could load initial data here if desired
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="w-full py-8 px-4 flex flex-col items-center justify-center border-b border-slate-900 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                 <Clock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">
                ChronoLens
            </h1>
        </div>
        <p className="text-slate-500 text-sm max-w-md text-center">
            Visualize history with AI. Compare lifespans, eras, and technologies on a responsive scale.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center">
        
        <InputArea onAddTopic={handleAddTopic} isLoading={isLoading} />
        
        {error && (
            <div className="mb-6 flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/50 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        {/* Timeline Visualization */}
        <div className="w-full mb-12">
            <h2 className="text-lg font-semibold text-slate-300 mb-4 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Timeline View
            </h2>
            <Timeline topics={topics} onRemove={handleRemoveTopic} />
        </div>

        {/* List View */}
        <div className="w-full">
             <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-lg font-semibold text-slate-300">Topic Details</h2>
                 <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                    {topics.length} items
                 </span>
             </div>
             <TopicList topics={topics} onRemove={handleRemoveTopic} />
        </div>

      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-600 text-xs border-t border-slate-900">
        <p>Powered by Google Gemini 3 Flash Preview & Google Search Grounding</p>
      </footer>
    </div>
  );
};

export default App;