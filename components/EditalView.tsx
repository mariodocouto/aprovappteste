
import React, { useState } from 'react';
import type { Edital, TopicStatus } from '../types.ts';
import { ChevronDown, ChevronRight, BookOpen, Monitor, FileText, SquareCheck, Edit, X, Check, Pencil, Trash2, Plus, Split, Save, Sparkles, Loader2 } from 'lucide-react';
import { updateEditalWithAI } from '../services/geminiService.ts';

interface EditalViewProps {
    edital: Edital;
    topicStatus: { [topicId: string]: TopicStatus };
    onRegisterStudy: (topicId: string, methods: Partial<TopicStatus>) => void;
    onUpdateEdital: (newEdital: Edital) => Promise<void>;
}

const studyMethods = [
    { key: 'pdf', label: 'Leitura PDF', icon: BookOpen },
    { key: 'video', label: 'Videoaula', icon: Monitor },
    { key: 'law', label: 'Lei Seca', icon: FileText },
    { key: 'summary', label: 'Resumo', icon: Edit },
    { key: 'questions', label: 'Questões', icon: SquareCheck },
] as const;

// Componente Modal Interno
const StudyModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    topicName: string;
    currentStatus: Partial<TopicStatus>;
    onSave: (methods: Partial<TopicStatus>) => void;
}> = ({ isOpen, onClose, topicName, currentStatus, onSave }) => {
    const [methods, setMethods] = useState<Partial<TopicStatus>>({});

    if (!isOpen) return null;

    const toggleMethod = (key: keyof TopicStatus) => {
        setMethods(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onSave(methods);
        setMethods({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">Registrar Estudo</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={24} /></button>
                </div>
                <p className="text-neutral-300 mb-6 text-sm">O que você estudou em: <br/><span className="text-primary font-semibold">{topicName}</span>?</p>
                
                <div className="grid grid-cols-1 gap-3 mb-6">
                    {studyMethods.map(method => {
                        const isSelected = methods[method.key as keyof TopicStatus] || currentStatus?.[method.key as keyof TopicStatus];
                        return (
                            <button
                                key={method.key}
                                onClick={() => toggleMethod(method.key as keyof TopicStatus)}
                                className={`flex items-center p-3 rounded-lg border transition-all ${
                                    isSelected 
                                    ? 'bg-primary/20 border-primary text-white' 
                                    : 'bg-neutral-700 border-transparent text-neutral-400 hover:bg-neutral-600'
                                }`}
                            >
                                <method.icon className={`mr-3 h-5 w-5 ${isSelected ? 'text-primary' : ''}`} />
                                <span>{method.label}</span>
                                {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                >
                    Confirmar e Agendar Revisões
                </button>
            </div>
        </div>
    );
};

// Componente Modal de Edição com IA
const AiEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (prompt: string) => void;
    isProcessing: boolean;
}> = ({ isOpen, onClose, onConfirm, isProcessing }) => {
    const [prompt, setPrompt] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-purple-400" size={24} /> Personalizar com IA
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={24} /></button>
                </div>
                
                <p className="text-neutral-300 text-sm mb-4">
                    Diga para a IA como você quer organizar seu edital. <br/>
                    <span className="text-neutral-500 text-xs italic">Ex: "Divida Direito Penal em Parte Geral e Especial", "Adicione a disciplina de Espanhol", "Remova o tópico X".</span>
                </p>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Digite seu comando aqui..."
                    className="w-full h-32 bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none mb-4 resize-none"
                    disabled={isProcessing}
                />

                <button 
                    onClick={() => onConfirm(prompt)}
                    disabled={!prompt.trim() || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Processando...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} /> Atualizar Edital
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Componente de Item de Tópico (Visualização ou Edição)
const TopicItem: React.FC<{ 
    topic: Edital['disciplines'][0]['topics'][0]; 
    status: TopicStatus; 
    onOpenModal: (topicId: string, topicName: string) => void;
    isEditing: boolean;
    onUpdateTopicName: (id: string, newName: string) => void;
    onDeleteTopic: (id: string) => void;
    onExplodeTopic: (id: string) => void;
}> = ({ topic, status, onOpenModal, isEditing, onUpdateTopicName, onDeleteTopic, onExplodeTopic }) => {
    const hasStudied = status && !status.pending;
    
    if (isEditing) {
        return (
            <div className="pl-4 py-2 border-l-2 border-neutral-700 ml-4 flex items-center gap-2 rounded-r-lg">
                <input 
                    type="text" 
                    value={topic.name}
                    onChange={(e) => onUpdateTopicName(topic.id, e.target.value)}
                    className="flex-1 bg-neutral-800 text-white text-sm p-2 rounded border border-neutral-700 focus:border-primary outline-none"
                />
                <button 
                    onClick={() => onExplodeTopic(topic.id)}
                    className="p-2 text-yellow-500 hover:bg-neutral-700 rounded"
                    title="Explodir Tópico (Dividir em vários)"
                >
                    <Split size={16} />
                </button>
                <button 
                    onClick={() => onDeleteTopic(topic.id)}
                    className="p-2 text-red-500 hover:bg-neutral-700 rounded"
                    title="Excluir Tópico"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="pl-4 py-3 border-l-2 border-neutral-700 ml-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-800/50 rounded-r-lg transition-colors group">
            <div className="flex-1">
                <p className={`text-sm md:text-base ${hasStudied ? 'text-white' : 'text-neutral-400'}`}>{topic.name}</p>
                {hasStudied && (
                    <div className="flex gap-2 mt-2">
                        {status.pdf && <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">PDF</span>}
                        {status.video && <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded border border-red-500/30">Video</span>}
                        {status.law && <span className="bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded border border-yellow-500/30">Lei</span>}
                        {status.questions && <span className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded border border-green-500/30">Questões</span>}
                        {status.summary && <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-500/30">Resumo</span>}
                    </div>
                )}
            </div>
            <button 
                onClick={() => onOpenModal(topic.id, topic.name)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
                    hasStudied 
                    ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' 
                    : 'bg-primary text-white hover:bg-primary-700'
                }`}
            >
                {hasStudied ? 'Complementar' : 'Registrar'}
            </button>
        </div>
    );
};

export const EditalView: React.FC<EditalViewProps> = ({ edital, topicStatus, onRegisterStudy, onUpdateEdital }) => {
    const [openDisciplines, setOpenDisciplines] = useState<Set<string>>(new Set([edital.disciplines[0]?.id]));
    const [modalState, setModalState] = useState<{ isOpen: boolean; topicId: string; topicName: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Estados para IA
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    // Estado local para edição (reflete as props mas permite manipulação antes de salvar)
    const [localEdital, setLocalEdital] = useState<Edital>(edital);

    // Sincroniza localEdital quando edital prop muda (se não estiver editando)
    React.useEffect(() => {
        if (!isEditing) {
            setLocalEdital(edital);
        }
    }, [edital, isEditing]);

    const toggleDiscipline = (id: string) => {
        setOpenDisciplines(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSaveChanges = () => {
        onUpdateEdital(localEdital);
        setIsEditing(false);
    };

    const handleAiEdit = async (prompt: string) => {
        setIsAiProcessing(true);
        try {
            const newEdital = await updateEditalWithAI(localEdital, prompt);
            if (newEdital) {
                setLocalEdital(newEdital);
                setIsEditing(true); // Entra em modo de edição para conferir
                setIsAiModalOpen(false);
            } else {
                alert("A IA não conseguiu processar sua solicitação. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com a IA.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    // --- MANIPULADORES DE EDIÇÃO MANUAL ---

    const updateDisciplineName = (discId: string, newName: string) => {
        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.map(d => d.id === discId ? { ...d, name: newName } : d)
        }));
    };

    const deleteDiscipline = (discId: string) => {
        if (!confirm("Tem certeza que deseja remover esta disciplina inteira?")) return;
        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.filter(d => d.id !== discId)
        }));
    };

    const addDiscipline = () => {
        setLocalEdital(prev => ({
            ...prev,
            disciplines: [
                ...prev.disciplines,
                {
                    id: `disc-new-${Date.now()}`,
                    name: "Nova Disciplina",
                    topics: [{ id: `topic-new-${Date.now()}`, name: "Novo Tópico" }]
                }
            ]
        }));
    };

    const updateTopicName = (discId: string, topicId: string, newName: string) => {
        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.map(d => 
                d.id === discId 
                ? { ...d, topics: d.topics.map(t => t.id === topicId ? { ...t, name: newName } : t) }
                : d
            )
        }));
    };

    const deleteTopic = (discId: string, topicId: string) => {
        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.map(d => 
                d.id === discId 
                ? { ...d, topics: d.topics.filter(t => t.id !== topicId) }
                : d
            )
        }));
    };

    const addTopic = (discId: string) => {
        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.map(d => 
                d.id === discId 
                ? { ...d, topics: [...d.topics, { id: `topic-add-${Date.now()}`, name: "Novo Tópico" }] }
                : d
            )
        }));
    };

    const explodeTopic = (discId: string, topicId: string) => {
        const disc = localEdital.disciplines.find(d => d.id === discId);
        const topic = disc?.topics.find(t => t.id === topicId);
        
        if (!topic) return;

        let parts = topic.name.split(/[;\n•]+/);
        if (parts.length <= 1) {
             parts = topic.name.split(/,/);
        }

        const cleanParts = parts.map(p => p.trim()).filter(p => p.length > 2);

        if (cleanParts.length <= 1) {
            alert("Não foi possível dividir este tópico automaticamente (tente usar ; ou , para separar os itens).");
            return;
        }

        if (!confirm(`Deseja dividir este tópico em ${cleanParts.length} novos tópicos?`)) return;

        const newTopics = cleanParts.map((part, idx) => ({
            id: `topic-exploded-${topicId}-${idx}-${Date.now()}`,
            name: part
        }));

        setLocalEdital(prev => ({
            ...prev,
            disciplines: prev.disciplines.map(d => 
                d.id === discId 
                ? { 
                    ...d, 
                    topics: d.topics.flatMap(t => t.id === topicId ? newTopics : t) 
                  }
                : d
            )
        }));
    };

    return (
        <div className="bg-neutral-800/50 rounded-xl p-4 md:p-6 shadow-lg border border-neutral-700/50">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Conteúdo Programático
                        {isEditing && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded border border-yellow-500/50">MODO EDIÇÃO</span>}
                    </h2>
                    <p className="text-neutral-400">Gerencie e acompanhe seu edital.</p>
                </div>
                <div className="flex gap-2">
                    {!isEditing && (
                        <button 
                            onClick={() => setIsAiModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Sparkles size={18} /> IA Personalizar
                        </button>
                    )}
                    
                    {isEditing ? (
                        <button 
                            onClick={handleSaveChanges}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            <Save size={18} /> Salvar Edital
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Pencil size={18} /> Editar Manualmente
                        </button>
                    )}
                </div>
            </div>
            
            <div className="space-y-3">
                {localEdital.disciplines.map(discipline => {
                    const isOpen = openDisciplines.has(discipline.id);
                    const totalTopics = discipline.topics.length;
                    const completedTopics = discipline.topics.filter(t => topicStatus[t.id] && !topicStatus[t.id].pending).length;
                    const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
                    
                    return (
                        <div key={discipline.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
                            <div
                                className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-neutral-800 transition-colors"
                                onClick={() => !isEditing && toggleDiscipline(discipline.id)}
                            >
                                <div className="flex items-center gap-3 mb-2 sm:mb-0 flex-1">
                                    {!isEditing && (isOpen ? <ChevronDown className="h-5 w-5 text-primary"/> : <ChevronRight className="h-5 w-5 text-neutral-500"/>)}
                                    
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 w-full pr-4">
                                            <input 
                                                type="text" 
                                                value={discipline.name}
                                                onChange={(e) => updateDisciplineName(discipline.id, e.target.value)}
                                                className="flex-1 bg-neutral-800 text-white font-bold text-lg p-2 rounded border border-neutral-700 focus:border-primary outline-none"
                                            />
                                            <button onClick={() => deleteDiscipline(discipline.id)} className="p-2 text-red-500 hover:bg-neutral-700 rounded"><Trash2 size={20}/></button>
                                        </div>
                                    ) : (
                                        <h3 className="font-semibold text-lg text-neutral-200">{discipline.name}</h3>
                                    )}
                                </div>
                                
                                {!isEditing && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-neutral-400">{completedTopics}/{totalTopics}</span>
                                            <div className="w-24 h-1.5 bg-neutral-700 rounded-full mt-1">
                                                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {(isOpen || isEditing) && (
                                <div className="px-4 pb-4 pt-2 bg-neutral-900/30">
                                    {discipline.topics.map(topic => (
                                        <TopicItem 
                                            key={topic.id} 
                                            topic={topic} 
                                            status={topicStatus[topic.id]} 
                                            onOpenModal={(id, name) => setModalState({ isOpen: true, topicId: id, topicName: name })} 
                                            isEditing={isEditing}
                                            onUpdateTopicName={(id, name) => updateTopicName(discipline.id, id, name)}
                                            onDeleteTopic={(id) => deleteTopic(discipline.id, id)}
                                            onExplodeTopic={(id) => explodeTopic(discipline.id, id)}
                                        />
                                    ))}
                                    
                                    {isEditing && (
                                        <button 
                                            onClick={() => addTopic(discipline.id)}
                                            className="ml-8 mt-2 text-sm text-primary hover:text-white flex items-center gap-1 px-3 py-2 rounded hover:bg-neutral-800 transition-colors"
                                        >
                                            <Plus size={16} /> Adicionar Tópico
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {isEditing && (
                    <button 
                        onClick={addDiscipline}
                        className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Adicionar Nova Disciplina
                    </button>
                )}
            </div>

            {modalState && (
                <StudyModal 
                    isOpen={modalState.isOpen}
                    topicName={modalState.topicName}
                    currentStatus={topicStatus[modalState.topicId] || {}}
                    onClose={() => setModalState(null)}
                    onSave={(methods) => onRegisterStudy(modalState.topicId, methods)}
                />
            )}

            <AiEditModal 
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onConfirm={handleAiEdit}
                isProcessing={isAiProcessing}
            />
        </div>
    );
};
