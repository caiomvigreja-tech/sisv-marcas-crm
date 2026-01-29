
import React, { useState } from 'react';
import { LeadStatus, Lead } from '../types';
import { X, User, Phone, Briefcase } from 'lucide-react';

interface NewLeadFormProps {
  onClose: () => void;
  onSubmit: (lead: Lead) => void;
}

export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    brandName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      status: LeadStatus.ENTRADA,
      createdAt: new Date().toISOString(),
      history: [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        action: 'Lead capturado via Landing Page'
      }],
      ...formData
    };
    onSubmit(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-600 text-white">
          <h2 className="text-lg font-bold">Simular Entrada de Lead</h2>
          <button onClick={onClose} className="hover:text-orange-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Nome Completo</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Ex: João da Silva"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">WhatsApp</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Nome da Marca</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Ex: Super Lanches 24h"
                value={formData.brandName}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            Cadastrar Lead
          </button>
        </form>
      </div>
    </div>
  );
};
