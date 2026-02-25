import React, { useState, ChangeEvent } from 'react';
import type { SupportTicketData } from '../../types';

interface SupportTicketFormProps {
  onSave: (data: SupportTicketData) => void;
  onClose: () => void;
}

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState<SupportTicketData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Nome, email e mensagem são obrigatórios.");
      return;
    }
    setIsSubmitting(true);
    // In a real scenario, this would call an API service.
    // For now, it just calls the onSave prop.
    onSave(formData);
    setIsSubmitting(false);
    // Parent component should handle closing the modal after save.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Cliente*</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
      </div>
       <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="(XX) XXXXX-XXXX" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Detalhes / Mensagem*</label>
        <textarea name="message" id="message" value={formData.message} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"></textarea>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400">
          {isSubmitting ? 'Salvando...' : 'Salvar Atendimento'}
        </button>
      </div>
    </form>
  );
};

export default SupportTicketForm;