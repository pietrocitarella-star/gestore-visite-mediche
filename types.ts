
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

export interface Treatment {
  id: number;
  specialistId: number;
  name: string; // Nome della cura
  medications: string; // Farmaci
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes: string;
}

export type Tab = 'dashboard' | 'visits' | 'exams' | 'treatments' | 'ai' | 'specialists';
