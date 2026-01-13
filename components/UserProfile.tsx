
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.ts';
import { Card } from './common/Card.tsx';
import { User as UserIcon, Mail, FileText, KeyRound, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UserProfileProps {
    user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const formatCPF = (cpf: string) => {
        if (!cpf) return 'Não informado';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            
            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserIcon className="text-primary" /> Meu Perfil
                </h2>
                <p className="text-neutral-400 text-sm">Gerencie suas informações de acesso.</p>
            </div>

            <Card>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-neutral-700 pb-2">Dados Pessoais</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Nome Completo</label>
                        <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700 text-neutral-300">
                            <UserIcon size={18} className="text-neutral-500" />
                            <span>{user.user_metadata.full_name || 'Usuário'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">E-mail</label>
                        <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700 text-neutral-300">
                            <Mail size={18} className="text-neutral-500" />
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">CPF</label>
                        <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700 text-neutral-300">
                            <FileText size={18} className="text-neutral-500" />
                            <span>{formatCPF(user.user_metadata.cpf)}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 ml-1">
                            * Para alterar dados pessoais como E-mail ou CPF, entre em contato com o suporte.
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-neutral-700 pb-2 flex items-center gap-2">
                    <KeyRound size={20} className="text-yellow-500" /> Segurança
                </h3>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase">Nova Senha</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase">Confirmar Nova Senha</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a senha"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertTriangle size={18} className="mt-0.5" />}
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading || !newPassword}
                        className="w-full bg-primary hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Atualizar Senha
                    </button>
                </form>
            </Card>
        </div>
    );
};
