
import React from 'react';
import type { Edital, StudyData, Revision } from '../types.ts';
import { Card } from './common/Card.tsx';
import { Bell, Calendar, CircleCheck, Clock, CircleAlert } from 'lucide-react';

interface RevisionsProps {
    studyData: StudyData;
    setStudyData: React.Dispatch<React.SetStateAction<StudyData>>;
    edital: Edital;
}

export const Revisions: React.FC<RevisionsProps> = ({ studyData, setStudyData, edital }) => {
    const topicMap = React.useMemo(() => {
        const map = new Map<string, { topicName: string; disciplineName: string }>();
        edital.disciplines.forEach(d => {
            d.topics.forEach(t => {
                map.set(t.id, { topicName: t.name, disciplineName: d.name });
            });
        });
        return map;
    }, [edital]);

    const handleComplete = (revisionId: string) => {
        setStudyData(prev => ({
            ...prev,
            revisions: prev.revisions.map(r => r.id === revisionId ? { ...r, completed: true } : r)
        }));
    };
    
    const now = new Date();
    // Reset time to compare just dates for "Today"
    const today = new Date();
    today.setHours(0,0,0,0);

    const pendingRevisions = studyData.revisions.filter(r => !r.completed).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const overdue = pendingRevisions.filter(r => new Date(r.dueDate) < today);
    const dueToday = pendingRevisions.filter(r => {
        const d = new Date(r.dueDate);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
    });
    const upcoming = pendingRevisions.filter(r => {
        const d = new Date(r.dueDate);
        d.setHours(0,0,0,0);
        return d.getTime() > today.getTime();
    });

    const getLabelColor = (label: string | undefined) => {
        if (!label) return 'bg-neutral-700 text-neutral-300 border-neutral-600';
        
        if (label.includes('24h')) return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
        if (label.includes('7 d')) return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
        if (label.includes('30 d')) return 'bg-green-500/20 text-green-300 border-green-500/50';
        return 'bg-neutral-700 text-neutral-300 border-neutral-600';
    };

    const RevisionList = ({ items, title, icon: Icon, emptyMsg, type }: any) => (
        <Card className="mb-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${type === 'overdue' ? 'text-red-400' : type === 'today' ? 'text-yellow-400' : 'text-white'}`}>
                <Icon className="h-6 w-6"/> {title} <span className="text-sm font-normal ml-2 opacity-60">({items.length})</span>
            </h3>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-neutral-500 italic py-4 text-center">{emptyMsg}</p>
                ) : (
                    items.map((rev: Revision) => {
                        const info = topicMap.get(rev.topicId);
                        const isLate = new Date(rev.dueDate) < today;
                        const label = rev.label || 'Rev';
                        
                        return (
                            <div key={rev.id} className="bg-neutral-800/50 border border-neutral-700/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-neutral-800 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getLabelColor(rev.label)}`}>
                                            {label}
                                        </span>
                                        <span className="text-xs text-neutral-500">{new Date(rev.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-semibold text-neutral-200">{info?.topicName}</h4>
                                    <p className="text-xs text-neutral-400">{info?.disciplineName}</p>
                                </div>
                                <button 
                                    onClick={() => handleComplete(rev.id)}
                                    className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <CircleCheck size={16} /> Concluir
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">Central de Revisões</h2>
                <p className="text-neutral-400">O segredo da aprovação é a repetição. Mantenha suas revisões em dia.</p>
            </div>

            {overdue.length > 0 && (
                <RevisionList items={overdue} title="Atrasadas" icon={CircleAlert} type="overdue" emptyMsg="Nenhuma revisão atrasada." />
            )}

            <RevisionList items={dueToday} title="Para Hoje" icon={Bell} type="today" emptyMsg="Você está em dia por hoje!" />
            
            <RevisionList items={upcoming} title="Próximas" icon={Calendar} type="upcoming" emptyMsg="Nada agendado para o futuro próximo." />
        </div>
    );
};
