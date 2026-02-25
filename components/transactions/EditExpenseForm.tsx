


import React, { useState, useEffect, ChangeEvent } from 'react';
import type { Expense } from '../../types';

interface EditExpenseFormProps {
  initialData: Expense;
  onSave: (expenseData: Expense) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>; // New prop
  onClose: () => void;
  isSubmitting: boolean;
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({ initialData, onSave, onDelete, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState<Expense>(initialData);

  useEffect(() => {
    setFormData(initialData); 
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
        alert("Valor da despesa deve ser maior que zero.");
        return;
    }
    await onSave(formData);
  };

  const handleDeleteClick = async () => {
    await onDelete(formData.id);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-expense-description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          id="edit-expense-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="edit-expense-amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
        <input
          type="number"
          id="edit-expense-amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="edit-expense-category" className="block text-sm font-medium text-gray-700">Categoria</label>
        <input
          type="text"
          id="edit-expense-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="edit-expense-date" className="block text-sm font-medium text-gray-700">Data da Despesa</label>
        <input
          type="date"
          id="edit-expense-date"
          name="date"
          value={formData.date.split('T')[0]} 
          onChange={(e) => setFormData(prev => ({...prev, date: new Date(e.target.value).toISOString()}))}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-between items-center pt-3">
        <button 
            type="button" 
            onClick={handleDeleteClick} 
            disabled={isSubmitting} 
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Excluir Despesa
        </button>
        <div className="flex space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </div>
    </form>
  );
};

export default EditExpenseForm;
