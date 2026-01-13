
import React, { useMemo } from 'react';
import type { Edital, StudyData } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { BookOpen, CheckCircle, Clock, Target, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from './common/Card.tsx';

interface DashboardProps {
    edital: Edital;
    studyData: StudyData;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ edital, studyData }) => {

    // --- CÁLCULOS GERAIS ---
    
    const totalTopics = useMemo(() => edital.disciplines.reduce((acc, d) => acc + d.topics.length, 0), [edital]);
    
    const completedTopics = useMemo(() => {
        return Object.keys(studyData.topicStatus).filter(topicId => !studyData.topicStatus[topicId].pending).length;
    }, [studyData.topicStatus]);

    const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    
    const totalStudyTime = useMemo(() => {
        return studyData.sessions.reduce((acc, session) => acc + session.duration, 0) / 3600; // in hours
    }, [studyData.sessions]);

    const totalQuestions = useMemo(() => {
        return studyData.questions.reduce((acc, q) => acc + q.total, 0);
    }, [studyData.questions]);

    const overallAccuracy = useMemo(() => {
        const total = studyData.questions.reduce((acc, q) => acc + q.total, 0);
        if (total === 0) return 0;
        const correct = studyData.questions.reduce((acc, q) => acc + q.correct, 0);
        return (correct / total) * 100;
    }, [studyData.questions]);

    const pendingRevisions = useMemo(() => {
        const now = new Date();
        return studyData.revisions.filter(r => !r.completed && new Date(r.dueDate) <= now);
    }, [studyData.revisions]);

    // --- CÁLCULOS DE DESEMPENHO (PERFORMANCE) ---

    // 1. Desempenho por Disciplina
    const performanceByDiscipline = useMemo(() => {
        const stats: Record<string, { correct: number, total: number, name: string }> = {};
        
        // Inicializa mapa
        edital.disciplines.forEach(d => {
            stats[d.id] = { correct: 0, total: 0, name: d.name };
        });

        // Soma questões
        studyData.questions.forEach(q => {
            if (stats[q.disciplineId]) {
                stats[q.disciplineId].correct += q.correct;
                stats[q.disciplineId].total += q.total;
            }
        });

        // Transforma em array e calcula %
        return Object.values(stats)
            .filter(s => s.total > 0) // Mostra apenas disciplinas que tiveram questões
            .map(s => ({
                name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name, // Trunca nomes longos
                fullName: s.name,
                accuracy: Math.round((s.correct / s.total) * 100),
                total: s.total
            }))
            .sort((a, b) => b.accuracy - a.accuracy); // Ordena do melhor para o pior
    }, [edital, studyData.questions]);

    // 2. Desempenho por Assunto (Top & Bottom)
    const performanceByTopic = useMemo(() => {
        const stats: Record<string, { correct: number, total: number, name: string }> = {};

        // Cria mapa de nomes de tópicos para acesso rápido
        const topicNames: Record<string, string> = {};
        edital.disciplines.forEach(d => d.topics.forEach(t => topicNames[t.id] = t.name));

        studyData.questions.forEach(q => {
            if (!stats[q.topicId]) {
                stats[q.topicId] = { correct: 0, total: 0, name: topicNames[q.topicId] || 'Desconhecido' };
            }
            stats[q.topicId].correct += q.correct;
            stats[q.topicId].total += q.total;
        });

        return Object.values(stats)
            .map(s => ({
                name: s.name.length > 40 ? s.name.substring(0, 40) + '...' : s.name,
                fullName: s.name,
                accuracy: Math.round((s.correct / s.total) * 100),
                questions: s.total
            }))
            .sort((a, b) => a.accuracy - b.accuracy); // Ordena do Pior para o Melhor (para focar no que precisa melhorar)
    }, [edital, studyData.questions]);

    const stats = [
        { label: 'Progresso Edital', value: `${overallProgress.toFixed(1)}%`, icon: CheckCircle },
        { label: 'Horas Líquidas', value: `${totalStudyTime.toFixed(1)}h`, icon: Clock },
        { label: 'Questões Feitas', value: totalQuestions, icon: Target },
        { label: 'Revisões Pendentes', value: pendingRevisions.length, icon: Bell }
    ];

    // Custom Tooltip para os gráficos
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold text-sm mb-1">{payload[0].payload.fullName}</p>
                    <p className="text-primary text-sm">
                        Taxa de Acerto: <span className="font-bold">{payload[0].value}%</span>
                    </p>
                    <p className="text-neutral-400 text-xs">
                        Baseado em {payload[0].payload.total || payload[0].payload.questions} questões
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <Card key={stat.label}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-lg">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-neutral-400 text-sm">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Linha 1: Desempenho Geral e Por Disciplina */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Pizza (Geral) */}
                <Card>
                    <CardHeader icon={Target} title="Taxa de Acerto Geral" />
                     <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{ name: 'Acertos', value: overallAccuracy }, { name: 'Erros', value: 100 - overallAccuracy }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="cell-0" fill="#10b981" />
                                    <Cell key="cell-1" fill="#ef4444" />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className={`text-3xl font-bold ${overallAccuracy >= 80 ? 'text-green-400' : overallAccuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {overallAccuracy.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Gráfico de Barras (Disciplinas) */}
                <Card className="lg:col-span-2">
                    <CardHeader icon={TrendingUp} title="Desempenho por Disciplina" />
                    <div className="h-64">
                        {performanceByDiscipline.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceByDiscipline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                                    <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                                        {performanceByDiscipline.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.accuracy >= 80 ? '#10b981' : entry.accuracy >= 60 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                                <AlertTriangle className="mb-2 h-8 w-8 opacity-50" />
                                <p>Faça questões para ver o gráfico.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Linha 2: Desempenho por Assunto (Detalhado) */}
            <Card>
                <CardHeader icon={BookOpen} title="Análise por Assunto (Seus pontos de atenção)" />
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar">
                    {performanceByTopic.length > 0 ? (
                        performanceByTopic.map((topic, idx) => (
                            <div key={idx} className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800 flex items-center justify-between group hover:border-neutral-600 transition-colors">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-sm font-medium text-white truncate" title={topic.fullName}>{topic.name}</p>
                                        <span className={`text-xs font-bold ${topic.accuracy >= 80 ? 'text-green-400' : topic.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {topic.accuracy}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${topic.accuracy >= 80 ? 'bg-green-500' : topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                            style={{ width: `${topic.accuracy}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-1">{topic.questions} questões realizadas</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-neutral-500 py-8">Nenhum dado de assunto registrado ainda.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};
