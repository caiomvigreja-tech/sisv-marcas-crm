
import React from 'react';
import { Lead, LeadStatus, Vendedor } from '../types';
import { MessageCircle, Calendar, MoreHorizontal, User, Tag, Clock, AlertCircle } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  vendedor?: Vendedor;
  onClick: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, vendedor, onClick, onDragStart }) => {
  const isWon = lead.status === LeadStatus.CONTRATO_FECHADO;
  const isLost = lead.status === LeadStatus.RECUSOU_PROPOSTA;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeInfo = (dateStr?: string) => {
    if (!dateStr) return { label: '', urgency: 'low' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return { label: 'Agora', urgency: 'low' };
    if (diffInMins < 60) return { label: `${diffInMins}m`, urgency: 'low' };
    if (diffInHours < 24) return { label: `${diffInHours}h`, urgency: 'low' };
    
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (diffInDays >= 7) urgency = 'high';
    else if (diffInDays >= 3) urgency = 'medium';

    return { label: `${diffInDays}d`, urgency };
  };

  const timeInfo = getTimeInfo(lead.statusUpdatedAt);
  const sellerDisplayName = vendedor?.nome || vendedor?.email || 'Sem Responsável';

  const urgencyStyles = {
    low: 'bg-slate-50 text-slate-400 border-slate-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse',
    high: 'bg-rose-50 text-rose-600 border-rose-200'
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onClick(lead)}
      className={`
        group relative bg-white p-5 mb-3 rounded-[1.5rem] border shadow-sm hover:shadow-xl hover:shadow-slate-200/50
        transition-all cursor-grab active:cursor-grabbing border-slate-100
        ${isWon ? 'ring-2 ring-emerald-500/20' : ''}
        ${isLost ? 'opacity-70' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight mb-1 group-hover:text-orange-600 transition-colors">
            {lead.brandName}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {lead.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="text-slate-200 hover:text-slate-400 p-1 transition-colors">
            <MoreHorizontal size={18} />
          </button>
          
          {lead.statusUpdatedAt && !isWon && !isLost && (
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter transition-all ${urgencyStyles[timeInfo.urgency]}`}
              title={`Tempo neste status: ${timeInfo.label}`}
            >
              {timeInfo.urgency === 'high' ? <AlertCircle size={10} /> : <Clock size={10} />}
              {timeInfo.label}
            </div>
          )}
        </div>
      </div>

      {lead.observations && (
        <div className="mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/30">
          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic font-medium">
            "{lead.observations}"
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {lead.reunionDate && (
          <span className="text-[10px] px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold flex items-center gap-1.5">
            <Calendar size={12} /> {new Date(lead.reunionDate).toLocaleDateString()}
          </span>
        )}
        {lead.classeNice && (
          <span className="text-[10px] px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-bold flex items-center gap-1.5">
            <Tag size={12} /> NICE {lead.classeNice}
          </span>
        )}
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <a 
            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <MessageCircle size={16} />
          </a>
          
          <div className="flex items-center" title={`Responsável: ${sellerDisplayName}`}>
            {vendedor ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-extrabold text-slate-600 border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase">
                {getInitials(vendedor.nome || vendedor.email)}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-dashed border-slate-200" title="Sem responsável">
                <User size={12} />
              </div>
            )}
          </div>
        </div>
        
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
};
