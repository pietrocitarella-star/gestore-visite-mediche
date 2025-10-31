
export interface Specialist {
  id: number;
  name: string;
  icon: string;
  interval: number; // in months
}

export interface Visit {
  id: number;
  specialistId: number;
  date: string; // YYYY-MM-DD
  notes: string;
  cost: number;
}

export interface Exam {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD
  specialistId: number | null;
  results: string;
  notes: string;
  cost: number;
}

export type Tab = 'dashboard' | 'visits' | 'exams' | 'ai' | 'specialists';
