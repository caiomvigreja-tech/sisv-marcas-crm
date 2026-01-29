
import React, { useEffect } from 'react';
import { X, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';

interface RejectionStatsModalProps {
  stats: any;
  onClose: () => void;
}

export const RejectionStatsModal: React.FC<RejectionStatsModalProps> = ({ stats, onClose }) => {

  // Fechar com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header do Modal */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl shadow-inner">
              <TrendingDown size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Análise de Perdas</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Métricas de Recusa Comercial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm hover:shadow-lg hover:scale-110 active:scale-95"
            title="Fechar (ESC)"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-8">

          {/* Resumo rápido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Recusados</p>
              <p className="text-3xl font-black text-rose-600 tracking-tighter">{stats.lost} <span className="text-sm font-bold text-slate-300">LEADS</span></p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impacto no Funil</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {stats.total > 0 ? ((stats.lost / stats.total) * 100).toFixed(0) : 0}%
                <span className="text-sm font-bold text-slate-300 uppercase ml-1 tracking-normal">Taxa de Perda</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
              <BarChart3 size={14} className="text-rose-500" /> Motivos Detalhados
            </h3>

            <div className="space-y-5">
              {stats.rejectionBreakdown.map((item: any, index: number) => (
                <div key={item.reason} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                      {item.reason}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-rose-600 tracking-tighter leading-none">{item.percentage.toFixed(0)}%</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">({item.count})</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        width: `${item.percentage}%`,
                        transitionDelay: `${index * 100}ms`
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {stats.rejectionBreakdown.every((i: any) => i.count === 0) && (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                  <AlertCircle className="text-slate-300 mb-3" size={32} />
                  <p className="text-sm font-bold text-slate-400 italic">Nenhum dado de recusa registrado até o momento.</p>
                  <p className="text-[10px] text-slate-300 uppercase mt-1">Os motivos aparecerão aqui conforme os leads forem arquivados.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-[11px] font-bold text-slate-400 text-center leading-relaxed">
            Métricas calculadas em tempo real com base nos leads <br /> movidos para a coluna de <span className="text-rose-600">Proposta Recusada</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
