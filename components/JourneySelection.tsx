
import React, { useState, useEffect } from 'react';
import type { Journey, Edital, StudyData, TopicStatus, StudySessionData, QuestionLog } from '../types.ts';
import { PlusCircle, LayoutDashboard, BookOpen, Target, Bell, Users, ChevronDown, Loader2, Play, CheckCircle2, Crown, ShoppingBag } from 'lucide-react';
import { supabase } from '../services/supabase.ts';
import { User } from '@supabase/supabase-js';
import { Setup } from './Setup.tsx';
import { Dashboard } from './Dashboard.tsx';
import { EditalView } from './EditalView.tsx';
import { QuestionsTracker } from './QuestionsTracker.tsx';
import { Revisions } from './Revisions.tsx';
import { Arena } from './Arena.tsx';
import { StudySession } from './StudySession.tsx';
import { Materials } from './Materials.tsx';
import { UserProfile } from './UserProfile.tsx';
import { Logo } from './common/Logo.tsx';
import { Pricing } from './Pricing.tsx';

type View = 'dashboard' | 'edital' | 'questions' | 'revisions' | 'arena' | 'materials' | 'study' | 'profile';

const SuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
        <div className="bg-neutral-900 border-2 border-primary/50 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(139,92,246,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary animate-gradient-x"></div>
            <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown size={40} className="text-primary animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Liberado!</h2>
            <p className="text-neutral-400 mb-6 text-sm">Sua assinatura Premium foi ativada. Aproveite sua Inteligência Artificial ilimitada!</p>
            <button 
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
                Bons Estudos!
            </button>
        </div>
    </div>
);

const MainAppLayout: React.FC<{
    journeys: Journey[];
    activeJourney: Journey;
    setActiveJourneyId: (id: string | null) => void;
    onStartNewJourney: () => void;
    user: User;
    saveStatus: 'saved' | 'saving' | 'error';
    updateJourneyData: (updatedData: Partial<StudyData>) => Promise<void>;
    updateEditalStructure: (newEdital: Edital) => Promise<void>;
    showPricing: boolean;
    setShowPricing: (show: boolean) => void;
}> = ({ journeys, activeJourney, setActiveJourneyId, onStartNewJourney, user, saveStatus, updateJourneyData, updateEditalStructure, showPricing, setShowPricing }) => {
    const [view, setView] = useState<View>('dashboard');
    const [isPremium, setIsPremium] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            setShowSuccess(true);
            window.history.replaceState(null, '', window.location.pathname);
        }

        const checkPremium = async () => {
            const { data } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
            if (data) setIsPremium(!!data.is_premium);
        };
        checkPremium();

        const channel = supabase.channel('premium-update').on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles', 
            filter: `id=eq.${user.id}` 
        }, (payload) => {
            if (payload.new.is_premium) {
                setIsPremium(true);
                setShowPricing(false);
                setShowSuccess(true);
            }
        }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user.id, setShowPricing]);

    const addStudySession = (session: StudySessionData) => {
        const { studyData } = activeJourney;
        const newSessions = [...studyData.sessions, session];
        let statusKey: keyof TopicStatus | null = null;
        if (session.type === 'pdf' || session.type === 'theory') statusKey = 'pdf';
        else if (session.type === 'video') statusKey = 'video';
        else if (session.type === 'questions') statusKey = 'questions';
        else if (session.type === 'summary') statusKey = 'summary';

        const currentTopicStatus = studyData.topicStatus[session.topicId] || { pending: true, pdf: false, video: false, law: false, questions: false, summary: false };
        const newTopicStatus = { ...studyData.topicStatus, [session.topicId]: { ...currentTopicStatus, ...(statusKey ? {[statusKey]: true} : {}), pending: false } };
        
        const now = new Date();
        const newRevisions = [...studyData.revisions];
        [1, 7, 30].forEach(days => {
            const dueDate = new Date(now);
            dueDate.setDate(dueDate.getDate() + days);
            newRevisions.push({ id: `rev-${session.topicId}-${days}d-${Date.now()}`, topicId: session.topicId, dueDate, completed: false, label: `${days}d` });
        });
        updateJourneyData({ sessions: newSessions, topicStatus: newTopicStatus, revisions: newRevisions });
    };

    const addQuestionLog = (log: QuestionLog) => updateJourneyData({ questions: [...activeJourney.studyData.questions, log] });
    
    const handleRegisterStudy = (topicId: string, methods: Partial<TopicStatus>) => {
        const current = activeJourney.studyData.topicStatus[topicId] || { pending: true, pdf: false, video: false, law: false, questions: false, summary: false };
        updateJourneyData({ topicStatus: { ...activeJourney.studyData.topicStatus, [topicId]: { ...current, ...methods, pending: false } } });
    };

    const renderView = () => {
        const { edital, studyData } = activeJourney;
        switch (view) {
            case 'dashboard': return <Dashboard edital={edital} studyData={studyData} />;
            case 'edital': return <EditalView edital={edital} topicStatus={studyData.topicStatus} onRegisterStudy={handleRegisterStudy} onUpdateEdital={updateEditalStructure} />;
            case 'questions': return <QuestionsTracker studyData={studyData} addQuestionLog={addQuestionLog} edital={edital} isPremium={isPremium} onOpenPricing={() => setShowPricing(true)} />;
            case 'revisions': return <Revisions studyData={studyData} setStudyData={(updater) => updateJourneyData(typeof updater === 'function' ? updater(studyData) : updater)} edital={edital} />;
            case 'arena': return <Arena studyData={studyData} user={user} />;
            case 'materials': return <Materials edital={edital} isPremium={isPremium} onOpenPricing={() => setShowPricing(true)} />;
            case 'study': return <StudySession edital={edital} onSessionEnd={addStudySession} backToDashboard={() => setView('dashboard')} />;
            case 'profile': return <UserProfile user={user} />;
            default: return <Dashboard edital={edital} studyData={studyData} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-sans">
            {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
            <header className="bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800 p-3 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Logo className="h-8 w-8" />
                    <div className="group relative">
                        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-800">
                            <h2 className="text-md font-bold truncate max-w-[150px]">{activeJourney.edital.name}</h2>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        <div className="absolute left-0 mt-2 w-72 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl p-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                            {journeys.map(j => (
                                <button key={j.id} onClick={() => setActiveJourneyId(j.id)} className={`block w-full text-left px-4 py-2 text-sm rounded-md ${j.id === activeJourney.id ? 'bg-primary text-white' : 'hover:bg-neutral-700'}`}>{j.edital.name}</button>
                            ))}
                            <div className="border-t border-neutral-700 my-1"></div>
                            <button onClick={onStartNewJourney} className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 rounded-md flex items-center gap-2"><PlusCircle size={16} /> Nova Jornada</button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex mr-4">
                         {saveStatus === 'saving' && <span className="text-[10px] text-yellow-500 font-bold animate-pulse">SYNCING...</span>}
                         {saveStatus === 'saved' && <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> NUVEM OK</span>}
                    </div>
                    {!isPremium ? (
                        <button onClick={() => setShowPricing(true)} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1.5 px-3 rounded-lg text-xs sm:text-sm flex items-center gap-1">
                            <Crown size={16} /> <span className="hidden sm:inline">Vire Premium</span>
                        </button>
                    ) : (
                        <div className="bg-primary/20 text-primary border border-primary/30 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1">
                            <Crown size={16} /> <span className="hidden sm:inline">Premium Ativo</span>
                        </div>
                    )}
                    <button onClick={() => setView('study')} className="bg-primary text-white font-bold py-1.5 px-3 rounded-lg text-xs sm:text-sm flex items-center gap-1 hover:brightness-110">
                        <Play size={16} /> Estudar
                    </button>
                    <button onClick={() => setView('profile')} className="h-8 w-8 bg-secondary rounded-full font-bold text-xs flex items-center justify-center border border-white/10 hover:border-white/30">
                        {user.email?.charAt(0).toUpperCase()}
                    </button>
                </div>
            </header>
            <nav className="bg-neutral-950/80 border-b border-neutral-800 px-2 flex gap-1 overflow-x-auto no-scrollbar">
                {[
                    {id:'dashboard', icon:LayoutDashboard, label:'Início'},
                    {id:'edital', icon:BookOpen, label:'Edital'},
                    {id:'questions', icon:Target, label:'Questões'},
                    {id:'revisions', icon:Bell, label:'Revisões'},
                    {id:'arena', icon:Users, label:'Arena'},
                    {id:'materials', icon:ShoppingBag, label:'Loja'}
                ].map(item => (
                    <button key={item.id} onClick={() => setView(item.id as View)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${view === item.id ? 'text-primary border-primary' : 'text-neutral-500 border-transparent'}`}>
                        <item.icon size={18} /> <span className="hidden sm:inline">{item.label}</span>
                    </button>
                ))}
            </nav>
            <main className="flex-1 p-4 overflow-y-auto">{renderView()}</main>
            {showPricing && <Pricing onClose={() => setShowPricing(false)} user={user} />}
        </div>
    );
};

export const JourneySelection: React.FC<{ user: User }> = ({ user }) => {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('journeys').select('*').eq('user_id', user.id);
            if (data && data.length > 0) {
                setJourneys(data.map(d => ({ id: d.id, edital: d.edital, studyData: d.study_data })));
                setActiveId(data[0].id);
            } else setShowSetup(true);
            setLoading(false);
        };
        fetch();
    }, [user.id]);

    const updateData = async (updated: Partial<StudyData>) => {
        if (!activeId) return;
        setSaveStatus('saving');
        const active = journeys.find(j => j.id === activeId);
        const newData = { ...active!.studyData, ...updated };
        setJourneys(journeys.map(j => j.id === activeId ? { ...j, studyData: newData } : j));
        const { error } = await supabase.from('journeys').update({ study_data: newData }).eq('id', activeId);
        setSaveStatus(error ? 'error' : 'saved');
    };

    const updateEdital = async (newEdital: Edital) => {
        if (!activeId) return;
        setSaveStatus('saving');
        setJourneys(journeys.map(j => j.id === activeId ? { ...j, edital: newEdital } : j));
        const { error } = await supabase.from('journeys').update({ edital: newEdital }).eq('id', activeId);
        setSaveStatus(error ? 'error' : 'saved');
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-neutral-900"><Loader2 className="animate-spin text-primary" /></div>;
    if (showSetup) return <Setup userId={user.id} onJourneyCreated={(j) => { setJourneys([...journeys, j]); setActiveId(j.id); setShowSetup(false); }} onCancel={() => { if(journeys.length > 0) setShowSetup(false); }} />;
    
    const active = journeys.find(j => j.id === activeId);
    return <MainAppLayout 
        journeys={journeys} 
        activeJourney={active!} 
        setActiveJourneyId={setActiveId} 
        onStartNewJourney={() => setShowSetup(true)}
        user={user} 
        saveStatus={saveStatus} 
        updateJourneyData={updateData} 
        updateEditalStructure={updateEdital}
        showPricing={showPricing} 
        setShowPricing={setShowPricing}
    />;
};
