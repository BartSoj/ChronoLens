import React, { useState, useEffect } from 'react';
import { Topic, Category } from './types';
import { fetchTopicData, fetchSuggestions } from './services/geminiService';
import InputArea from './components/InputArea';
import Timeline from './components/Timeline';
import TopicList from './components/TopicList';
import { Clock } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // Effect to generate suggestions when valid topics change
  useEffect(() => {
    const validTopics = topics.filter(t => t.status === 'success');
    
    // Don't fetch if we have no valid context or if the last action was just removing everything
    if (validTopics.length === 0) {
      setSuggestions([]);
      return;
    }

    // Debounce slightly to avoid rapid API calls if multiple things happen at once,
    // though purely functional is fine for MVP.
    // We only fetch if the list length implies we have enough context or it changed significantly.
    // For now, simple trigger:
    
    const getSuggestions = async () => {
      setIsSuggestionsLoading(true);
      try {
        const newSuggestions = await fetchSuggestions(validTopics);
        setSuggestions(newSuggestions);
      } catch (e) {
        console.error("Failed to get suggestions", e);
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    getSuggestions();
  }, [topics.length, topics.map(t => t.status).join(',')]); 
  // Dependency explanation: We trigger when count changes (add/remove) or when a status changes (loading -> success)

  const handleAddTopic = (query: string) => {
    // 1. Check for duplicates immediately
    if (topics.some(t => t.name.toLowerCase() === query.toLowerCase())) {
        return;
    }

    const tempId = generateId();

    // 2. Add placeholder topic (Loading State)
    const newPlaceholder: Topic = {
        id: tempId,
        name: query, // Use query as temporary name
        status: 'loading',
        // Default dummy values for required fields during loading
        category: 'Other' as Category,
        startYear: 0,
        endYear: 0,
        summary: '',
        sources: []
    };

    setTopics(prev => [...prev, newPlaceholder]);

    // 3. Trigger Async Fetch (Fire and forget from UI perspective)
    fetchTopicData(query)
        .then((data) => {
            // Update the specific topic with real data
            setTopics(prev => prev.map(t => {
                if (t.id === tempId) {
                    return {
                        ...t,
                        ...data,
                        status: 'success'
                    };
                }
                return t;
            }));
        })
        .catch((err) => {
            console.error("Error fetching topic:", err);
            // Update topic to error state
            setTopics(prev => prev.map(t => {
                if (t.id === tempId) {
                    return {
                        ...t,
                        status: 'error',
                        errorMessage: "Failed to find data. Please try again."
                    };
                }
                return t;
            }));
        });
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

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
        
        {/* Input Area with Suggestions */}
        <InputArea 
            onAddTopic={handleAddTopic} 
            suggestions={suggestions}
            loadingSuggestions={isSuggestionsLoading}
        />
        
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