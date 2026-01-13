import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';
import { AlertTriangle, User, FileText, KeyRound, ArrowLeft, Mail, CheckCircle2, LogIn } from 'lucide-react';
import { Logo } from './common/Logo.tsx';

type AuthView = 'login' | 'signup' | 'forgot' | 'update';

export const LoginPage: React.FC = () => {
    const [view, setView] = useState<AuthView>('login');
    const [emailOrCpf, setEmailOrCpf] = useState('');
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash;
            if (!hash) return;
            const params = new URLSearchParams(hash.substring(1));
            const errorDescription = params.get('error_description');
            if (errorDescription) {
                setError(decodeURIComponent(errorDescription).replace(/\+/g, ' '));
                window.history.replaceState(null, '', window.location.pathname);
            }
        };
        handleHash();
        
        supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                setView('update');
            }
        });
    }, []);

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };

    const cleanCpf = (value: string) => value.replace(/\D/g, '');

    const resolveEmail = async (input: string): Promise<string> => {
        const justNumbers = cleanCpf(input);
        if (justNumbers.length === 11 && !input.includes('@')) {
            const { data, error: rpcError } = await supabase.rpc('get_email_by_cpf', { cpf_input: justNumbers });
            if (rpcError || !data) throw new Error("CPF não encontrado.");
            return data;
        }
        return input;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: emailOrCpf,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: { full_name: fullName, cpf: cleanCpf(cpf) }
                    }
                });
                if (error) throw error;
                setMessage('Verifique seu e-mail para confirmar o cadastro.');
            } else if (view === 'login') {
                const emailToLogin = await resolveEmail(emailOrCpf);
                const { error } = await supabase.auth.signInWithPassword({ email: emailToLogin, password });
                if (error) throw error;
            } else if (view === 'forgot') {
                const emailToRecover = await resolveEmail(emailOrCpf);
                const { error } = await supabase.auth.resetPasswordForEmail(emailToRecover, { redirectTo: window.location.origin });
                if (error) throw error;
                setMessage('Link de recuperação enviado.');
            } else if (view === 'update') {
                const { error } = await supabase.auth.updateUser({ password: password });
                if (error) throw error;
                setMessage('Senha atualizada com sucesso!');
                setTimeout(() => setView('login'), 2000);
            }
        } catch (error: any) {
            setError(error.message || 'Erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-6">
            {/* Logo e Título */}
            <div className="text-center mb-8 animate-fadeIn">
                <Logo className="h-24 w-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">AprovApp</h1>
                <p className="text-xl font-medium text-neutral-200">O melhor App de controle de estudos do Brasil</p>
                <p className="text-neutral-400 text-sm mt-1">Sua jornada para a aprovação começa aqui.</p>
            </div>

            {/* Card de Login */}
            <div className="w-full max-w-[420px] bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-8 text-center">
                    {view === 'login' && 'Entrar na sua conta'}
                    {view === 'signup' && 'Crie sua conta gratuita'}
                    {view === 'forgot' && 'Recuperar minha senha'}
                    {view === 'update' && 'Definir nova senha'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {view === 'signup' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3.5 pl-10 text-white focus:border-primary outline-none transition-all placeholder:text-neutral-600" placeholder="Seu nome" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-300 ml-1">CPF</label>
                                <div className="relative group">
                                    <FileText className="absolute left-3 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                                    <input type="text" value={cpf} onChange={handleCpfChange} maxLength={14} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3.5 pl-10 text-white focus:border-primary outline-none transition-all placeholder:text-neutral-600" placeholder="000.000.000-00" />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-300 ml-1">
                            {view === 'signup' ? 'E-mail' : 'E-mail ou CPF'}
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                            <input type="text" value={emailOrCpf} onChange={(e) => setEmailOrCpf(e.target.value)} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3.5 pl-10 text-white focus:border-primary outline-none transition-all placeholder:text-neutral-600" placeholder="seu@email.com ou CPF" />
                        </div>
                    </div>

                    {(view === 'login' || view === 'signup' || view === 'update') && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-300 ml-1">Senha</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3.5 pl-10 text-white focus:border-primary outline-none transition-all placeholder:text-neutral-600" placeholder="********" />
                            </div>
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setView('forgot')} className="text-sm text-primary hover:brightness-125 transition-all">Esqueci minha senha</button>
                        </div>
                    )}

                    {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3 animate-shake"><AlertTriangle size={18} /> {error}</div>}
                    {message && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl flex items-center gap-3"><CheckCircle2 size={18} /> {message}</div>}

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                        {loading ? 'Processando...' : (
                            <>
                                <LogIn size={20} />
                                {view === 'login' ? 'Entrar' : 
                                 view === 'signup' ? 'Cadastrar' : 
                                 view === 'forgot' ? 'Enviar Link' : 'Salvar Senha'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    {view === 'login' ? (
                        <p className="text-neutral-400">
                            Novo por aqui? <button onClick={() => setView('signup')} className="text-white font-bold hover:underline decoration-primary underline-offset-4">Crie sua conta</button>
                        </p>
                    ) : (
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-neutral-400 hover:text-white mx-auto transition-colors font-medium">
                            <ArrowLeft size={18} /> Voltar para o Login
                        </button>
                    )}
                </div>
            </div>
            
            <div className="mt-12 text-center text-neutral-500 text-xs">
                <p>IA Integrada • AprovApp v1.2.5</p>
            </div>
        </div>
    );
};
