
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';
import { Login } from './Login';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Timeout de segurança: 5 segundos
        const timeout = setTimeout(() => {
            if (mounted) {
                console.warn('⚠️ Safety Timeout: Supabase não respondeu em 5s. Liberando app.');
                setLoading(false);
            }
        }, 5000);

        const checkSession = async () => {
            try {
                console.log('🔍 Iniciando verificação de sessão...');
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ Erro ao recuperar sessão:', error);
                }

                console.log('✅ Sessão encontrada:', currentSession ? 'Sim (Usuário: ' + currentSession.user.email + ')' : 'Não');

                if (mounted) {
                    setSession(currentSession);
                    setLoading(false);
                }
            } catch (error) {
                console.error('❌ Erro crítico checando sessão:', error);
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔄 Auth State Changed:', _event);
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    console.log('Render ProtectedRoute | Loading:', loading, '| Session:', !!session);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
                <Loader2 className="animate-spin text-orange-600" size={48} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    VERIFICANDO ACESSO...
                </p>
            </div>
        );
    }

    if (!session) {
        return <Login />;
    }

    return <>{children}</>;
};
