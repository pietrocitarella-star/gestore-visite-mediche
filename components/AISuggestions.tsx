
import React, { useState, useCallback } from 'react';
import { Visit, Exam, Specialist } from '../types';
import { getHealthInsights } from '../services/geminiService';
import { BotIcon } from './icons';

interface AISuggestionsProps {
  visits: Visit[];
  exams: Exam[];
  specialists: Specialist[];
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ visits, exams, specialists }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateInsights = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await getHealthInsights(visits, exams, specialists);
      setInsights(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [visits, exams, specialists]);

  return (
    <div className="space-y-6">
      <div className="text-center bg-purple-50 p-6 rounded-2xl border border-purple-200">
        <h2 className="text-2xl font-bold text-accent mb-2">Health Insights con AI</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ottieni un'analisi intelligente della tua cronologia medica. La nostra AI ti fornirà suggerimenti personalizzati, ti aiuterà a identificare pattern e a prepararti per le prossime visite.
        </p>
        <button
          onClick={handleGenerateInsights}
          disabled={isLoading}
          className="mt-6 inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisi in corso...
            </>
          ) : (
            <>
              <BotIcon />
              Genera Riepilogo AI
            </>
          )}
        </button>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

      {insights && (
        <div className="bg-white p-6 rounded-2xl shadow-md border">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Il tuo Riepilogo AI</h3>
          <div className="prose prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
