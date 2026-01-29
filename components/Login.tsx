
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block bg-white border border-slate-100 p-2 rounded-3xl shadow-sm mb-6 overflow-hidden">
            <img 
              src="https://www.semissosemvendas.com.br/wp-content/uploads/2022/02/favicon.png" 
              className="w-16 h-16 object-contain" 
              alt="SISV Logo" 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            SISV <span className="text-orange-600">CRM</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
            Grupo SS Marcas e Patentes
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/50">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Acesso Restrito</h2>
            <p className="text-sm text-slate-500 mt-1">Entre com suas credenciais para gerenciar o funil.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all placeholder:text-slate-300"
                  placeholder="exemplo@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-bold border border-rose-100 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'ACESSAR DASHBOARD'}
            </button>
          </form>
        </div>

        <div className="text-center mt-10 px-4">
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Uma parceria de sucesso entre o <span className="text-slate-600">Grupo Sem Isso Sem Vendas</span><br />
            e o <span className="text-slate-600">Grupo SS Marcas e Patentes</span>
          </p>
        </div>
      </div>
    </div>
  );
};
