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

export interface Topic {
  id: string;
  name: string;
  category: Category;
  startYear: number;
  endYear: number | null; // null indicates ongoing/present
  summary: string;
  sources: Source[];
  isEstimated?: boolean;
}

export interface TimelineData {
  topics: Topic[];
  minYear: number;
  maxYear: number;
}