
import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  User,
  ExternalLink
} from 'lucide-react';

interface AgendaModalProps {
  leads: Lead[];
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}

export const AgendaModal: React.FC<AgendaModalProps> = ({ leads, onClose, onSelectLead }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper para obter o início da semana (Segunda-feira)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const monday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const navigateWeek = (direction: number) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(next);
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const formatMonthYear = (d: Date) => {
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  // Filtra e ordena as reuniões do dia
  const getDayMeetings = (day: Date) => {
    return leads
      .filter(l => {
        // Regra Rigorosa: Só aparece se for status Reunião Agendada + Data coincidente
        if (!l.reunionDate || l.status !== LeadStatus.REUNIAO_AGENDADA) return false;
        const rd = new Date(l.reunionDate);
        return rd.getDate() === day.getDate() && 
               rd.getMonth() === day.getMonth() && 
               rd.getFullYear() === day.getFullYear();
      })
      .sort((a, b) => {
        const timeA = new Date(a.reunionDate!).getTime();
        const timeB = new Date(b.reunionDate!).getTime();
        return timeA - timeB;
      });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-[95vw] h-[90vh] rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header da Agenda */}
        <div className="p-10 pb-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-6">
            <div className="bg-orange-600 text-white p-4 rounded-2xl shadow-xl shadow-orange-200">
              <CalendarIcon size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Agenda de Reuniões</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{formatMonthYear(currentDate)}</span>
                <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg text-emerald-600 font-bold">SOMENTE AGENDADOS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-3 text-slate-400 hover:text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-2 text-[11px] font-black text-slate-600 uppercase tracking-widest hover:text-orange-600 transition-all"
            >
              Hoje
            </button>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-3 text-slate-400 hover:text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-3 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X size={28} />
          </button>
        </div>

        {/* Grade Semanal */}
        <div className="flex-1 overflow-x-auto custom-scrollbar p-6">
          <div className="flex gap-4 h-full min-w-[1200px]">
            {weekDays.map((day, idx) => {
              const meetings = getDayMeetings(day);
              const activeDay = isToday(day);

              return (
                <div 
                  key={idx} 
                  className={`flex-1 flex flex-col min-w-[200px] rounded-[2rem] transition-all border ${
                    activeDay 
                    ? 'bg-orange-50/30 border-orange-200 shadow-lg shadow-orange-100/50' 
                    : 'bg-white/50 border-slate-100'
                  }`}
                >
                  <div className={`p-6 border-b text-center rounded-t-[2rem] ${activeDay ? 'bg-orange-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-900'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activeDay ? 'text-orange-200' : 'text-slate-400'}`}>
                      {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </p>
                    <p className="text-2xl font-black tracking-tight leading-none">
                      {day.getDate()}
                    </p>
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    {meetings.length > 0 ? (
                      meetings.map(meeting => (
                        <div 
                          key={meeting.id}
                          onClick={() => onSelectLead(meeting)}
                          className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-200/40 hover:-translate-y-1 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                              <Clock size={12} />
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              {new Date(meeting.reunionDate!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[13px] font-extrabold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                              {meeting.brandName}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <User size={10} className="text-slate-300" />
                              <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{meeting.name}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
                            <ExternalLink size={12} className="text-slate-200 group-hover:text-orange-400 transition-colors" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
                        <Briefcase size={32} className="mb-2 text-slate-300" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-tight">SEM AGENDAMENTOS</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apenas leads no status 'Reunião Agendada' são exibidos.</p>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase">SISV CRM • CALENDÁRIO COMERCIAL</p>
        </div>
      </div>
    </div>
  );
};
