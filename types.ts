export type Category = 
  | 'History' 
  | 'Technology' 
  | 'Science' 
  | 'Art' 
  | 'Nature' 
  | 'Pop Culture' 
  | 'Other';

export interface Source {
  title: string;
  uri: string;
}

export type TopicStatus = 'loading' | 'success' | 'error';

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  category: Category;
  startYear: number;
  endYear: number | null; // null indicates ongoing/present
  summary: string;
  sources: Source[];
  isEstimated?: boolean;
  errorMessage?: string;
}

export interface TimelineData {
  topics: Topic[];
  minYear: number;
  maxYear: number;
}