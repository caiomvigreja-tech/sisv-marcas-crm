
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, Vendedor, HistoryEntry } from '../types';
import { REJECTION_REASONS } from '../constants';
import { 
  X, 
  History, 
  Phone, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Briefcase, 
  FileText, 
  UserCircle,
  Save,
  RotateCcw,
  Loader2,
  Check,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead;
  vendedores: Vendedor[];
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => Promise<void>;
  userRole?: 'admin' | 'vendedor';
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, vendedores, onClose, onUpdate, userRole }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tech' | 'history'>('info');
  const [localLead, setLocalLead] = useState<Lead>({ ...lead });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    setLocalLead({ ...lead });
  }, [lead.id, lead]);

  const isRejectionIncomplete = localLead.status === LeadStatus.RECUSOU_PROPOSTA && !localLead.rejectionReason;
  const hasChanges = JSON.stringify(localLead) !== JSON.stringify(lead);
  const noteChangedOnly = localLead.observations !== lead.observations && 
                         localLead.status === lead.status &&
                         localLead.vendedorId === lead.vendedorId &&
                         localLead.reunionDate === lead.reunionDate;

  const formatToDateTimeLocal = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (val: string) => {
    if (!val) {
      setLocalLead({ ...localLead, reunionDate: undefined });
      return;
    }
    const localDate = new Date(val);
    setLocalLead({ ...localLead, reunionDate: localDate.toISOString() });
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (isRejectionIncomplete) {
      alert("Por favor, selecione o motivo da recusa antes de salvar.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(localLead);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSaveNote = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onUpdate(localLead);
      // Aqui não fechamos o modal, apenas damos um feedback visual
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert("Falha ao salvar nota.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalLead({ ...lead });
  };

  const currentVendedor = vendedores.find(v => v.id === localLead.vendedorId);
  const vendedorName = currentVendedor?.nome || currentVendedor?.email || 'Sem Responsável';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Sidebar Esquerda (Identificação) */}
        <div className="w-full md:w-80 bg-slate-50/50 p-8 border-r border-slate-100 overflow-y-auto">
          <div className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-6">Identificação</span>
            
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Marca</label>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              {localLead.brandName}
            </h2>
            <span className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
              {localLead.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-10">
            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Responsável Atual</label>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl shadow-inner uppercase">
                  {vendedorName[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 leading-none mb-1">
                    {vendedorName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Vendedor SISV</p>
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-200/60">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Titular</label>
              <div className="space-y-6">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{localLead.name}</h3>
                <div className="space-y-4">
                  <a 
                    href={`https://wa.me/${localLead.whatsapp?.replace(/\D/g, '')}`} 
                    target="_blank" 
                    className="flex items-center gap-4 group"
                  >
                    <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><Phone size={16} /></div>
                    <span className="text-sm font-extrabold text-emerald-600 tracking-tight">{localLead.whatsapp}</span>
                  </a>
                  {localLead.email && (
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 text-slate-400 p-2.5 rounded-xl"><Mail size={16} /></div>
                      <span className="text-sm font-bold text-slate-600 tracking-tight">{localLead.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Área Principal Direita */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Navegação por Abas */}
          <div className="p-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex gap-4">
              {[
                {id: 'info', label: 'Gestão Comercial', icon: <Briefcase size={16}/>},
                {id: 'tech', label: 'Análise Técnica', icon: <FileText size={16}/>},
                {id: 'history', label: 'Histórico', icon: <History size={16}/>}
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-3 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all ${
                    activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30 -translate-y-0.5' 
                    : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors p-2"><X size={28}/></button>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
            {activeTab === 'info' ? (
              <div className="space-y-12 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* GRID PRINCIPAL DE GESTÃO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  
                  {/* Coluna 1: Atribuição, Reunião e Motivo da Perda */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 mb-6 flex items-center gap-3">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><UserCircle size={18} /></div> Transferir / Atribuir
                      </h3>
                      <div className="relative group">
                        <select 
                          disabled={!isAdmin}
                          className={`w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] py-4 px-6 text-sm font-bold text-slate-700 outline-none appearance-none ${!isAdmin ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-pointer focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20'}`}
                          value={localLead.vendedorId || 'null'}
                          onChange={(e) => setLocalLead({ ...localLead, vendedorId: e.target.value === 'null' ? undefined : e.target.value })}
                        >
                          <option value="null">Aguardando Vendedor (Triagem)</option>
                          {vendedores.map(v => (
                            <option key={v.id} value={v.id}>{(v.nome || v.email || 'Vendedor Sem Nome').toUpperCase()}</option>
                          ))}
                        </select>
                        {!isAdmin && (
                          <div className="mt-3 flex items-center gap-2 text-slate-400">
                            <ShieldAlert size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-tight italic">Somente Gestores podem reatribuir leads</span>
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4 flex items-center gap-2">
                        <Calendar size={14} /> Data da Reunião
                      </label>
                      <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100/50">
                        <input 
                          type="datetime-local" 
                          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5"
                          value={formatToDateTimeLocal(localLead.reunionDate)}
                          onChange={(e) => handleDateChange(e.target.value)}
                        />
                      </div>
                    </section>

                    <section>
                      <label className={`text-[10px] font-black uppercase tracking-widest block mb-4 flex items-center gap-2 ${localLead.status === LeadStatus.RECUSOU_PROPOSTA ? 'text-rose-600' : 'text-slate-400'}`}>
                        <AlertTriangle size={14} /> Motivo da Perda
                      </label>
                      <div className={`p-6 rounded-[1.5rem] border transition-all ${localLead.status === LeadStatus.RECUSOU_PROPOSTA && !localLead.rejectionReason ? 'bg-rose-50 border-rose-200 animate-pulse' : 'bg-slate-50 border-slate-100/50'}`}>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5"
                          value={localLead.rejectionReason || ''}
                          onChange={(e) => setLocalLead({...localLead, rejectionReason: e.target.value})}
                        >
                          <option value="">Selecione um motivo...</option>
                          {REJECTION_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                        {localLead.status === LeadStatus.RECUSOU_PROPOSTA && (
                          <div className="mt-3 flex items-center gap-2 text-rose-600">
                            <Info size={12} />
                            <span className="text-[10px] font-bold uppercase italic tracking-tight">obrigatório o preenchimento em caso de recusa</span>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Coluna 2: Apenas Alterar Status */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 mb-6 flex items-center gap-3">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><CheckCircle2 size={18} /></div> Alterar Status
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(LeadStatus).map((status) => (
                          <button
                            key={status}
                            onClick={() => setLocalLead({ ...localLead, status })}
                            className={`
                              text-left px-4 py-2.5 text-[9px] uppercase font-black tracking-tight rounded-xl border transition-all
                              ${localLead.status === status 
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-600'}
                            `}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Relatório de Atendimento */}
                <section className="pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 flex items-center gap-3">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><MessageSquare size={18} /></div> Relatório do Atendimento / Observações
                    </h3>
                    
                    {localLead.observations !== lead.observations && (
                      <button 
                        onClick={handleQuickSaveNote}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-[10px] font-black rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        SALVAR NOTA AGORA
                      </button>
                    )}
                  </div>
                  
                  <div className={`bg-slate-50 p-8 rounded-[2rem] border transition-all ${localLead.observations !== lead.observations ? 'border-orange-200 ring-4 ring-orange-500/5' : 'border-slate-100/50'}`}>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-6 px-7 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 min-h-[150px] shadow-sm leading-relaxed"
                      placeholder="Anote aqui informações importantes colhidas durante o atendimento, objeções, perfil do cliente, etc..."
                      value={localLead.observations || ''}
                      onChange={(e) => setLocalLead({...localLead, observations: e.target.value})}
                    />
                    {localLead.observations !== lead.observations && (
                      <p className="mt-3 text-[10px] font-bold text-orange-600 flex items-center gap-2 animate-pulse">
                        <Info size={12} /> Não esqueça de salvar sua nota para registrá-la no histórico!
                      </p>
                    )}
                  </div>
                </section>
              </div>
            ) : activeTab === 'tech' ? (
              <div className="space-y-12 py-6 animate-in fade-in duration-300">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><FileText size={18} /></div> Parecer Técnico
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-100/50">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Classe Nice Sugerida</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-sm font-extrabold text-slate-800"
                      placeholder="Ex: 35, 41..."
                      value={localLead.classeNice || ''}
                      onChange={(e) => setLocalLead({...localLead, classeNice: e.target.value})}
                    />
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-100/50">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Link da Pesquisa INPI</label>
                    <div className="flex gap-3">
                      <input 
                        type="url" 
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-4 px-6 text-sm font-medium text-slate-600"
                        placeholder="URL do PDF ou Consulta..."
                        value={localLead.linkPesquisa || ''}
                        onChange={(e) => setLocalLead({...localLead, linkPesquisa: e.target.value})}
                      />
                      {localLead.linkPesquisa && (
                        <a href={localLead.linkPesquisa} target="_blank" rel="noopener noreferrer" className="p-4 bg-orange-600 text-white rounded-xl hover:shadow-lg transition-all">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100/50">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-6">Análise Detalhada (Riscos e Oportunidades)</label>
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-3xl p-8 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 min-h-[350px] leading-relaxed shadow-sm"
                    placeholder="Descreva aqui o resultado da pesquisa técnica no banco do INPI..."
                    value={localLead.resumoAnalise || ''}
                    onChange={(e) => setLocalLead({...localLead, resumoAnalise: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><History size={18} /></div> Linha do Tempo
                  </h3>
                </div>
                
                <div className="space-y-6 max-w-4xl">
                  {localLead.history && localLead.history.length > 0 ? (
                    localLead.history.map((entry, idx) => (
                      <div key={entry.id || idx} className="relative pl-12 pb-10 border-l-4 border-slate-100 last:border-0 group">
                        <div className={`absolute left-[-11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md transition-all group-hover:scale-125 ${idx === 0 ? 'bg-orange-600' : 'bg-slate-300'}`}></div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                {entry.action}
                                {entry.action === 'Mudança de Status' && <ArrowRight size={12} className="text-orange-500" />}
                                {entry.action === 'Nota Adicionada' && <MessageSquare size={12} className="text-blue-500" />}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                <Clock size={10} /> {new Date(entry.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 px-3 py-1 bg-slate-50 rounded-lg uppercase">Evento #{localLead.history.length - idx}</span>
                          </div>
                          <p className={`text-xs font-medium leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 italic ${entry.action === 'Nota Adicionada' ? 'text-slate-800 border-l-4 border-l-blue-400' : 'text-slate-500'}`}>
                            {entry.note || 'Sem observações adicionais.'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <History size={48} className="text-slate-200 mb-4" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum histórico registrado</p>
                      <p className="text-[10px] text-slate-300 font-bold mt-2">Movimente o lead ou adicione uma nota para começar a rastrear.</p>
                    </div>
                  )}

                  {/* Entrada Fixa de Criação se o Array for antigo ou vazio */}
                  {!localLead.history?.some(e => e.action.includes('Capturado')) && (
                    <div className="relative pl-12 border-l-4 border-transparent">
                      <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-md"></div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Lead Capturado</p>
                          <span className="text-[10px] font-black text-slate-300 px-3 py-1 bg-slate-50 rounded-lg uppercase">{new Date(localLead.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Registro inicial via formulário de prospecção do Grupo SISV.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer fixo com botões de ação */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end z-20">
            <div className="flex gap-4">
              {hasChanges && !showSuccess && (
                <button 
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="px-8 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <RotateCcw size={18} /> Descartar
                </button>
              )}
              
              <button 
                onClick={handleSave}
                disabled={!hasChanges || isSaving || showSuccess || isRejectionIncomplete}
                className={`
                  px-12 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-[0.15em] transition-all flex items-center gap-3
                  ${isRejectionIncomplete 
                    ? 'bg-rose-100 text-rose-300 cursor-not-allowed'
                    : hasChanges && !showSuccess
                      ? 'bg-orange-600 text-white shadow-2xl shadow-orange-600/30 hover:bg-orange-700 hover:-translate-y-1' 
                      : showSuccess 
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                `}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : showSuccess ? (
                  <Check size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? 'SALVANDO...' : showSuccess ? 'CONCLUÍDO' : 'SALVAR ALTERAÇÕES'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
