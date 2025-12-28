import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  'History': 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
  'Technology': 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]',
  'Science': 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  'Art': 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]',
  'Nature': 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
  'Pop Culture': 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]',
  'Other': 'bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]',
};

export const CATEGORY_BORDER_COLORS: Record<Category, string> = {
  'History': 'border-orange-500',
  'Technology': 'border-cyan-400',
  'Science': 'border-purple-500',
  'Art': 'border-pink-500',
  'Nature': 'border-emerald-400',
  'Pop Culture': 'border-yellow-400',
  'Other': 'border-slate-400',
};

export const INITIAL_TOPICS: string[] = [
  "The Roman Empire",
  "The Internet Age"
];