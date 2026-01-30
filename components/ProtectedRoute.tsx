
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

        const checkSession = async () => {
            // Verificar apenas em memória já que persistência está desligada
            const { data: { session } } = await supabase.auth.getSession();

            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
