
import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Save, CheckCircle, AlertTriangle, Clock, Lock, Sparkles, Loader2, RefreshCw, WifiOff, ChevronDown, ChevronRight, Plus, Minus, Zap, Landmark, LayoutGrid, X } from 'lucide-react';
import type { Edital, StudyData, QuestionLog, GeneratedQuestion } from '../types.ts';
import { generatePracticeQuestions } from '../services/geminiService.ts';
import { Card } from './common/Card.tsx';

interface QuestionsTrackerProps {
    studyData: StudyData;
    addQuestionLog: (log: QuestionLog) => void;
    edital: Edital;
    isPremium: boolean;
    onOpenPricing: () => void;
}

type TabType = 'single' | 'simulado' | 'bancas' | 'manual';

export const QuestionsTracker: React.FC<QuestionsTrackerProps> = ({ 
    studyData, 
    addQuestionLog, 
    edital, 
    isPremium, 
    onOpenPricing 
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('single');
    
    // --- ESTADOS GERAIS DO QUIZ ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<GeneratedQuestion[]>([]);
    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [dailyUsage, setDailyUsage] = useState(0);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // --- ESTADOS: INÉDITAS (SINGLE MODE) ---
    const [singleDisciplineId, setSingleDisciplineId] = useState('');
    const [singleTopicId, setSingleTopicId] = useState('');
    const [singleCount, setSingleCount] = useState(5);

    // --- ESTADOS: SIMULADO (BUILDER MODE) ---
    const [simuladoMode, setSimuladoMode] = useState<'discipline' | 'topic'>('discipline');
    const [selections, setSelections] = useState<Record<string, number>>({});
    const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(new Set());

    // --- ESTADOS: MANUAL ---
    const [manualDisciplineId, setManualDisciplineId] = useState('');
    const [manualTopicId, setManualTopicId] = useState('');
    const [manualTotal, setManualTotal] = useState('');
    const [manualCorrect, setManualCorrect] = useState('');

    // --- EFEITOS ---
    useEffect(() => {
        const today = new Date().toDateString();
        const storage = JSON.parse(localStorage.getItem('ai_questions_usage') || '{}');
        
        if (storage.date === today) {
            setDailyUsage(storage.count);
        } else {
            setDailyUsage(0);
            localStorage.setItem('ai_questions_usage', JSON.stringify({ date: today, count: 0 }));
        }
        
        // Inicializa selects
        if (edital.disciplines && edital.disciplines.length > 0) {
            const firstD = edital.disciplines[0].id;
            
            // Para Manual
            setManualDisciplineId(firstD);
            if (edital.disciplines[0].topics.length > 0) {
                setManualTopicId(edital.disciplines[0].topics[0].id);
            }

            // Para Single
            setSingleDisciplineId(firstD);
            if (edital.disciplines[0].topics.length > 0) {
                setSingleTopicId(edital.disciplines[0].topics[0].id);
            }
        }
    }, [edital]);

    // --- HELPERS GERAIS ---
    
    const checkLimit = (count: number) => {
        if (!isPremium) {
            const remaining = 10 - dailyUsage;
            if (count > remaining) {
                alert(`Usuários gratuitos têm limite de 10 questões diárias. Restam: ${remaining}. Assine o Premium para criar simulados ilimitados.`);
                onOpenPricing();
                return false;
            }
        }
        return true;
    };

    const updateUsage = (count: number) => {
        if (!isPremium) {
            const newUsage = dailyUsage + count;
            setDailyUsage(newUsage);
            localStorage.setItem('ai_questions_usage', JSON.stringify({ 
                date: new Date().toDateString(), 
                count: newUsage 
            }));
        }
    };

    const resetQuizState = () => {
        setQuizFinished(false);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizQuestions([]);
        setIsOfflineMode(false);
        setLoadingMessage('');
        setSelectedOption(null);
        setShowFeedback(false);
    };

    // --- LÓGICA: GERAR SINGLE (INÉDITAS) ---

    const handleGenerateSingle = async () => {
        if (!singleDisciplineId || !singleTopicId) return;
        if (!checkLimit(singleCount)) return;

        const disc = edital.disciplines.find(d => d.id === singleDisciplineId);
        const topic = disc?.topics.find(t => t.id === singleTopicId);

        if (!disc || !topic) return;

        setIsGenerating(true);
        resetQuizState();
        setLoadingMessage(`Criando ${singleCount} questões inéditas sobre ${topic.name}...`);

        try {
            const questions = await generatePracticeQuestions(topic.name, disc.name, singleCount);
            if (questions.some(q => q.question.includes("Modo Offline"))) setIsOfflineMode(true);
            setQuizQuestions(questions);
            updateUsage(questions.length);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar questões. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- LÓGICA: GERAR SIMULADO (MIX) ---

    const totalSelectedQuestions = useMemo(() => {
        return Object.values(selections).reduce((a: number, b: number) => a + b, 0);
    }, [selections]);

    const handleGenerateSimulado = async () => {
        if (totalSelectedQuestions === 0) return;
        if (!checkLimit(totalSelectedQuestions)) return;

        setIsGenerating(true);
        resetQuizState();
        setLoadingMessage('Preparando seu simulado personalizado...');

        try {
            const promises: Promise<GeneratedQuestion[]>[] = [];

            for (const [id, countVal] of Object.entries(selections)) {
                const count = countVal as number;
                if (count <= 0) continue;

                if (simuladoMode === 'discipline') {
                    const disc = edital.disciplines.find(d => d.id === id);
                    if (disc) {
                        promises.push(generatePracticeQuestions(null, disc.name, count));
                    }
                } else {
                    let found = false;
                    for (const disc of edital.disciplines) {
                        const topic = disc.topics.find(t => t.id === id);
                        if (topic) {
                            promises.push(generatePracticeQuestions(topic.name, disc.name, count));
                            found = true;
                            break;
                        }
                    }
                }
            }

            const results = await Promise.all(promises);
            const allQuestions = results.flat();
            
            if (allQuestions.some(q => q.question.includes("Modo Offline"))) setIsOfflineMode(true);

            // Shuffle
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }

            setQuizQuestions(allQuestions);
            updateUsage(allQuestions.length);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar simulado. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- INTERAÇÃO DO QUIZ (COMUM) ---

    const handleAnswerQuiz = (optionIndex: number) => {
        if (showFeedback) return;
        setSelectedOption(optionIndex);
        setShowFeedback(true);
        if (optionIndex === quizQuestions[quizIndex].correctAnswer) setQuizScore(prev => prev + 1);
    };

    const handleNextQuestion = () => {
        if (quizIndex < quizQuestions.length - 1) {
            setQuizIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setQuizFinished(true);
        // Salva histórico
        if (activeTab === 'single') {
            addQuestionLog({
                id: `ai-single-${Date.now()}`,
                disciplineId: singleDisciplineId,
                topicId: singleTopicId,
                total: quizQuestions.length,
                correct: quizScore,
                date: new Date()
            });
        } else {
            // Simulado: Tenta salvar genérico na primeira disciplina
            const mainDiscId = edital.disciplines[0]?.id;
            const mainTopicId = edital.disciplines[0]?.topics[0]?.id;
            if (mainDiscId && mainTopicId) {
                addQuestionLog({
                   id: `ai-sim-${Date.now()}`,
                   disciplineId: mainDiscId, 
                   topicId: mainTopicId,
                   total: quizQuestions.length,
                   correct: quizScore,
                   date: new Date()
               });
            }
        }
    };

    // --- RENDERIZADORES AUXILIARES ---

    const toggleExpand = (discId: string) => {
        setExpandedDisciplines(prev => {
            const next = new Set(prev);
            if (next.has(discId)) next.delete(discId);
            else next.add(discId);
            return next;
        });
    };

    const updateSelection = (id: string, delta: number) => {
        setSelections(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const renderCounter = (id: string) => {
        const count = selections[id] || 0;
        return (
            <div className="flex items-center gap-2">
                <button onClick={() => updateSelection(id, -1)} className={`p-1 rounded hover:bg-neutral-700 ${count === 0 ? 'text-neutral-600' : 'text-red-400'}`}><Minus size={16} /></button>
                <span className={`w-6 text-center font-bold ${count > 0 ? 'text-white' : 'text-neutral-600'}`}>{count}</span>
                <button onClick={() => updateSelection(id, 1)} className="p-1 rounded hover:bg-neutral-700 text-green-400"><Plus size={16} /></button>
            </div>
        );
    };

    const handleSaveManual = () => {
        if (!manualDisciplineId || !manualTopicId || !manualTotal || !manualCorrect) return;
        addQuestionLog({
            id: `q-${Date.now()}`,
            disciplineId: manualDisciplineId,
            topicId: manualTopicId,
            total: Number(manualTotal),
            correct: Number(manualCorrect),
            date: new Date()
        });
        setManualTotal('');
        setManualCorrect('');
        alert('Registro salvo com sucesso!');
    };

    const currentQuestion = quizQuestions[quizIndex];

    // Se estiver fazendo um quiz, mostra a interface de quiz independente da aba (overlay)
    if (quizQuestions.length > 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <button 
                    onClick={() => {
                        if (confirm("Sair do simulado atual? Seu progresso será perdido.")) {
                            resetQuizState();
                        }
                    }} 
                    className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4"
                >
                    <X size={20} /> Cancelar / Voltar
                </button>

                {!quizFinished && currentQuestion && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-neutral-400">Questão {quizIndex + 1} de {quizQuestions.length}</span>
                            {isOfflineMode && (
                                <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30">
                                    <WifiOff size={12}/> Modo Offline
                                </span>
                            )}
                            <span className="text-sm font-bold text-primary">Acertos: {quizScore}</span>
                        </div>
                        
                        <Card className="mb-6 border-primary/30">
                            <p className="text-lg font-medium text-white mb-6 leading-relaxed">
                                {currentQuestion.question}
                            </p>

                            <div className="space-y-3">
                                {currentQuestion.options?.map((option, idx) => {
                                    let btnClass = "bg-neutral-900 border-neutral-700 hover:border-neutral-500";
                                    if (showFeedback) {
                                        if (idx === currentQuestion.correctAnswer) btnClass = "bg-green-500/20 border-green-500 text-green-100";
                                        else if (idx === selectedOption) btnClass = "bg-red-500/20 border-red-500 text-red-100";
                                        else btnClass = "bg-neutral-900 border-neutral-700 opacity-50";
                                    } else if (idx === selectedOption) {
                                        btnClass = "bg-primary/20 border-primary text-white";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerQuiz(idx)}
                                            disabled={showFeedback}
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${btnClass}`}
                                        >
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)})</span> {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {showFeedback && (
                                <div className="mt-6 p-4 bg-neutral-900/50 rounded-lg border border-neutral-700 animate-fadeIn">
                                    <p className="font-bold text-sm text-neutral-300 mb-1">Comentário da IA:</p>
                                    <p className="text-sm text-neutral-400">{currentQuestion.explanation}</p>
                                    <button 
                                        onClick={handleNextQuestion}
                                        className="mt-4 w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        {quizIndex < quizQuestions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
                                    </button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {quizFinished && (
                    <Card className="text-center py-10 animate-fadeIn">
                        <div className="mb-4 inline-block p-4 bg-neutral-800 rounded-full">
                            {quizScore / quizQuestions.length >= 0.7 ? (
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            ) : (
                                <AlertTriangle className="w-12 h-12 text-yellow-500" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Treino Finalizado!</h2>
                        <p className="text-neutral-400 mb-6">Sua nota foi salva no histórico.</p>
                        
                        <div className="text-5xl font-bold text-primary mb-8">
                            {Math.round((quizScore / quizQuestions.length) * 100)}%
                        </div>

                        <button 
                            onClick={() => { setQuizQuestions([]); setSelections({}); }}
                            className="bg-neutral-700 hover:bg-neutral-600 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCw size={20} /> Voltar ao Menu
                        </button>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header e Abas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-neutral-800/50 p-2 rounded-xl border border-neutral-700">
                <button
                    onClick={() => setActiveTab('single')}
                    className={`py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                        activeTab === 'single' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <Zap size={18} /> Inéditas
                </button>
                <button
                    onClick={() => setActiveTab('simulado')}
                    className={`py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                        activeTab === 'simulado' 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <Brain size={18} /> Simulados
                </button>
                <button
                    onClick={() => setActiveTab('bancas')}
                    className={`py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                        activeTab === 'bancas' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <Landmark size={18} /> Bancas
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                        activeTab === 'manual' 
                        ? 'bg-neutral-600 text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <Save size={18} /> Manual
                </button>
            </div>

            {/* TAB 1: QUESTÕES INÉDITAS (SINGLE) */}
            {activeTab === 'single' && (
                <Card>
                    <div className="mb-6 border-b border-neutral-700 pb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                            <Zap className="text-yellow-400" /> Questões Inéditas
                        </h2>
                        <p className="text-neutral-400 text-sm">
                            Gere questões focadas em um único tópico específico para masterizar o assunto.
                        </p>
                        {!isPremium && (
                            <div className="mt-3 flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30 w-fit">
                                <Lock size={12} /> <span>Limite Gratuito: {10 - dailyUsage} restantes hoje.</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 mb-1">Disciplina</label>
                                <select 
                                    value={singleDisciplineId}
                                    onChange={(e) => {
                                        setSingleDisciplineId(e.target.value);
                                        const disc = edital.disciplines.find(d => d.id === e.target.value);
                                        if (disc && disc.topics.length > 0) setSingleTopicId(disc.topics[0].id);
                                    }}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                                >
                                    {edital.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 mb-1">Assunto</label>
                                <select 
                                    value={singleTopicId}
                                    onChange={(e) => setSingleTopicId(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                                >
                                    {edital.disciplines.find(d => d.id === singleDisciplineId)?.topics.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-400 mb-2">Quantidade (1 a 100)</label>
                            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={singleCount} 
                                        onChange={(e) => setSingleCount(Number(e.target.value))}
                                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="100" 
                                            value={singleCount}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value) || 1;
                                                if (val > 100) val = 100;
                                                if (val < 1) val = 1;
                                                setSingleCount(val);
                                            }}
                                            className="w-20 bg-neutral-800 border border-neutral-600 rounded-lg p-2 text-center text-white font-bold focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-neutral-500">1</span>
                                    {!isPremium && singleCount > (10 - dailyUsage) && (
                                        <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                                            <Lock size={10} /> Requer Premium para {singleCount}
                                        </span>
                                    )}
                                    <span className="text-xs text-neutral-500">100</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerateSingle}
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={20}/> Gerando...</>
                            ) : (
                                <><Zap size={20} /> Gerar Agora</>
                            )}
                        </button>
                    </div>
                </Card>
            )}

            {/* TAB 2: GERADOR DE SIMULADOS (MIX) */}
            {activeTab === 'simulado' && (
                <Card>
                    <div className="mb-6 border-b border-neutral-700 pb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                            <LayoutGrid className="text-purple-400" /> Montar Simulado
                        </h2>
                        <p className="text-neutral-400 text-sm">
                            Misture disciplinas e tópicos. A IA criará um simulado balanceado para você.
                        </p>
                        {!isPremium && (
                            <div className="mt-3 flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30 w-fit">
                                <Lock size={12} /> <span>Limite Gratuito: {10 - dailyUsage} restantes hoje.</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${simuladoMode === 'discipline' ? 'border-primary' : 'border-neutral-500'}`}>
                                {simuladoMode === 'discipline' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                            <input type="radio" className="hidden" checked={simuladoMode === 'discipline'} onChange={() => { setSimuladoMode('discipline'); setSelections({}); }} />
                            <span className="text-white font-medium">Por Disciplina</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${simuladoMode === 'topic' ? 'border-primary' : 'border-neutral-500'}`}>
                                {simuladoMode === 'topic' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                            <input type="radio" className="hidden" checked={simuladoMode === 'topic'} onChange={() => { setSimuladoMode('topic'); setSelections({}); }} />
                            <span className="text-white font-medium">Por Assunto</span>
                        </label>
                    </div>

                    <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {edital.disciplines.map(disc => (
                            <div key={disc.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
                                <div className={`p-3 flex items-center justify-between ${simuladoMode === 'discipline' ? 'hover:bg-neutral-800 transition-colors' : ''}`}>
                                    <div className="flex items-center gap-3 flex-1">
                                        {simuladoMode === 'topic' && (
                                            <button onClick={() => toggleExpand(disc.id)} className="text-neutral-400 hover:text-white">
                                                {expandedDisciplines.has(disc.id) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                                            </button>
                                        )}
                                        <span className={`font-medium ${selections[disc.id] > 0 ? 'text-primary' : 'text-neutral-300'}`}>
                                            {disc.name}
                                        </span>
                                    </div>
                                    {simuladoMode === 'discipline' && renderCounter(disc.id)}
                                </div>
                                {simuladoMode === 'topic' && expandedDisciplines.has(disc.id) && (
                                    <div className="bg-neutral-950/30 border-t border-neutral-800 p-2 space-y-1">
                                        {disc.topics.map(topic => (
                                            <div key={topic.id} className="flex items-center justify-between p-2 rounded hover:bg-neutral-800/50 pl-8">
                                                <span className="text-sm text-neutral-400 truncate flex-1 pr-4">{topic.name}</span>
                                                {renderCounter(topic.id)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between sticky bottom-0">
                        <div>
                            <p className="text-xs text-neutral-500 uppercase font-bold">Total</p>
                            <p className="text-xl font-bold text-white">{totalSelectedQuestions} <span className="text-sm font-normal text-neutral-400">questões</span></p>
                        </div>
                        <button 
                            onClick={handleGenerateSimulado}
                            disabled={isGenerating || totalSelectedQuestions === 0}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Brain size={20} />}
                            <span className="hidden sm:inline">Gerar Simulado</span>
                        </button>
                    </div>
                </Card>
            )}

            {/* TAB 3: QUESTÕES DE BANCAS (EM BREVE) */}
            {activeTab === 'bancas' && (
                <Card className="flex flex-col items-center justify-center py-16 border-blue-500/20 bg-blue-900/10">
                    <div className="bg-blue-500/20 p-6 rounded-full mb-6 animate-pulse">
                        <Landmark size={48} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Em Breve</h2>
                    <p className="text-neutral-400 text-center max-w-md mb-6">
                        Estamos integrando milhares de questões reais de bancas (FGV, Cebraspe, Vunesp, etc) diretamente na plataforma.
                    </p>
                    <div className="flex gap-2 text-sm text-blue-300 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/30">
                        <Clock size={16} /> Disponível na próxima atualização
                    </div>
                </Card>
            )}

            {/* TAB 4: REGISTRO MANUAL */}
            {activeTab === 'manual' && (
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Save className="text-neutral-400" /> Registro Manual
                    </h2>
                    <p className="text-neutral-400 text-sm mb-6">
                        Fez questões em outro site ou PDF? Registre seu desempenho aqui para manter as métricas atualizadas.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 mb-1">Disciplina</label>
                            <select 
                                value={manualDisciplineId}
                                onChange={(e) => {
                                    setManualDisciplineId(e.target.value);
                                    const disc = edital.disciplines.find(d => d.id === e.target.value);
                                    if (disc && disc.topics.length > 0) setManualTopicId(disc.topics[0].id);
                                }}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                            >
                                {edital.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 mb-1">Assunto</label>
                            <select 
                                value={manualTopicId}
                                onChange={(e) => setManualTopicId(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                            >
                                {edital.disciplines.find(d => d.id === manualDisciplineId)?.topics.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 mb-1">Questões Totais</label>
                            <input type="number" value={manualTotal} onChange={e => setManualTotal(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 mb-1">Acertos</label>
                            <input type="number" value={manualCorrect} onChange={e => setManualCorrect(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                    <button onClick={handleSaveManual} className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 rounded-lg transition-colors">
                        Salvar Registro
                    </button>
                </Card>
            )}

            {/* Histórico de Desempenho (Sempre visível) */}
            <div className="mt-8 pt-8 border-t border-neutral-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock size={20}/> Histórico Recente</h3>
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-neutral-400">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-900">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Nota</th>
                                <th className="px-6 py-3 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studyData.questions.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center italic">Nenhum registro encontrado.</td></tr>
                            ) : (
                                studyData.questions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map(log => {
                                    const percent = (log.correct / log.total) * 100;
                                    let colorClass = "text-red-400";
                                    if (percent >= 80) colorClass = "text-green-400";
                                    else if (percent >= 60) colorClass = "text-yellow-400";

                                    return (
                                        <tr key={log.id} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                                            <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{log.correct}/{log.total}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${colorClass}`}>{percent.toFixed(0)}%</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
