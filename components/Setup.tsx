
import React, { useState } from 'react';
import type { Edital, Journey, TopicStatus } from '../types.ts';
import { supabase } from '../services/supabase.ts';
import { mockPcrs, mockOab, mockCfoPmmg, mockPpMg, mockPpSp } from '../data/mockData.ts';
import { parseEditalWithGemini } from '../services/geminiService.ts';
import { UploadCloud, FileJson, Loader2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

interface SetupProps {
    onJourneyCreated: (journey: Journey) => void;
    onCancel: () => void;
    userId: string;
}

const predefinedContests = [
    { name: 'PC RS Escrivão e Inspetor', edital: mockPcrs },
    { name: 'OAB 45º Exame', edital: mockOab },
    { name: 'CFO PM-MG (Oficial)', edital: mockCfoPmmg },
    { name: 'Polícia Penal MG', edital: mockPpMg },
    { name: 'Polícia Penal SP', edital: mockPpSp },
];

export const Setup: React.FC<SetupProps> = ({ onJourneyCreated, onCancel, userId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState('');
    const [useManualMode, setUseManualMode] = useState(false);

    const createNewJourney = async (edital: Edital) => {
        setLoadingStep('Salvando jornada...');
        setError('');
        
        const initialStatus: { [key: string]: TopicStatus } = {};
        edital.disciplines.forEach(d => {
            d.topics.forEach(t => {
                initialStatus[t.id] = {
                    pending: true,
                    pdf: false,
                    video: false,
                    law: false,
                    questions: false,
                    summary: false,
                };
            });
        });

        const initialStudyData = {
            sessions: [],
            questions: [],
            revisions: [],
            topicStatus: initialStatus,
        };
        
        const { data, error } = await supabase
            .from('journeys')
            .insert({
                user_id: userId,
                edital: edital,
                study_data: initialStudyData
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating journey:", error);
            setError('Não foi possível criar a jornada. Tente novamente.');
            setIsLoading(false);
            return;
        }

        if (data) {
            const newJourney: Journey = {
                id: data.id,
                edital: data.edital as Edital,
                studyData: data.study_data as any,
            };
            onJourneyCreated(newJourney);
        }
        setIsLoading(false);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const base64Data = reader.result.split(',')[1];
                    resolve(base64Data);
                } else {
                    reject(new Error("Falha na conversão do arquivo."));
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setUseManualMode(false);
        setIsLoading(true);

        if (file.type !== 'application/pdf') {
            setError('Por favor, envie apenas arquivos PDF.');
            setIsLoading(false);
            return;
        }
        
        try {
            setLoadingStep('Lendo arquivo PDF...');
            const base64Data = await fileToBase64(file);
            
            setLoadingStep('IA analisando conteúdo...');
            const extractedEdital = await parseEditalWithGemini(base64Data);

            if (!extractedEdital) {
                // Se a IA falhar silenciosamente, oferece modo manual
                throw new Error("Falha na leitura");
            }

            await createNewJourney(extractedEdital);

        } catch (err: any) {
            console.error(err);
            setError("Não foi possível processar o edital com a IA (Verifique a API Key ou o formato do PDF).");
            setUseManualMode(true); // Habilita botão de fallback
            setIsLoading(false);
        }
    };

    const handleManualFallback = () => {
        // Cria um edital "em branco" para o usuário preencher depois (feature futura de edição)
        // Por enquanto, cria um genérico
        const fallbackEdital: Edital = {
            id: `manual-${Date.now()}`,
            name: "Meu Edital Personalizado",
            disciplines: [
                {
                    id: 'd1', name: 'Disciplina 01', 
                    topics: [{id: 't1', name: 'Tópico 01'}, {id: 't2', name: 'Tópico 02'}]
                },
                {
                    id: 'd2', name: 'Disciplina 02', 
                    topics: [{id: 't3', name: 'Tópico 01'}]
                }
            ]
        };
        createNewJourney(fallbackEdital);
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
            <div className="w-full max-w-2xl text-center relative">
                <button 
                    onClick={onCancel}
                    className="absolute left-0 top-0 -mt-12 md:-mt-0 md:-ml-12 p-2 text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="h-6 w-6" />
                    <span className="hidden md:inline">Voltar</span>
                </button>

                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Crie sua Nova Jornada</h1>
                <p className="text-neutral-400 mb-8">Configure um novo plano de estudos para alcançar sua aprovação.</p>
                
                <div className="bg-neutral-800/50 rounded-xl p-8 shadow-lg border border-neutral-700/50 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                            Opção 1: Envie seu Próprio Edital <Sparkles className="text-yellow-400 h-4 w-4"/>
                        </h2>
                        {isLoading ? (
                            <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg p-8 flex flex-col items-center justify-center transition-colors animate-pulse">
                                <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin"/>
                                <span className="font-semibold text-primary text-lg">{loadingStep}</span>
                                <span className="text-neutral-400 text-sm mt-2">Isso pode levar alguns segundos...</span>
                            </div>
                        ) : (
                            <label htmlFor="file-upload" className="cursor-pointer border-2 border-dashed border-neutral-600 hover:border-primary hover:bg-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center transition-all group">
                                <UploadCloud className="h-12 w-12 text-neutral-500 group-hover:text-primary transition-colors mb-2"/>
                                <span className="font-semibold text-primary group-hover:underline">Clique para enviar o PDF</span>
                                <span className="text-neutral-400 text-sm mt-1">A IA irá extrair as disciplinas automaticamente</span>
                            </label>
                        )}
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" disabled={isLoading} value=""/>
                    </div>
                    
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-neutral-500">OU</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Opção 2: Escolha um Concurso com Edital Aberto</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {predefinedContests.map(contest => (
                                <button 
                                    key={contest.name} 
                                    onClick={() => contest.edital && createNewJourney(contest.edital)} 
                                    disabled={!contest.edital || isLoading} 
                                    className="p-4 bg-neutral-700 rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center h-full flex flex-col items-center justify-center min-h-[100px]"
                                >
                                    <FileJson className="h-8 w-8 mb-2 text-secondary"/>
                                    <span className="font-semibold text-sm">{contest.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                     {error && (
                        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg mt-4 animate-fadeIn flex flex-col items-center gap-2">
                            <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                                <AlertCircle size={16}/> {error}
                            </p>
                            {useManualMode && (
                                <button 
                                    onClick={handleManualFallback}
                                    className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1.5 rounded transition"
                                >
                                    Criar Jornada Genérica (Sem IA)
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
