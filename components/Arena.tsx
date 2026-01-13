
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from './common/Card.tsx';
import { Trophy, Shield, Flame, Star, Medal, Crown, Target, Users, Plus, Mail, UserPlus, Bell, Check, X, Loader2, RefreshCw } from 'lucide-react';
import type { StudyData, Group, Invitation } from '../types.ts';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.ts';

interface ArenaProps {
    studyData: StudyData;
    user: User;
}

interface ProfileStats {
    id: string;
    full_name: string;
    xp: number;
    level: number;
    total_hours: number;
    rank?: number;
}

export const Arena: React.FC<ArenaProps> = ({ studyData, user }) => {
    const [activeTab, setActiveTab] = useState<'ranking' | 'social'>('ranking');
    
    // Estados Sociais
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [inviteEmailOrCpf, setInviteEmailOrCpf] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState('');

    // Estado Ranking
    const [rankingList, setRankingList] = useState<ProfileStats[]>([]);
    const [loadingRanking, setLoadingRanking] = useState(false);

    const getErrorMessage = (error: any): string => {
        if (!error) return 'Erro desconhecido';
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        try {
            return JSON.stringify(error);
        } catch {
            return 'Erro interno';
        }
    };

    // --- CARREGAR DADOS ---

    useEffect(() => {
        if (activeTab === 'social') {
            fetchSocialData();
        } else if (activeTab === 'ranking') {
            fetchRankingData();
        }
    }, [activeTab]);

    const fetchRankingData = async () => {
        setLoadingRanking(true);
        try {
            // Busca top 20 usuários por XP
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, xp, level, total_hours')
                .order('xp', { ascending: false })
                .limit(20);

            if (error) throw error;
            
            if (data) {
                // Adiciona Rank
                const ranked = data.map((p, i) => ({ ...p, rank: i + 1 }));
                setRankingList(ranked);
            }
        } catch (error) {
            console.error("Erro ao buscar ranking:", error);
        } finally {
            setLoadingRanking(false);
        }
    };

    const fetchSocialData = async () => {
        setLoadingSocial(true);
        try {
            const { data: memberData } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
            if (memberData && memberData.length > 0) {
                const groupIds = memberData.map(m => m.group_id);
                const { data: groupsData } = await supabase.from('groups').select('*').in('id', groupIds);
                setMyGroups(groupsData || []);
            } else {
                setMyGroups([]);
            }

            const { data: invitesData } = await supabase.from('invitations').select('*, group:groups(*)').eq('invited_email', user.email).eq('status', 'pending');
            setInvitations(invitesData || []);
        } catch (error) {
            console.error("Erro ao carregar dados sociais:", error);
        } finally {
            setLoadingSocial(false);
        }
    };

    // --- AÇÕES SOCIAIS ---

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            const { data: groupData, error: groupError } = await supabase.from('groups').insert({ name: newGroupName, created_by: user.id }).select().single();
            if (groupError) throw groupError;

            if (groupData) {
                await supabase.from('group_members').insert({ group_id: groupData.id, user_id: user.id });
                setMyGroups([...myGroups, groupData]);
                setNewGroupName('');
                setIsCreatingGroup(false);
                setFeedbackMsg('Grupo criado!');
                setTimeout(() => setFeedbackMsg(''), 3000);
            }
        } catch (error: any) {
            setFeedbackMsg(`Erro: ${getErrorMessage(error)}`);
            setTimeout(() => setFeedbackMsg(''), 5000);
        }
    };

    const handleInvite = async (groupId: string) => {
        if (!inviteEmailOrCpf.trim()) return;
        let emailToInvite = inviteEmailOrCpf;
        const cleanInput = inviteEmailOrCpf.replace(/\D/g, '');
        
        if (cleanInput.length === 11 && !inviteEmailOrCpf.includes('@')) {
            const { data, error } = await supabase.rpc('get_email_by_cpf', { cpf_input: cleanInput });
            if (error || !data) {
                setFeedbackMsg('CPF não encontrado.');
                setTimeout(() => setFeedbackMsg(''), 3000);
                return;
            }
            emailToInvite = data;
        }

        try {
            const { error } = await supabase.from('invitations').insert({ group_id: groupId, invited_email: emailToInvite, invited_by: user.id });
            if (error) throw error;
            setFeedbackMsg('Convite enviado!');
            setInviteEmailOrCpf('');
            setTimeout(() => setFeedbackMsg(''), 3000);
        } catch (error: any) {
            setFeedbackMsg(`Erro: ${getErrorMessage(error)}`);
        }
    };

    const handleRespondInvite = async (inviteId: string, accept: boolean, groupId: string) => {
        try {
            await supabase.from('invitations').update({ status: accept ? 'accepted' : 'rejected' }).eq('id', inviteId);
            if (accept) {
                await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id });
                fetchSocialData();
            } else {
                setInvitations(prev => prev.filter(i => i.id !== inviteId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- ESTATÍSTICAS LOCAIS (Apenas para exibir resumo do usuário na header) ---
    const localStats = useMemo(() => {
        const totalSeconds = studyData.sessions.reduce((acc, s) => acc + s.duration, 0);
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalQuestions = studyData.questions.reduce((acc, q) => acc + q.total, 0);
        const totalCorrect = studyData.questions.reduce((acc, q) => acc + q.correct, 0);
        const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        const xp = (totalHours * 100) + (totalQuestions * 10);
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;
        return { totalHours, totalQuestions, accuracy, xp, level };
    }, [studyData]);

    const achievements = useMemo(() => [
        { name: 'Iniciante', description: 'Complete sua primeira hora', achieved: localStats.totalHours >= 1, icon: Star, color: 'text-yellow-400' },
        { name: 'Maratonista', description: '50 horas de estudo', achieved: localStats.totalHours >= 50, icon: Flame, color: 'text-orange-500' },
        { name: 'Sniper', description: 'Acerte 80% em 50+ questões', achieved: localStats.totalQuestions >= 50 && localStats.accuracy >= 80, icon: Target, color: 'text-red-500' },
        { name: 'Mestre', description: 'Alcance o nível 10', achieved: localStats.level >= 10, icon: Trophy, color: 'text-purple-500' },
    ], [localStats]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-indigo-500/30">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border-4 border-yellow-500">
                                <Crown size={32} className="text-yellow-500" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full border border-neutral-900">
                                Lvl {localStats.level}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Arena AprovApp</h2>
                            <p className="text-indigo-200 text-sm">{localStats.xp} XP Total</p>
                        </div>
                    </div>
                    
                    <div className="flex bg-black/20 p-1 rounded-lg backdrop-blur-sm ml-auto w-full md:w-auto">
                        <button onClick={() => setActiveTab('ranking')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ranking' ? 'bg-white text-primary shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <Trophy size={16} /> Ranking Global
                        </button>
                        <button onClick={() => setActiveTab('social')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 relative ${activeTab === 'social' ? 'bg-white text-primary shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <Users size={16} /> Grupos
                            {invitations.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB RANKING */}
            {activeTab === 'ranking' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                <Trophy className="text-yellow-400" /> Ranking Global (Top 20)
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={fetchRankingData} className="p-2 hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-white" title="Atualizar">
                                    {loadingRanking ? <Loader2 className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {rankingList.length === 0 && !loadingRanking ? (
                                <p className="text-center text-neutral-500 py-4">Nenhum competidor encontrado ainda.</p>
                            ) : (
                                rankingList.map((player) => {
                                    const isMe = player.id === user.id;
                                    // Use full_name as seed but if it's undefined/null use 'user'
                                    const avatarSeed = (player.full_name || 'user').replace(/\s/g, '');
                                    
                                    return (
                                        <div key={player.id} className={`flex items-center p-3 rounded-xl border transition-all ${isMe ? 'bg-primary/20 border-primary/50' : 'bg-neutral-800/50 border-neutral-700/50'}`}>
                                            <div className={`w-8 font-bold text-lg ${player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-gray-300' : player.rank === 3 ? 'text-amber-600' : 'text-neutral-500'}`}>
                                                {player.rank}º
                                            </div>
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                                                alt="Avatar" 
                                                className="w-10 h-10 rounded-full bg-neutral-700 mr-4" 
                                            />
                                            <div className="flex-1">
                                                <p className={`font-semibold ${isMe ? 'text-white' : 'text-neutral-300'}`}>
                                                    {player.full_name || 'Usuário Sem Nome'} {isMe && '(Você)'}
                                                </p>
                                                <p className="text-xs text-neutral-500">Nível {player.level}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{player.xp} XP</div>
                                                <div className="text-xs text-neutral-500">{player.total_hours}h estudadas</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Medal className="text-purple-400" /> Suas Conquistas</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((ach) => (
                                <div key={ach.name} className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${ach.achieved ? 'bg-neutral-800 border-neutral-600' : 'bg-neutral-800/30 opacity-60 grayscale'}`}>
                                    <div className={`p-2 rounded-full mb-2 ${ach.achieved ? 'bg-neutral-900' : 'bg-neutral-800'}`}>
                                        <ach.icon className={`h-6 w-6 ${ach.achieved ? ach.color : 'text-neutral-500'}`} />
                                    </div>
                                    <p className="font-bold text-sm text-white">{ach.name}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB SOCIAL (Grupos) */}
            {activeTab === 'social' && (
                <div className="space-y-6">
                    {feedbackMsg && (
                        <div className="bg-primary/20 border border-primary text-white p-3 rounded-lg text-center animate-bounce">
                            {feedbackMsg}
                        </div>
                    )}

                    {invitations.length > 0 && (
                        <Card className="border-yellow-500/30 bg-yellow-500/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
                                <Bell className="animate-pulse" /> Convites
                            </h3>
                            <div className="space-y-3">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {inv.group?.name?.substring(0,2).toUpperCase() || 'GP'}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{inv.group?.name}</p>
                                                <p className="text-xs text-neutral-400">Convite pendente</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRespondInvite(inv.id, false, inv.group_id)} className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"><X size={18} /></button>
                                            <button onClick={() => handleRespondInvite(inv.id, true, inv.group_id)} className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white"><Check size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-blue-400" /> Meus Grupos</h3>
                                <button onClick={() => setIsCreatingGroup(!isCreatingGroup)} className="text-xs bg-primary hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                                    <Plus size={14} /> Novo
                                </button>
                            </div>

                            {isCreatingGroup && (
                                <div className="mb-4 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700">
                                    <input type="text" placeholder="Nome do Grupo" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-600 rounded p-2 text-sm text-white mb-2 focus:border-primary outline-none" />
                                    <button onClick={handleCreateGroup} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded font-medium transition">Criar</button>
                                </div>
                            )}

                            <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                                {loadingSocial ? (
                                    <p className="text-center text-neutral-500 text-sm py-4">Carregando...</p>
                                ) : myGroups.length === 0 ? (
                                    <div className="text-center py-8"><p className="text-neutral-400 text-sm">Você não tem grupos.</p></div>
                                ) : (
                                    myGroups.map(group => (
                                        <div key={group.id} onClick={() => setSelectedGroupId(group.id === selectedGroupId ? null : group.id)} className={`bg-neutral-800 p-3 rounded-lg border cursor-pointer transition-all ${selectedGroupId === group.id ? 'border-primary bg-neutral-800/80' : 'border-neutral-700 hover:border-neutral-500'}`}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                        {group.name.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{group.name}</p>
                                                        <p className="text-xs text-neutral-500">Toque para ver opções</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedGroupId === group.id && (
                                                <div className="mt-4 pt-4 border-t border-neutral-700 animate-fadeIn">
                                                    <p className="text-xs text-neutral-300 mb-2 font-semibold flex items-center gap-1"><UserPlus size={12}/> Convidar</p>
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="E-mail ou CPF" value={inviteEmailOrCpf} onChange={(e) => setInviteEmailOrCpf(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-600 rounded p-2 text-xs text-white focus:border-primary outline-none" />
                                                        <button onClick={(e) => { e.stopPropagation(); handleInvite(group.id); }} className="bg-primary hover:bg-primary-700 text-white px-3 py-1 rounded text-xs font-bold transition">Enviar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                         <Card className="flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b from-neutral-800 to-neutral-900">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Comunidade</h3>
                            <p className="text-sm text-neutral-400 mb-4">
                                Crie grupos para competir com amigos e ver quem estuda mais.
                            </p>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};
