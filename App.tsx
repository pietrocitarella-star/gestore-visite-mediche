
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Visit, Exam, Specialist, Tab } from './types';
import { storageService } from './services/storageService';
import { DEFAULT_SPECIALISTS } from './constants';
import Modal from './components/Modal';
import AISuggestions from './components/AISuggestions';
import { PlusIcon, DownloadIcon, DashboardIcon, VisitsIcon, ExamsIcon, BotIcon, ActivityIcon, UploadIcon, PencilIcon, CopyIcon, TrashIcon, SpecialistsIcon, FileDown, CalendarCheckIcon, FilterIcon, SearchIcon, FileText } from './components/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isIconPickerModalOpen, setIsIconPickerModalOpen] = useState(false);
  
  // Import Preview State
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<{
      newVisits: Visit[];
      newExams: Exam[];
      newSpecialists: Specialist[];
      totalFound: { visits: number, exams: number, specialists: number };
  } | null>(null);


  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);

  const [visitFormState, setVisitFormState] = useState<Omit<Visit, 'id'>>({ specialistId: 0, date: '', notes: '', cost: 0 });
  const [examFormState, setExamFormState] = useState<Omit<Exam, 'id'>>({ name: '', date: '', specialistId: null, results: '', notes: '', cost: 0 });
  const [specialistFormState, setSpecialistFormState] = useState<Omit<Specialist, 'id'>>({ name: '', icon: '', interval: 12 });
  
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'visit' | 'exam' | 'specialist' } | null>(null);

  const importFileRef = useRef<HTMLInputElement>(null);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  useEffect(() => {
    setVisits(storageService.get<Visit[]>('visits') || []);
    setExams(storageService.get<Exam[]>('exams') || []);
    setSpecialists(storageService.get<Specialist[]>('specialists') || DEFAULT_SPECIALISTS);
  }, []);

  const sortedVisits = useMemo(() => [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [visits]);
  const sortedExams = useMemo(() => [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [exams]);
  const sortedSpecialists = useMemo(() => [...specialists].sort((a, b) => a.name.localeCompare(b.name)), [specialists]);

  // Modal Openers
  const openAddVisitModal = () => {
    setEditingVisit(null);
    setVisitFormState({ specialistId: specialists[0]?.id || 1, date: new Date().toISOString().split('T')[0], notes: '', cost: 0 });
    setIsVisitModalOpen(true);
  }

  const openEditVisitModal = (visit: Visit) => {
    setEditingVisit(visit);
    setVisitFormState(visit);
    setIsVisitModalOpen(true);
  }
  
  const openCopyVisitModal = (visit: Visit) => {
    setEditingVisit(null);
    const { id, ...visitData } = visit;
    setVisitFormState({ ...visitData, date: new Date().toISOString().split('T')[0]});
    setIsVisitModalOpen(true);
  }

  const openAddExamModal = () => {
    setEditingExam(null);
    setExamFormState({ name: '', date: new Date().toISOString().split('T')[0], specialistId: null, results: '', notes: '', cost: 0 });
    setIsExamModalOpen(true);
  }
  
  const openEditExamModal = (exam: Exam) => {
    setEditingExam(exam);
    setExamFormState(exam);
    setIsExamModalOpen(true);
  }
  
  const openCopyExamModal = (exam: Exam) => {
    setEditingExam(null);
    const { id, ...examData } = exam;
    setExamFormState({ ...examData, date: new Date().toISOString().split('T')[0]});
    setIsExamModalOpen(true);
  }
  
  const openAddSpecialistModal = () => {
    setEditingSpecialist(null);
    setSpecialistFormState({ name: '', icon: '🧑‍⚕️', interval: 12 });
    setIsSpecialistModalOpen(true);
  }
  
  const openEditSpecialistModal = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    setSpecialistFormState(specialist);
    setIsSpecialistModalOpen(true);
  }

  // CRUD Operations
  const saveVisit = () => {
    if (!visitFormState.specialistId || !visitFormState.date) {
      alert('Per favore, compila specialista e data.');
      return;
    }
    setVisits(currentVisits => {
      const updatedVisits = editingVisit
        ? currentVisits.map(v => v.id === editingVisit.id ? { ...visitFormState, id: v.id } : v)
        : [...currentVisits, { ...visitFormState, id: generateId() }];
      storageService.set('visits', updatedVisits);
      return updatedVisits;
    });
    setIsVisitModalOpen(false);
  };
  
  const saveExam = () => {
    if (!examFormState.name || !examFormState.date) {
      alert('Per favore, compila nome e data.');
      return;
    }
    setExams(currentExams => {
      const updatedExams = editingExam
        ? currentExams.map(e => e.id === editingExam.id ? { ...examFormState, id: e.id } : e)
        : [...currentExams, { ...examFormState, id: generateId() }];
      storageService.set('exams', updatedExams);
      return updatedExams;
    });
    setIsExamModalOpen(false);
  };
  
  const saveSpecialist = () => {
      if (!specialistFormState.name || !specialistFormState.icon || !specialistFormState.interval) {
          alert('Per favore, compila tutti i campi.');
          return;
      }
      setSpecialists(currentSpecialists => {
        const updatedSpecialists = editingSpecialist
          ? currentSpecialists.map(s => s.id === editingSpecialist.id ? { ...specialistFormState, id: s.id } : s)
          : [...currentSpecialists, { ...specialistFormState, id: generateId() }];
        storageService.set('specialists', updatedSpecialists);
        return updatedSpecialists;
      });
      setIsSpecialistModalOpen(false);
  }

  const requestDelete = (id: number, type: 'visit' | 'exam' | 'specialist') => {
    setItemToDelete({ id, type });
  };
  
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
        case 'visit':
            setVisits(current => {
                const updated = current.filter(v => v.id !== itemToDelete.id);
                storageService.set('visits', updated);
                return updated;
            });
            break;
        case 'exam':
            setExams(current => {
                const updated = current.filter(e => e.id !== itemToDelete.id);
                storageService.set('exams', updated);
                return updated;
            });
            break;
        case 'specialist':
            if (visits.some(v => v.specialistId === itemToDelete.id) || exams.some(e => e.specialistId === itemToDelete.id)) {
                alert('Impossibile eliminare uno specialista associato a visite o esami esistenti.');
                setItemToDelete(null);
                return;
            }
            setSpecialists(current => {
                const updated = current.filter(s => s.id !== itemToDelete.id);
                storageService.set('specialists', updated);
                return updated;
            });
            break;
    }
    setItemToDelete(null);
  };
  
  // --------------------------------------------------------------------------------
  // NEW: Import Logic with Preview Modal
  // --------------------------------------------------------------------------------

  const exportData = (format: 'json' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `medtrack-export-${timestamp}`;

    if (format === 'json') {
        const data = { 
            version: "1.0", 
            exportedAt: new Date().toISOString(),
            specialists, 
            visits, 
            exams 
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        const headers = ['Tipo', 'Data', 'Specialista', 'Nome/Titolo', 'Dettagli/Note', 'Costo'];
        const rows = [headers.join(',')];
        const escape = (str: any) => str === null || str === undefined ? '' : `"${String(str).replace(/"/g, '""')}"`;
        const getSpecName = (id: number | null) => specialists.find(s => s.id === id)?.name || '';

        visits.forEach(v => {
            rows.push(['Visita', escape(v.date), escape(getSpecName(v.specialistId)), escape('Visita di controllo'), escape(v.notes), escape(v.cost)].join(','));
        });

        exams.forEach(e => {
            rows.push(['Esame', escape(e.date), escape(getSpecName(e.specialistId)), escape(e.name), escape(e.results ? `${e.results} ${e.notes}` : e.notes), escape(e.cost)].join(','));
        });

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const triggerImport = () => {
      if (importFileRef.current) {
          importFileRef.current.value = '';
          importFileRef.current.click();
      }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              if (!text) throw new Error("File vuoto o impossibile da leggere");

              let rawVisits: any[] = [];
              let rawExams: any[] = [];
              let rawSpecialists: any[] = [];
              let isJson = false;

              // 1. Parse (JSON or CSV)
              try {
                  const data = JSON.parse(text);
                  if (data.visits || data.exams || data.specialists || Array.isArray(data)) {
                      isJson = true;
                      rawVisits = Array.isArray(data.visits) ? data.visits : [];
                      rawExams = Array.isArray(data.exams) ? data.exams : [];
                      rawSpecialists = Array.isArray(data.specialists) ? data.specialists : [];
                  }
              } catch (e) { /* Not JSON */ }

              if (!isJson) {
                 const lines = text.split(/\r?\n/).filter(l => l.trim());
                 if (lines.length > 0 && lines[0].includes(',')) {
                     // Simple CSV parser
                     for(let i = 1; i < lines.length; i++) {
                         // Split by comma, handling quotes loosely if needed, or simple split
                         // Using a regex to handle quoted commas is safer
                         const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) || lines[i].split(',');
                         
                         if(cols.length < 2) continue;
                         const [typeRaw, date, specName, title, notes, costRaw] = cols;
                         const type = typeRaw ? typeRaw.toLowerCase().replace(/"/g, '') : '';

                         let specId = 0; 
                         if(specName) {
                             specId = 900000 + i; // Temp ID
                             rawSpecialists.push({ id: specId, name: specName.replace(/"/g, ''), icon: '⚕️', interval: 12 });
                         }
                         const baseId = Date.now() + (i * 100);
                         if(type.includes('visita')) {
                             rawVisits.push({ id: baseId, specialistId: specId, date: date || '', notes: notes || '', cost: Number(costRaw) || 0 });
                         } else {
                             rawExams.push({ id: baseId, specialistId: specId || null, name: title || 'Esame', date: date || '', results: notes || '', notes: '', cost: Number(costRaw) || 0 });
                         }
                     }
                 }
              }

              // 2. Analyze & Prepare Delta
              const newSpecialistsToAdd: Specialist[] = [];
              const specIdMap = new Map<number, number>(); 

              // Map Specialists (By Name)
              rawSpecialists.forEach((impS, idx) => {
                  const existing = specialists.find(fs => fs.name.toLowerCase().trim() === impS.name.toLowerCase().trim());
                  if(existing) {
                      specIdMap.set(impS.id, existing.id);
                  } else {
                      // Check if we already staged this new specialist
                      const staged = newSpecialistsToAdd.find(ns => ns.name.toLowerCase().trim() === impS.name.toLowerCase().trim());
                      if(staged) {
                          specIdMap.set(impS.id, staged.id);
                      } else {
                          const newId = Date.now() + Math.floor(Math.random() * 100000) + idx;
                          specIdMap.set(impS.id, newId);
                          newSpecialistsToAdd.push({...impS, id: newId});
                      }
                  }
              });

              // Filter Visits (Avoid Duplicates)
              const newVisitsToAdd: Visit[] = [];
              rawVisits.forEach((v, idx) => {
                  const mappedSpecId = specIdMap.get(v.specialistId) || (specialists[0]?.id || 1);
                  const exists = visits.some(ev => 
                      (isJson && ev.id === v.id) || 
                      (!isJson && ev.date === v.date && ev.specialistId === mappedSpecId && ev.notes === v.notes)
                  );
                  if(!exists) {
                      newVisitsToAdd.push({...v, id: Date.now() + Math.random() + idx, specialistId: mappedSpecId});
                  }
              });

              // Filter Exams (Avoid Duplicates)
              const newExamsToAdd: Exam[] = [];
              rawExams.forEach((e, idx) => {
                  let mappedSpecId = e.specialistId ? specIdMap.get(e.specialistId) : null;
                  if (mappedSpecId === undefined) mappedSpecId = null;

                  const exists = exams.some(ee => 
                      (isJson && ee.id === e.id) ||
                      (!isJson && ee.date === e.date && ee.name === e.name)
                  );
                  if(!exists) {
                      newExamsToAdd.push({...e, id: Date.now() + Math.random() + idx, specialistId: mappedSpecId || null});
                  }
              });

              setImportPreviewData({
                  newVisits: newVisitsToAdd,
                  newExams: newExamsToAdd,
                  newSpecialists: newSpecialistsToAdd,
                  totalFound: { visits: rawVisits.length, exams: rawExams.length, specialists: rawSpecialists.length }
              });
              setIsImportPreviewOpen(true);

          } catch (err: any) {
              console.error(err);
              alert(`Errore analisi file: ${err.message}`);
          }
      };
      reader.onerror = () => alert("Errore di lettura del file (Permessi o Sicurezza).");
      reader.readAsText(file);
  };

  const confirmImport = () => {
      if(!importPreviewData) return;

      const finalSpecialists = [...specialists, ...importPreviewData.newSpecialists];
      const finalVisits = [...visits, ...importPreviewData.newVisits];
      const finalExams = [...exams, ...importPreviewData.newExams];

      setSpecialists(finalSpecialists);
      setVisits(finalVisits);
      setExams(finalExams);

      storageService.set('specialists', finalSpecialists);
      storageService.set('visits', finalVisits);
      storageService.set('exams', finalExams);

      setIsImportPreviewOpen(false);
      setImportPreviewData(null);
      alert('Dati importati con successo!');
  };

  
  const handleGeneratePdf = async () => {
    const reportElement = pdfReportRef.current;
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const scaledHeight = canvasHeight / ratio;

    let heightLeft = scaledHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
    }

    pdf.save(`Report-Sanitario-${new Date().toISOString().split('T')[0]}.pdf`);
    setIsPdfModalOpen(false);
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard visits={sortedVisits} exams={sortedExams} specialists={specialists} onCopyVisit={openCopyVisitModal} onCopyExam={openCopyExamModal} onEditVisit={openEditVisitModal} onEditExam={openEditExamModal} onDelete={(id, type) => requestDelete(id, type)} />;
      case 'visits': return <ItemList items={sortedVisits} type="visit" onEdit={openEditVisitModal} onCopy={openCopyVisitModal} specialists={specialists} onDelete={(id) => requestDelete(id, 'visit')} />;
      case 'exams': return <ItemList items={sortedExams} type="exam" onEdit={openEditExamModal} onCopy={openCopyExamModal} specialists={specialists} onDelete={(id) => requestDelete(id, 'exam')} />;
      case 'ai': return <AISuggestions visits={visits} exams={exams} specialists={specialists} />;
      case 'specialists': return <SpecialistsManager specialists={sortedSpecialists} onAdd={openAddSpecialistModal} onEdit={openEditSpecialistModal} onDelete={(id) => requestDelete(id, 'specialist')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <main className="bg-white rounded-3xl shadow-xl p-4 sm:p-6">
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 pb-6 border-b gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="text-4xl mr-3">🏥</span> Gestore Visite Mediche
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={openAddVisitModal} className="flex items-center bg-primary text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all text-sm">
                <PlusIcon /> <span className="ml-1">Visita</span>
              </button>
              <button onClick={openAddExamModal} className="flex items-center bg-secondary text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-teal-700 transition-all text-sm">
                <PlusIcon /> <span className="ml-1">Esame</span>
              </button>
              <div className="h-8 w-px bg-gray-300 mx-1 hidden sm:block"></div>
              
              {/* Import Button & Input */}
              <input 
                type="file" 
                ref={importFileRef} 
                onChange={handleFileImport} 
                accept=".json,.csv" 
                className="hidden" 
                style={{ display: 'none' }} 
              />
              <button onClick={triggerImport} title="Importa (JSON o CSV)" className="bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 transition-all text-sm flex items-center">
                <UploadIcon /> <span className="ml-1 hidden sm:inline">Importa</span>
              </button>
              
              {/* Export Buttons */}
              <button onClick={() => exportData('json')} title="Backup Completo (JSON)" className="bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-gray-800 transition-all text-sm flex items-center">
                <DownloadIcon /> <span className="ml-1 hidden sm:inline">Backup</span>
              </button>
              
              <button onClick={() => exportData('csv')} title="Esporta CSV per Excel" className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-all text-sm flex items-center">
                <FileText className="h-4 w-4" /> <span className="ml-1 hidden sm:inline">CSV</span>
              </button>

              <button onClick={() => setIsPdfModalOpen(true)} title="Report PDF" className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition-all text-sm flex items-center">
                <FileDown /> <span className="ml-1 hidden sm:inline">PDF</span>
              </button>
            </div>
          </header>

          <nav className="mb-6">
            <div className="border-b border-gray-200">
                <div className="-mb-px flex space-x-1 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-all`}>
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </div>
            </div>
          </nav>
          
          <div className="transition-opacity duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>

      <Modal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} title={editingVisit ? "Modifica Visita" : "Aggiungi Visita"}>
          <VisitForm form={visitFormState} setForm={setVisitFormState} onSave={saveVisit} specialists={specialists} />
      </Modal>

      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title={editingExam ? "Modifica Esame" : "Aggiungi Esame"}>
          <ExamForm form={examFormState} setForm={setExamFormState} onSave={saveExam} specialists={specialists} />
      </Modal>

      <Modal isOpen={isSpecialistModalOpen} onClose={() => setIsSpecialistModalOpen(false)} title={editingSpecialist ? "Modifica Specialista" : "Aggiungi Specialista"}>
         <SpecialistForm 
            form={specialistFormState} 
            setForm={setSpecialistFormState} 
            onSave={saveSpecialist} 
            openIconPicker={() => setIsIconPickerModalOpen(true)}
        />
      </Modal>
      
      <Modal isOpen={isIconPickerModalOpen} onClose={() => setIsIconPickerModalOpen(false)} title="Scegli un'icona">
          <IconPicker onSelect={(icon) => {
              setSpecialistFormState(prev => ({ ...prev, icon }));
              setIsIconPickerModalOpen(false);
          }} />
      </Modal>

      <Modal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title="Esporta Report PDF">
          <PdfExportModal
            onGenerate={handleGeneratePdf}
            visits={visits}
            exams={exams}
            specialists={specialists}
            reportRef={pdfReportRef}
          />
      </Modal>

      {/* Import Confirmation Modal */}
      <Modal isOpen={isImportPreviewOpen} onClose={() => setIsImportPreviewOpen(false)} title="Anteprima Importazione">
        {importPreviewData ? (
             <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="font-medium text-blue-800 mb-2">Analisi file completata:</p>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li>Trovati nel file: {importPreviewData.totalFound.visits} visite, {importPreviewData.totalFound.exams} esami.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">Dati che verranno aggiunti:</h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                         <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                             <p className="text-2xl font-bold text-green-600">+{importPreviewData.newVisits.length}</p>
                             <p className="text-xs text-green-700 font-medium">Visite</p>
                         </div>
                         <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                             <p className="text-2xl font-bold text-teal-600">+{importPreviewData.newExams.length}</p>
                             <p className="text-xs text-teal-700 font-medium">Esami</p>
                         </div>
                         <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                             <p className="text-2xl font-bold text-purple-600">+{importPreviewData.newSpecialists.length}</p>
                             <p className="text-xs text-purple-700 font-medium">Specialisti</p>
                         </div>
                    </div>
                    
                    {(importPreviewData.newVisits.length === 0 && importPreviewData.newExams.length === 0 && importPreviewData.newSpecialists.length === 0) && (
                        <p className="text-center text-sm text-gray-500 italic mt-2">Nessun dato nuovo trovato. Tutto il contenuto del file è già presente nell'app.</p>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsImportPreviewOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annulla</button>
                    <button 
                        onClick={confirmImport} 
                        disabled={importPreviewData.newVisits.length === 0 && importPreviewData.newExams.length === 0 && importPreviewData.newSpecialists.length === 0}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                    >
                        Conferma Importazione
                    </button>
                </div>
             </div>
        ) : (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )}
      </Modal>

      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Conferma Eliminazione">
        <div className="text-center">
          <p className="text-gray-600 mb-6">Sei sicuro di voler eliminare questo elemento? L'azione è irreversibile.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setItemToDelete(null)} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
              Annulla
            </button>
            <button onClick={handleConfirmDelete} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">
              Elimina
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sub-components
const tabs: {id: Tab, name: string, icon: React.ReactNode}[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon/> },
    { id: 'visits', name: 'Visite', icon: <VisitsIcon/> },
    { id: 'exams', name: 'Esami', icon: <ExamsIcon/> },
    { id: 'specialists', name: 'Specialisti', icon: <SpecialistsIcon/> },
    { id: 'ai', name: 'AI Insights', icon: <BotIcon/> },
];

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}>
    <p className="text-sm font-medium opacity-80">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const CostCalculatorCard: React.FC<{ visits: Visit[], exams: Exam[], specialists: Specialist[] }> = ({ visits, exams, specialists }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [periodCost, setPeriodCost] = useState<number | null>(null);

  const handleCalculateCost = () => {
    if (!startDate || !endDate) {
      alert("Per favore, seleziona sia la data di inizio che quella di fine.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        alert("La data di inizio non può essere successiva alla data di fine.");
        return;
    }

    const costOfVisits = visits
      .filter(v => {
        const visitDate = new Date(v.date);
        const dateMatch = visitDate >= start && visitDate <= end;
        const specialistMatch = !selectedSpecialist || v.specialistId === Number(selectedSpecialist);
        return dateMatch && specialistMatch;
      })
      .reduce((sum, v) => sum + v.cost, 0);

    const costOfExams = exams
      .filter(e => {
        const examDate = new Date(e.date);
        const dateMatch = examDate >= start && examDate <= end;
        // Exams can have no specialist, so we need to handle that case
        const specialistMatch = !selectedSpecialist || (e.specialistId !== null && e.specialistId === Number(selectedSpecialist));
        return dateMatch && specialistMatch;
      })
      .reduce((sum, e) => sum + e.cost, 0);
      
    setPeriodCost(costOfVisits + costOfExams);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Calcola Costo Periodo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialista (Opzionale)</label>
          <select value={selectedSpecialist} onChange={e => setSelectedSpecialist(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="">Tutti gli Specialisti</option>
              {specialists.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>
        <button onClick={handleCalculateCost} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition-all">
            Calcola Totale
        </button>
        {periodCost !== null && (
            <div className="mt-4 text-center bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-indigo-800">Costo totale per il periodo selezionato:</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">€{periodCost.toFixed(2)}</p>
            </div>
        )}
    </div>
  );
};

const UpcomingCheckupsCard: React.FC<{ visits: Visit[], specialists: Specialist[] }> = ({ visits, specialists }) => {
    const upcomingCheckups = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return specialists.map(specialist => {
            const lastVisit = visits
                .filter(v => v.specialistId === specialist.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            if (!lastVisit) return null;

            const nextDueDate = new Date(lastVisit.date);
            nextDueDate.setMonth(nextDueDate.getMonth() + specialist.interval);

            const isOverdue = nextDueDate < today;
            const daysDifference = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Show only if overdue or due in the next 60 days
            if (isOverdue || daysDifference <= 60) {
                return {
                    specialist,
                    dueDate: nextDueDate,
                    isOverdue,
                };
            }
            return null;

        }).filter(Boolean).sort((a, b) => a!.dueDate.getTime() - b!.dueDate.getTime());
    }, [visits, specialists]);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-secondary"><CalendarCheckIcon /></span>
                <span className="ml-2">Prossimi Controlli</span>
            </h3>
            <div className="space-y-3">
                {upcomingCheckups.length > 0 ? (
                    upcomingCheckups.map(checkup => (
                        <div key={checkup!.specialist.id} className={`flex items-center justify-between p-3 rounded-lg ${checkup!.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{checkup!.specialist.icon}</span>
                                <div>
                                    <p className="font-semibold text-gray-800">{checkup!.specialist.name}</p>
                                    <p className={`text-sm ${checkup!.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                        {checkup!.isOverdue ? 'Scaduto il ' : 'Previsto per il '}
                                        {checkup!.dueDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 px-2 bg-green-50 rounded-lg">
                        <p className="font-semibold text-green-800">Tutto in regola!</p>
                        <p className="text-sm text-green-700">Nessun controllo imminente o scaduto.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard: React.FC<{ visits: Visit[], exams: Exam[], specialists: Specialist[], onEditVisit: (v: Visit) => void, onCopyVisit: (v: Visit) => void, onEditExam: (e: Exam) => void, onCopyExam: (e: Exam) => void, onDelete: (id: number, type: 'visit' | 'exam') => void }> = ({ visits, exams, specialists, onEditVisit, onCopyVisit, onEditExam, onCopyExam, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const { filteredVisits, filteredExams } = useMemo(() => {
        const getSpecialistName = (id: number | null) => {
            if (id === null) return '';
            const specialist = specialists.find(s => s.id === id);
            // FIX: Handle cases where a specialist might not be found to prevent errors
            return specialist ? specialist.name.toLowerCase() : '';
        };

        if (!searchQuery.trim()) {
            return { filteredVisits: visits, filteredExams: exams };
        }

        const lowercasedQuery = searchQuery.toLowerCase().trim();

        const filteredVisits = visits.filter(v => 
            (v.notes || '').toLowerCase().includes(lowercasedQuery) ||
            getSpecialistName(v.specialistId).includes(lowercasedQuery)
        );

        const filteredExams = exams.filter(e => 
            (e.name || '').toLowerCase().includes(lowercasedQuery) ||
            (e.results || '').toLowerCase().includes(lowercasedQuery) ||
            (e.notes || '').toLowerCase().includes(lowercasedQuery) ||
            getSpecialistName(e.specialistId).includes(lowercasedQuery)
        );

        return { filteredVisits, filteredExams };

    }, [searchQuery, visits, exams, specialists]);

    const filteredTotalCost = useMemo(() => 
        filteredVisits.reduce((sum, v) => sum + v.cost, 0) + filteredExams.reduce((sum, e) => sum + e.cost, 0),
        [filteredVisits, filteredExams]
    );
    
    const hasSearch = searchQuery.trim().length > 0;

    const allFilteredItems = [...filteredVisits.map(v => ({...v, type: 'visit' as const})), ...filteredExams.map(e => ({...e, type: 'exam' as const}))]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const itemsToShow = hasSearch ? allFilteredItems : allFilteredItems.slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                   <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="Cerca per nome, note, risultati, specialista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow shadow-sm"
                    aria-label="Cerca attività"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={hasSearch ? "Visite Trovate" : "Visite Totali"} value={filteredVisits.length} color="from-blue-500 to-blue-600" />
                <StatCard title={hasSearch ? "Esami Trovati" : "Esami Totali"} value={filteredExams.length} color="from-teal-500 to-teal-600" />
                <StatCard title={hasSearch ? "Costo Filtrato" : "Costo Totale"} value={`€${filteredTotalCost.toFixed(2)}`} color="from-purple-500 to-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingCheckupsCard visits={visits} specialists={specialists} />
                <CostCalculatorCard visits={visits} exams={exams} specialists={specialists} />
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><ActivityIcon/> {hasSearch ? 'Risultati della Ricerca' : 'Attività Recente'}</h2>
                <div className="space-y-3">
                    {itemsToShow.length > 0 ? itemsToShow.map(item =>
                        <ItemCard 
                            key={`${item.type}-${item.id}`}
                            item={item} 
                            type={item.type} 
                            onEdit={item.type === 'visit' ? onEditVisit : onEditExam} 
                            onCopy={item.type === 'visit' ? onCopyVisit : onCopyExam} 
                            onDelete={onDelete}
                            specialists={specialists} 
                        />
                    ) : <p className="text-gray-500 text-center py-4">{hasSearch ? 'Nessun risultato per la tua ricerca.' : 'Nessuna attività registrata.'}</p>}
                </div>
            </div>
        </div>
    );
}

const ItemFilters: React.FC<{
    specialists: Specialist[];
    filterSpecialist: string;
    setFilterSpecialist: (id: string) => void;
    filterStartDate: string;
    setFilterStartDate: (date: string) => void;
    filterEndDate: string;
    setFilterEndDate: (date: string) => void;
    onSetDatePreset: (months: number) => void;
    onResetFilters: () => void;
}> = ({ specialists, filterSpecialist, setFilterSpecialist, filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate, onSetDatePreset, onResetFilters }) => {
    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialista</label>
                    <select value={filterSpecialist} onChange={e => setFilterSpecialist(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="">Tutti gli Specialisti</option>
                        {specialists.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Da</label>
                    <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">A</label>
                    <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Filtri rapidi:</span>
                <button onClick={() => onSetDatePreset(3)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">Ultimi 3 mesi</button>
                <button onClick={() => onSetDatePreset(6)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">Ultimi 6 mesi</button>
                <button onClick={() => onSetDatePreset(12)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">Ultimo anno</button>
                <button onClick={onResetFilters} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors ml-auto">Resetta</button>
            </div>
        </div>
    );
};


interface ItemListProps {
  items: (Visit | Exam)[];
  type: 'visit' | 'exam';
  onEdit: (item: any) => void;
  onCopy: (item: any) => void;
  onDelete: (id: number) => void;
  specialists: Specialist[];
}

const ItemList: React.FC<ItemListProps> = ({ items, type, onEdit, onCopy, onDelete, specialists }) => {
    const [filterSpecialist, setFilterSpecialist] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const setDatePreset = (months: number) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - months);
        setFilterStartDate(startDate.toISOString().split('T')[0]);
        setFilterEndDate(endDate.toISOString().split('T')[0]);
    };

    const resetFilters = () => {
        setFilterSpecialist('');
        setFilterStartDate('');
        setFilterEndDate('');
        setSearchQuery('');
    };
    
    const filteredItems = useMemo(() => {
      let filtered = items;

      if (filterSpecialist || filterStartDate || filterEndDate) {
        filtered = filtered.filter(item => {
          const itemWithSpecialist = item as Visit | Exam;
          const specialistMatch = !filterSpecialist || (itemWithSpecialist.specialistId !== null && itemWithSpecialist.specialistId === Number(filterSpecialist));
          const startDateMatch = !filterStartDate || new Date(item.date) >= new Date(filterStartDate);
          const endDateMatch = !filterEndDate || new Date(item.date) < new Date(new Date(filterEndDate).setDate(new Date(filterEndDate).getDate() + 1));
          return specialistMatch && startDateMatch && endDateMatch;
        });
      }


      if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item => {
            const specialist = specialists.find(s => s.id === (item as Visit | Exam).specialistId);
            const specialistName = specialist?.name ? specialist.name.toLowerCase() : '';
            
            if (type === 'visit') {
                const visit = item as Visit;
                return (visit.notes || '').toLowerCase().includes(lowercasedQuery) || specialistName.includes(lowercasedQuery);
            } else { // exam
                const exam = item as Exam;
                return (
                    (exam.name || '').toLowerCase().includes(lowercasedQuery) ||
                    (exam.results || '').toLowerCase().includes(lowercasedQuery) ||
                    (exam.notes || '').toLowerCase().includes(lowercasedQuery) ||
                    specialistName.includes(lowercasedQuery)
                );
            }
        });
      }

      return filtered;
    }, [items, type, filterSpecialist, filterStartDate, filterEndDate, searchQuery, specialists]);


    return(
        <div className="space-y-4">
            <div className="mb-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                   <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder={type === 'visit' ? "Cerca nelle note o per specialista..." : "Cerca per nome, risultati, note o specialista..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {(type === 'visit' || type === 'exam') && (
                <ItemFilters
                    specialists={specialists}
                    filterSpecialist={filterSpecialist}
                    setFilterSpecialist={setFilterSpecialist}
                    filterStartDate={filterStartDate}
                    setFilterStartDate={setFilterStartDate}
                    filterEndDate={filterEndDate}
                    setFilterEndDate={setFilterEndDate}
                    onSetDatePreset={setDatePreset}
                    onResetFilters={resetFilters}
                />
            )}
            {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                    <ItemCard key={item.id} item={item} type={type} onEdit={onEdit} onCopy={onCopy} onDelete={(id) => onDelete(id)} specialists={specialists} />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nessun {type === 'visit' ? 'visita' : 'esame'} trovato.</p>
                    <p className="text-sm text-gray-400 mt-1">{searchQuery || filterSpecialist || filterStartDate || filterEndDate ? 'Prova a modificare i filtri o la ricerca.' : `Aggiungi ${type === 'visit' ? 'una nuova visita' : 'un nuovo esame'} per iniziare.`}</p>
                </div>
            )}
        </div>
    );
};

interface ItemCardProps {
  item: Visit | Exam;
  type: 'visit' | 'exam';
  onEdit: (item: any) => void;
  onCopy: (item: any) => void;
  onDelete: (id: number, type: 'visit' | 'exam') => void;
  specialists: Specialist[];
}

const ItemCard: React.FC<ItemCardProps> = ({ item, type, onEdit, onCopy, onDelete, specialists }) => {
    const isVisit = type === 'visit';
    const visit = isVisit ? (item as Visit) : null;
    const exam = !isVisit ? (item as Exam) : null;
    const specialist = specialists.find(s => s.id === (visit?.specialistId || exam?.specialistId));

    return (
        <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-start hover:bg-gray-50 transition-colors group">
            <div className="flex gap-4 items-start flex-1 min-w-0">
                <span className="text-3xl mt-1">{isVisit ? specialist?.icon ?? '🩺' : '🔬'}</span>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-gray-800 truncate">{isVisit ? specialist?.name ?? 'Specialista Sconosciuto' : exam?.name}</p>
                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {!isVisit && specialist && <p className="text-sm text-primary font-medium">{specialist.name}</p>}
                    {item.notes && <p className="text-sm text-gray-600 mt-1 italic truncate">"{item.notes}"</p>}
                    {exam?.results && <p className="text-sm text-gray-600 mt-1 truncate">Risultati: {exam.results}</p>}
                    {item.cost > 0 && <p className="text-sm text-green-600 font-semibold mt-1">€{item.cost.toFixed(2)}</p>}
                </div>
            </div>
            <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onCopy(item)} title="Copia" className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"><CopyIcon /></button>
                <button onClick={() => onEdit(item)} title="Modifica" className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-100 transition-colors"><PencilIcon /></button>
                <button onClick={() => onDelete(item.id, type)} title="Elimina" className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
            </div>
        </div>
    );
};

const SpecialistsManager: React.FC<{specialists: Specialist[], onAdd: () => void, onEdit: (s: Specialist) => void, onDelete: (id: number) => void}> = ({ specialists, onAdd, onEdit, onDelete }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Gestione Specialisti</h2>
            <button onClick={onAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">
                <PlusIcon /> <span className="ml-2">Aggiungi</span>
            </button>
        </div>
        <div className="space-y-3">
        {specialists.map(s => (
            <div key={s.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center group">
                <div className="flex gap-4 items-center">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-500">Controllo ogni {s.interval} mesi</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(s)} title="Modifica" className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-100 transition-colors"><PencilIcon /></button>
                    <button onClick={() => onDelete(s.id)} title="Elimina" className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                </div>
            </div>
        ))}
        </div>
    </div>
);

const VisitForm: React.FC<{form: Omit<Visit, 'id'>, setForm: React.Dispatch<React.SetStateAction<Omit<Visit, 'id'>>>, onSave: () => void, specialists: Specialist[]}> = ({ form, setForm, onSave, specialists }) => (
    <div className="space-y-4">
        <select value={form.specialistId} onChange={e => setForm({...form, specialistId: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">Seleziona Specialista *</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
        <input type="number" placeholder="Costo" value={form.cost || ''} onChange={e => setForm({...form, cost: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
        <textarea placeholder="Note" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
        <button onClick={onSave} className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">Salva Visita</button>
    </div>
);

const ExamForm: React.FC<{form: Omit<Exam, 'id'>, setForm: React.Dispatch<React.SetStateAction<Omit<Exam, 'id'>>>, onSave: () => void, specialists: Specialist[]}> = ({ form, setForm, onSave, specialists }) => (
    <div className="space-y-4">
        <input type="text" placeholder="Nome Esame *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary" />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary" />
        <select value={form.specialistId || ''} onChange={e => setForm({...form, specialistId: e.target.value ? Number(e.target.value) : null})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary">
            <option value="">Specialista (opzionale)</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <textarea placeholder="Risultati" value={form.results} onChange={e => setForm({...form, results: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary" />
        <textarea placeholder="Note" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary" />
        <input type="number" placeholder="Costo" value={form.cost || ''} onChange={e => setForm({...form, cost: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary" />
        <button onClick={onSave} className="w-full bg-secondary text-white py-3 rounded-lg font-semibold shadow hover:bg-teal-700 transition-all">Salva Esame</button>
    </div>
);

const MEDICAL_ICONS = ['👁️','🦷','🦴','❤️','🩺','♀️','♂️','👨‍⚕️','👩‍⚕️','🧠','👃','👂','👶','🏃','🩸','💊','🚑','🔬','🧬','🥼','🏥'];

const IconPicker: React.FC<{onSelect: (icon: string) => void}> = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {MEDICAL_ICONS.map(icon => (
                <button
                    key={icon}
                    type="button"
                    onClick={() => onSelect(icon)}
                    className="text-3xl p-2 rounded-lg hover:bg-gray-200 transition-colors aspect-square flex items-center justify-center"
                    aria-label={`Icona ${icon}`}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};


const SpecialistForm: React.FC<{
    form: Omit<Specialist, 'id'>, 
    setForm: React.Dispatch<React.SetStateAction<Omit<Specialist, 'id'>>>, 
    onSave: () => void,
    openIconPicker: () => void,
}> = ({ form, setForm, onSave, openIconPicker }) => {
    return (
        <div className="space-y-4">
            <input type="text" placeholder="Nome Specialista *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icona *</label>
                 <button 
                    type="button"
                    onClick={openIconPicker}
                    className="w-full text-left border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary flex items-center"
                >
                    <span className="text-2xl w-8">{form.icon}</span>
                    <span className="text-gray-700">Clicca per scegliere un'icona</span>
                </button>
            </div>
            
            <input type="number" placeholder="Intervallo controllo (mesi) *" value={form.interval || ''} onChange={e => setForm({...form, interval: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
            <button onClick={onSave} className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">Salva Specialista</button>
        </div>
    );
};

const PdfExportModal: React.FC<{
    onGenerate: () => void;
    visits: Visit[];
    exams: Exam[];
    specialists: Specialist[];
    reportRef: React.RefObject<HTMLDivElement>;
}> = ({ onGenerate, visits, exams, specialists, reportRef }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: new Date().toISOString().split('T')[0],
        includeVisits: true,
        includeExams: true,
        includeSpecialists: true,
    });

    const specialistMap = useMemo(() => specialists.reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
    }, {} as Record<number, Specialist>), [specialists]);

    const filteredVisits = useMemo(() => visits.filter(v => 
        (!filters.startDate || v.date >= filters.startDate) &&
        (!filters.endDate || v.date <= filters.endDate)
    ), [visits, filters.startDate, filters.endDate]);

    const filteredExams = useMemo(() => exams.filter(e =>
        (!filters.startDate || e.date >= filters.startDate) &&
        (!filters.endDate || e.date <= filters.endDate)
    ), [exams, filters.startDate, filters.endDate]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Includi nel Report:</label>
                <div className="flex flex-col sm:flex-row sm:gap-6">
                    <label className="flex items-center gap-2"><input type="checkbox" name="includeVisits" checked={filters.includeVisits} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /> Visite</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="includeExams" checked={filters.includeExams} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /> Esami</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="includeSpecialists" checked={filters.includeSpecialists} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /> Specialisti</label>
                </div>
            </div>
            <button onClick={onGenerate} className="w-full flex items-center justify-center bg-red-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-red-700 transition-all">
                <FileDown className="mr-2 h-5 w-5" />
                Genera PDF
            </button>
            
            {/* Hidden div for PDF generation */}
            <div className="absolute -left-[9999px] top-auto w-[800px] p-8 bg-white font-sans" ref={reportRef}>
                 <h1 className="text-3xl font-bold mb-2">Report Sanitario</h1>
                 <p className="text-gray-600 mb-6">Generato il: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 
                 {filters.includeVisits && (
                     <div className="mb-8">
                         <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">Visite</h2>
                         {filteredVisits.length > 0 ? filteredVisits.map(v => (
                             <div key={v.id} className="mb-4 pb-4 border-b border-gray-100">
                                 <p><strong>Specialista:</strong> {specialistMap[v.specialistId]?.name || 'Sconosciuto'}</p>
                                 <p><strong>Data:</strong> {new Date(v.date).toLocaleDateString('it-IT')}</p>
                                 {v.notes && <p><strong>Note:</strong> {v.notes}</p>}
                                 {v.cost > 0 && <p><strong>Costo:</strong> €{v.cost.toFixed(2)}</p>}
                             </div>
                         )) : <p>Nessuna visita nel periodo selezionato.</p>}
                     </div>
                 )}

                {filters.includeExams && (
                     <div className="mb-8">
                         <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">Esami</h2>
                         {filteredExams.length > 0 ? filteredExams.map(e => (
                             <div key={e.id} className="mb-4 pb-4 border-b border-gray-100">
                                 <p><strong>Esame:</strong> {e.name}</p>
                                 <p><strong>Data:</strong> {new Date(e.date).toLocaleDateString('it-IT')}</p>
                                 {e.specialistId && specialistMap[e.specialistId] && <p><strong>Prescritto da:</strong> {specialistMap[e.specialistId].name}</p>}
                                 {e.results && <p><strong>Risultati:</strong> {e.results}</p>}
                                 {e.notes && <p><strong>Note:</strong> {e.notes}</p>}
                                 {e.cost > 0 && <p><strong>Costo:</strong> €{e.cost.toFixed(2)}</p>}
                             </div>
                         )) : <p>Nessun esame nel periodo selezionato.</p>}
                     </div>
                 )}
                 
                 {filters.includeSpecialists && (
                     <div>
                         <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-4">Elenco Specialisti</h2>
                         <ul className="list-disc list-inside">
                             {specialists.map(s => <li key={s.id}>{s.name} (Controllo consigliato ogni {s.interval} mesi)</li>)}
                         </ul>
                     </div>
                 )}
            </div>
        </div>
    );
};


export default App;
