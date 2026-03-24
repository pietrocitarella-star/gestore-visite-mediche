
import { Specialist } from './types';

export const APP_VERSION = '1.3.0';

export const CHANGELOG = [
  {
    version: '1.3.0',
    date: new Date().toISOString().split('T')[0],
    changes: [
      'Aggiunta funzionalità per tracciare le cure mediche (farmaci e tempistiche).',
      'Aggiunta visualizzazione dei prossimi 3 controlli nella dashboard (indipendentemente dai filtri).',
    ]
  },
  {
    version: '1.2.0',
    date: '2025-11-18',
    changes: [
      'Introdotto il changelog per tracciare gli aggiornamenti.',
      'Migliorata la stabilità generale dell\'applicazione.',
      'Ottimizzazione dell\'interfaccia utente.',
    ]
  },
  {
    version: '1.1.0',
    date: '2025-11-17',
    changes: [
      'Rifatta completamente la logica di importazione/esportazione.',
      'Aggiunta anteprima dei dati prima dell\'importazione.',
      'Supporto migliorato per file CSV e JSON con merging intelligente.',
      'Risolti problemi di compatibilità con il caricamento dei file.',
    ]
  },
  {
    version: '1.0.0',
    date: '2025-01-01',
    changes: [
      'Rilascio iniziale dell\'applicazione.',
      'Gestione visite, esami e specialisti.',
      'Integrazione AI per suggerimenti sulla salute.',
      'Esportazione PDF e backup dati.',
    ]
  }
];

export const DEFAULT_SPECIALISTS: Specialist[] = [
  { id: 1, name: 'Oculista', icon: '👁️', interval: 12 },
  { id: 2, name: 'Dentista', icon: '🦷', interval: 6 },
  { id: 3, name: 'Ortopedico', icon: '🦴', interval: 12 },
  { id: 4, name: 'Cardiologo', icon: '❤️', interval: 12 },
  { id: 5, name: 'Dermatologo', icon: '🩺', interval: 12 },
  { id: 6, name: 'Ginecologo', icon: '♀️', interval: 12 },
  { id: 7, name: 'Medico di base', icon: '👨‍⚕️', interval: 12 },
];
