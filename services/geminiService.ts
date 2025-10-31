
import { GoogleGenAI } from "@google/genai";
import { Visit, Exam, Specialist } from '../types';

export async function getHealthInsights(visits: Visit[], exams: Exam[], specialists: Specialist[]): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const specialistMap = specialists.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<number, string>);

  const visitsData = visits.map(v => ({
    specialist: specialistMap[v.specialistId] || 'Unknown',
    date: v.date,
    notes: v.notes,
  }));

  const examsData = exams.map(e => ({
    name: e.name,
    date: e.date,
    results: e.results,
  }));

  const prompt = `
    Analyze the following medical history and provide personalized health insights in Italian.
    The user is tracking their medical visits and exams.
    Based on the data, provide:
    1. A brief, positive, and encouraging summary of their health tracking efforts.
    2. A section on "Suggerimenti Proattivi" (Proactive Suggestions) highlighting any upcoming check-ups based on standard intervals (e.g., Dentist every 6 months, Eye doctor every 12 months).
    3. A section on "Pattern Emergenti" (Emerging Patterns) if you notice any interesting connections or recurring themes in their notes or results. Be careful and do not provide medical advice.
    4. A section with "Domande Utili per il Tuo Medico" (Useful Questions for Your Doctor) to help them prepare for their next appointment.

    IMPORTANT: Do NOT provide any medical diagnosis or definitive advice. Phrase everything as suggestions, questions to ask a professional, or patterns to discuss with a doctor. Use a friendly, clear, and supportive tone.
    Format the output as clean markdown.

    Medical History:
    Specialists and their recommended check-up intervals (in months):
    ${specialists.map(s => `- ${s.name}: every ${s.interval} months`).join('\n')}

    Visits:
    ${JSON.stringify(visitsData, null, 2)}

    Exams:
    ${JSON.stringify(examsData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Mi dispiace, si è verificato un errore durante l'analisi dei dati. Per favore, riprova più tardi.";
  }
}
