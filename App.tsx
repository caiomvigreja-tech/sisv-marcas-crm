
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, Vendedor, HistoryEntry } from './types';
import { COLUMNS, REJECTION_REASONS } from './constants';
import { LeadCard } from './components/LeadCard';
import { LeadDetailsModal } from './components/LeadDetailsModal';
import { NewLeadForm } from './components/NewLeadForm';
import { RejectionStatsModal } from './components/RejectionStatsModal';
import { AgendaModal } from './components/AgendaModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './services/supabaseClient';
import {
  Plus,
  Search,
  Users,
  Settings,
  Database,
  CheckCircle2,
  Activity,
  LogOut,
  Loader2,
  Filter,
  BarChart3,
  TrendingDown,
  CalendarDays,
  User as UserIcon,
  Shield,
  RefreshCcw,
  LayoutDashboard,
  MessageSquareOff,
  Ghost,
  PieChart
} from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Vendedor | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterVendedor, setFilterVendedor] = useState<string>('all');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  // --- DATA FETCHING ---

  const mapLead = (data: any): Lead => ({
    id: data.id,
    name: data.nome_cliente || 'Sem Nome',
    whatsapp: data.whatsapp || '',
    email: data.email,
    brandName: data.nome_marca || 'Marca não informada',
    status: (data.status?.toLowerCase() as LeadStatus) || LeadStatus.ENTRADA,
    vendedorId: data.vendedor_id,
    createdAt: data.created_at || new Date().toISOString(),
    statusUpdatedAt: data.status_updated_at || data.created_at || new Date().toISOString(),
    ramoAtividade: data.ramo_atividade,
    possuiCnpj: data.possui_cnpj,
    classeNice: data.classe_nice,
    resumoAnalise: data.resumo_analise,
    linkPesquisa: data.link_pesquisa,
    reunionDate: data.data_reuniao,
    rejectionReason: data.motivo_perda,
    observations: data.observacoes,
    history: Array.isArray(data.historico) ? data.historico : []
  });

  const fetchLeads = async (abortSignal?: AbortSignal) => {
    if (!session) return;
    if (abortSignal?.aborted) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (abortSignal?.aborted) return;

      if (!error && data) {
        const mappedLeads = data.map(mapLead);
        setLeads(mappedLeads);
        return mappedLeads;
      }
    } catch (err) {
      if (abortSignal?.aborted) return;
      console.error("Erro fetch leads:", err);
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
    return [];
  };

  const fetchVendedores = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.from('profiles').select('id, nome, email, role');
      if (!error && data) setVendedores(data);
    } catch (err) {
      console.error("Erro fetch vendedores:", err);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
        if (data.role !== 'admin') setFilterVendedor(data.id);
        setAuthError(null);
        return data; // Return data for checking
      } else {
        console.error('Profile not found for user:', userId);
        setAuthError('Perfil não encontrado. Contate o suporte.');
        await supabase.auth.signOut();
        setSession(null);
        return null;
      }
    } catch (err) {
      console.error("Erro fetch perfil:", err);
      setAuthError('Erro ao carregar perfil. Verifique sua conexão e tente novamente.');
      // await supabase.auth.signOut(); // Removed to prevent logout on network error
      setSession(null);
      return null;
    }
  };

  // --- AUTH & SUBSCRIPTION ---

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Garantir limpeza total no início
        const { error } = await supabase.auth.signOut();
        if (error) console.log("Limpeza de sessão residual:", error.message);

        // Estado inicial sempre nulo
        if (isMounted) {
          setSession(null);
          setUserProfile(null);
          setAuthLoading(false);
        }

      } catch (err) {
        console.error('Erro na inicialização:', err);
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUserProfile(null);
        setAuthLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || (session && !userProfile)) {
        setAuthLoading(true);
        const profile = await fetchUserProfile(session.user.id);
        if (isMounted) {
          if (profile) {
            setSession(session);
          }
          setAuthLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session && userProfile) {
      const abortController = new AbortController();
      fetchLeads(abortController.signal);
      fetchVendedores();

      const channel = supabase
        .channel('crm_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads' },
          () => fetchLeads(abortController.signal)
        )
        .subscribe();

      return () => {
        abortController.abort();
        supabase.removeChannel(channel);
      };
    }
  }, [session, userProfile]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- ACTIONS ---

  const updateLeadInDB = async (updatedLead: Lead) => {
    try {
      const currentLead = leads.find(l => l.id === updatedLead.id);
      if (!currentLead) return;

      const hasStatusChanged = currentLead.status !== updatedLead.status;
      const hasObservationsChanged = currentLead.observations !== updatedLead.observations;

      let newHistory = [...(updatedLead.history || [])];

      const updatePayload: any = {
        nome_cliente: updatedLead.name,
        whatsapp: updatedLead.whatsapp,
        nome_marca: updatedLead.brandName,
        status: updatedLead.status,
        vendedor_id: updatedLead.vendedorId,
        classe_nice: updatedLead.classeNice,
        link_pesquisa: updatedLead.linkPesquisa,
        resumo_analise: updatedLead.resumoAnalise,
        data_reuniao: updatedLead.reunionDate,
        motivo_perda: updatedLead.rejectionReason,
        observacoes: updatedLead.observations,
      };

      if (hasStatusChanged) {
        updatePayload.status_updated_at = new Date().toISOString();
        const fromName = currentLead.status.replace('_', ' ').toUpperCase();
        const toName = updatedLead.status.replace('_', ' ').toUpperCase();

        newHistory = [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          action: 'Mudança de Status',
          note: `Movido de ${fromName} para ${toName}`
        }, ...newHistory];
      }

      if (hasObservationsChanged && updatedLead.observations) {
        newHistory = [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          action: 'Nota Adicionada',
          note: updatedLead.observations
        }, ...newHistory];
      }

      updatePayload.historico = newHistory;

      const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', updatedLead.id);

      if (error) {
        if (error.code === '42501') alert("Acesso negado: você não tem permissão para esta alteração.");
        else alert("Erro ao atualizar: " + error.message);
        return;
      }

      const refreshedLeads = await fetchLeads();
      if (selectedLead?.id === updatedLead.id) {
        const newlyMappedLead = refreshedLeads.find(l => l.id === updatedLead.id);
        if (newlyMappedLead) setSelectedLead(newlyMappedLead);
      }
    } catch (err) {
      console.error("Erro update db:", err);
    }
  };

  const onDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    const leadId = e.dataTransfer.getData('leadId');
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      await updateLeadInDB({ ...lead, status: newStatus });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle the session nulling
      // But we force a reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erro ao sair. A página será recarregada.');
      window.location.reload();
    }
  };

  // --- COMPUTED (FILTERS FIRST) ---

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // 1. Busca por texto (usando debounced query)
      const matchSearch = l.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        l.brandName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // 2. Filtro de permissão (Vendedor só vê o dele ou sem dono)
      if (!isAdmin) {
        if (l.vendedorId && l.vendedorId !== userProfile?.id) return false;
      }

      // 3. Filtro de Dropdown (UI)
      const matchVendedor = filterVendedor === 'all' || l.vendedorId === filterVendedor;

      return matchSearch && matchVendedor;
    });
  }, [leads, debouncedSearchQuery, filterVendedor, isAdmin, userProfile]);

  // --- STATS REACTIVE TO FILTERS ---

  const stats = useMemo(() => {
    const targetLeads = filteredLeads; // Usamos a lista já filtrada para as estatísticas

    const total = targetLeads.length;
    const won = targetLeads.filter(l => l.status === LeadStatus.CONTRATO_FECHADO).length;
    const lost = targetLeads.filter(l => l.status === LeadStatus.RECUSOU_PROPOSTA).length;
    const noResponse = targetLeads.filter(l => l.status === LeadStatus.SEM_RESPOSTA).length;
    const scheduled = targetLeads.filter(l => l.status === LeadStatus.REUNIAO_AGENDADA).length;
    const entrada = targetLeads.filter(l => l.status === LeadStatus.ENTRADA).length;

    // "Em andamento" são os leads ativos que não estão nos estados terminais, nem na reunião agendada, nem na entrada
    const inProgress = total - won - lost - noResponse - scheduled - entrada;

    const lostLeads = targetLeads.filter(l => l.status === LeadStatus.RECUSOU_PROPOSTA);
    const rejectionBreakdown = REJECTION_REASONS.map(reason => {
      const count = lostLeads.filter(l => l.rejectionReason === reason).length;
      return {
        reason,
        count,
        percentage: lostLeads.length > 0 ? (count / lostLeads.length) * 100 : 0
      };
    }).sort((a, b) => b.count - a.count);

    return { total, won, lost, noResponse, scheduled, inProgress, rejectionBreakdown };
  }, [filteredLeads]);

  const leadsNaAgenda = leads.filter(l =>
    l.status === LeadStatus.REUNIAO_AGENDADA && !!l.reunionDate
  );

  return (
    <ProtectedRoute>
      {authLoading ? (
        <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
          <Loader2 className="animate-spin text-orange-600" size={48} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CARREGANDO PERFIL...</p>
        </div>
      ) : (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
          {/* 1. DIAGNÓSTICO */}
          {showDiagnostic && isAdmin && (
            <div className="bg-slate-900 text-white p-4 z-50 border-b border-orange-500/50 animate-in slide-in-from-top duration-300">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-2 text-orange-500"><Database size={16} /> DEBUG MODE</span>
                  <span className="text-slate-500">|</span>
                  <span>Leads em cache: {leads.length}</span>
                  <span>Vendedores: {vendedores.length}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchLeads} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-widest">Forçar Sync</button>
                  <button onClick={() => setShowDiagnostic(false)} className="text-white/40 hover:text-white text-[10px] uppercase font-black">Fechar</button>
                </div>
              </div>
            </div>
          )}

          {/* 2. HEADER */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6 z-20 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm flex items-center justify-center">
                <img src="https://www.semissosemvendas.com.br/wp-content/uploads/2022/02/favicon.png" className="w-12 h-12 object-contain" alt="SISV" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">SISV <span className="text-orange-600">CRM</span></h1>
                <div className="flex items-center gap-2.5 mt-2">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isAdmin ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-500'}`}>
                    {isAdmin ? <Shield size={10} fill="currentColor" /> : <UserIcon size={10} />}
                    {isAdmin ? 'Gestor' : 'Consultor'}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[150px]">
                    {userProfile?.nome || userProfile?.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {isAdmin && (
                <div className="flex items-center bg-slate-50 rounded-2xl px-3 border border-slate-200 hover:border-orange-200 transition-all group">
                  <Filter size={14} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                  <select
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    className="bg-transparent border-none py-2.5 text-[10px] font-black text-slate-600 uppercase outline-none cursor-pointer pr-4"
                  >
                    <option value="all">Filtro: Todos</option>
                    {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome || v.email}</option>)}
                  </select>
                </div>
              )}

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-3 text-slate-300" size={16} />
                <input
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all"
                  placeholder="Pesquisar cliente ou marca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button onClick={() => setShowAgenda(true)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-100 transition-all relative group">
                <CalendarDays size={20} className="group-hover:scale-110 transition-transform" />
                {leadsNaAgenda.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-600 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-md">
                    {leadsNaAgenda.length}
                  </span>
                )}
              </button>

              <button onClick={() => setIsFormOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 hover:scale-[1.02] active:scale-95 shadow-xl shadow-orange-600/25 transition-all flex items-center gap-2">
                <Plus size={18} /> <span className="hidden sm:inline">Novo Lead</span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all disabled:opacity-50"
                title="Sair"
              >
                {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
              </button>

              {isAdmin && (
                <button onClick={() => setShowDiagnostic(!showDiagnostic)} className="p-3 text-slate-300 hover:bg-slate-100 rounded-2xl transition-all">
                  <Settings size={20} />
                </button>
              )}
            </div>
          </header>

          {/* 3. DASHBOARD ESTATÍSTICO (AGORA REATIVO AOS FILTROS) */}
          <div className="bg-white border-b border-slate-200 px-8 py-4 overflow-x-auto custom-scrollbar z-10">
            <div className="flex gap-4 min-w-max max-w-7xl mx-auto">
              {/* 1. Total de leads */}
              <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px]">
                <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-200"><Users size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Total de leads</p>
                  <p className="text-2xl font-black text-blue-900 tracking-tighter leading-none">{stats.total}</p>
                </div>
              </div>

              {/* 2. Em andamento */}
              <div className="flex-1 bg-orange-50/50 border border-orange-100 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px]">
                <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-lg shadow-orange-200"><Activity size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none mb-1">Em andamento</p>
                  <p className="text-2xl font-black text-orange-900 tracking-tighter leading-none">{stats.inProgress}</p>
                </div>
              </div>

              {/* 3. Reunião agendada */}
              <div className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px]">
                <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-200"><CalendarDays size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Reunião agendada</p>
                  <p className="text-2xl font-black text-indigo-900 tracking-tighter leading-none">{stats.scheduled}</p>
                </div>
              </div>

              {/* 4. Contratos fechados */}
              <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px]">
                <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200"><CheckCircle2 size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Contratos fechados</p>
                  <p className="text-2xl font-black text-emerald-900 tracking-tighter leading-none">{stats.won}</p>
                </div>
              </div>

              {/* 5. Propostas recusadas */}
              <button
                onClick={() => setShowStatsModal(true)}
                className="flex-1 bg-rose-50/50 border border-rose-100 hover:bg-rose-100/80 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px] transition-all group text-left"
              >
                <div className="bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform"><TrendingDown size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1 flex items-center gap-2">Propostas recusadas <BarChart3 size={10} /></p>
                  <p className="text-2xl font-black text-rose-900 tracking-tighter leading-none">{stats.lost}</p>
                </div>
              </button>

              {/* 6. Sem resposta */}
              <div className="flex-1 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] p-4 flex items-center gap-4 min-w-[180px]">
                <div className="bg-zinc-500 text-white p-2.5 rounded-2xl shadow-lg shadow-zinc-200"><Ghost size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Sem resposta</p>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">{stats.noResponse}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KANBAN PRINCIPAL */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden bg-[#F8FAFC] custom-scrollbar">
            <div className="flex gap-6 p-8 h-full min-w-max">
              {COLUMNS.map((column) => {
                const columnLeads = filteredLeads.filter(l => l.status === column.id);
                return (
                  <div
                    key={column.id}
                    className="w-80 flex flex-col h-full rounded-[2.5rem] bg-slate-200/30 p-2.5 border border-white"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, column.id)}
                  >
                    <div className={`p-5 rounded-3xl border mb-4 shadow-sm ${column.color}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[12px] font-black uppercase tracking-tighter flex items-center gap-2">
                          {column.title}
                          <span className="bg-black/10 px-2 py-0.5 rounded-lg text-[10px] font-black">{columnLeads.length}</span>
                        </h3>
                      </div>
                      <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">{column.description}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1.5 space-y-3 custom-scrollbar">
                      {columnLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          vendedor={vendedores.find(v => v.id === lead.vendedorId)}
                          onClick={setSelectedLead}
                          onDragStart={(e, id) => e.dataTransfer.setData('leadId', id)}
                        />
                      ))}
                      {!loading && columnLeads.length === 0 && (
                        <div className="border-2 border-dashed border-slate-300/40 rounded-3xl h-32 flex flex-col items-center justify-center text-slate-300 text-[10px] font-black p-6 text-center uppercase tracking-widest">
                          Vazio
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Floating Refresh */}
          <button
            onClick={fetchLeads}
            disabled={loading}
            className={`fixed bottom-8 right-8 p-5 rounded-full shadow-2xl shadow-orange-600/30 transition-all z-30 ${loading ? 'bg-slate-200 text-slate-400' : 'bg-orange-600 text-white hover:scale-110 active:scale-95'}`}
          >
            <RefreshCcw size={24} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Modais */}
          {selectedLead && (
            <LeadDetailsModal
              lead={selectedLead}
              vendedores={vendedores}
              onClose={() => setSelectedLead(null)}
              onUpdate={updateLeadInDB}
              userRole={userProfile?.role}
            />
          )}

          {showAgenda && (
            <AgendaModal
              leads={leadsNaAgenda}
              onClose={() => setShowAgenda(false)}
              onSelectLead={(l) => { setShowAgenda(false); setSelectedLead(l); }}
            />
          )}

          {showStatsModal && (
            <RejectionStatsModal stats={stats} onClose={() => setShowStatsModal(false)} />
          )}

          {isFormOpen && (
            <NewLeadForm
              onClose={() => setIsFormOpen(false)}
              onSubmit={async (lead) => {
                const initialHistory: HistoryEntry[] = [{
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date().toISOString(),
                  action: 'Lead Capturado',
                  note: 'Captura manual via sistema SISV CRM.'
                }];

                const { error } = await supabase.from('leads').insert({
                  nome_cliente: lead.name,
                  whatsapp: lead.whatsapp,
                  nome_marca: lead.brandName,
                  status: lead.status,
                  vendedor_id: null,
                  status_updated_at: new Date().toISOString(),
                  historico: initialHistory
                });
                if (error) alert("Erro ao criar lead: " + error.message);
                else fetchLeads();
              }}
            />
          )}
        </div>
      )}
    </ProtectedRoute>
  );
};

export default App;
