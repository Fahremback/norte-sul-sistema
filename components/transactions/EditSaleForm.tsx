


import React, { useState, useEffect, ChangeEvent } from 'react';
import type { SaleTransaction, Product } from '../../types';
import { SaleItemType } from '../../types';

interface EditSaleFormProps {
  initialData: SaleTransaction;
  products: Product[]; 
  onSave: (saleData: SaleTransaction) => Promise<void>;
  onDelete: (saleId: string) => Promise<void>; // New prop for deleting
  onClose: () => void;
  isSubmitting: boolean;
}

const EditSaleForm: React.FC<EditSaleFormProps> = ({ initialData, products, onSave, onDelete, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState<SaleTransaction>(initialData);
  const [maxQuantity, setMaxQuantity] = useState<number | undefined>(undefined);

  useEffect(() => {
    setFormData(initialData); 
    if (initialData.itemType === SaleItemType.PRODUCT) {
      const product = products.find(p => p.id === initialData.itemId);
      if (product) {
        setMaxQuantity(product.stock + initialData.quantitySold);
      }
    } else {
        setMaxQuantity(undefined); 
    }
  }, [initialData, products]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    if (name === 'quantitySold' || name === 'pricePerItem') {
      processedValue = parseFloat(value) || 0;
      if (name === 'quantitySold') {
        processedValue = Math.max(1, processedValue); 
        if(maxQuantity !== undefined && processedValue > maxQuantity && initialData.itemType === SaleItemType.PRODUCT) {
            alert(`Ajuste de quantidade excede o estoque disponível + vendido originalmente (${maxQuantity}). O estoque atual do produto é ${products.find(p=>p.id === initialData.itemId)?.stock}.`);
            processedValue = initialData.quantitySold; 
        }
      }
    }
    
    setFormData(prev => {
        const newFormData = { ...prev, [name]: processedValue };
        if (name === 'quantitySold' || name === 'pricePerItem') {
            newFormData.totalAmount = (newFormData.quantitySold || 0) * (newFormData.pricePerItem || 0);
        }
        return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantitySold <= 0) {
        alert("Quantidade vendida deve ser maior que zero.");
        return;
    }
    if (formData.itemType === SaleItemType.PRODUCT && maxQuantity !== undefined && formData.quantitySold > maxQuantity) {
        alert(`Não é possível aumentar a quantidade da venda para ${formData.quantitySold}. Máximo permitido (estoque atual + vendido originalmente): ${maxQuantity}.`);
        return;
    }
    await onSave(formData);
  };

  const handleDeleteClick = async () => {
    await onDelete(formData.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-sale-itemName" className="block text-sm font-medium text-gray-700">Nome do Item</label>
        <input
          type="text"
          id="edit-sale-itemName"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-sale-quantitySold" className="block text-sm font-medium text-gray-700">Quantidade Vendida</label>
          <input
            type="number"
            id="edit-sale-quantitySold"
            name="quantitySold"
            value={formData.quantitySold}
            onChange={handleChange}
            min="1"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           {formData.itemType === SaleItemType.PRODUCT && maxQuantity !== undefined && formData.quantitySold > maxQuantity && (
            <p className="text-xs text-red-500 mt-1">Quantidade excede o limite (Estoque atual + Vendido Originalmente = {maxQuantity}).</p>
          )}
        </div>
        <div>
          <label htmlFor="edit-sale-pricePerItem" className="block text-sm font-medium text-gray-700">Preço por Item (R$)</label>
          <input
            type="number"
            id="edit-sale-pricePerItem"
            name="pricePerItem"
            value={formData.pricePerItem}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Total Calculado (R$)</label>
        <p className="mt-1 text-lg font-semibold text-gray-800">R$ {formData.totalAmount.toFixed(2)}</p>
      </div>
      <div>
        <label htmlFor="edit-sale-date" className="block text-sm font-medium text-gray-700">Data da Venda</label>
        <input
          type="date"
          id="edit-sale-date"
          name="date"
          value={formData.date.split('T')[0]} // Format for date input
          onChange={(e) => setFormData(prev => ({...prev, date: new Date(e.target.value).toISOString()}))}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <p className="text-xs text-gray-500">
        Nota: Alterar a quantidade de um produto vendido ajustará o estoque.
        Item ID: {formData.itemId} ({formData.itemType}).
      </p>
      <div className="flex justify-between items-center pt-3">
        <button 
            type="button" 
            onClick={handleDeleteClick} 
            disabled={isSubmitting} 
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Excluir Venda
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

export default EditSaleForm;