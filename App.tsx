
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase.ts';
import type { Session } from '@supabase/supabase-js';

import { JourneySelection } from './components/JourneySelection.tsx';
import { LoginPage } from './components/LoginPage.tsx';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Tenta recuperar a sessão atual
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    // Se houver erro (ex: Refresh Token Not Found), forçamos o logout
                    // para limpar o localStorage e evitar loop de erro.
                    console.warn("Erro de sessão detectado, reiniciando autenticação...", error.message);
                    await supabase.auth.signOut();
                    setSession(null);
                } else {
                    setSession(session);
                }
            } catch (err) {
                console.error("Erro inesperado na inicialização:", err);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        initializeSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setSession(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(session);
            } else {
                setSession(session);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-neutral-900">
                <p className="text-white">Carregando...</p>
            </div>
        );
    }

    if (!session) {
        return <LoginPage />;
    }

    return <JourneySelection user={session.user} />;
};

export default App;
