import React, { useState, ChangeEvent } from 'react';
import type { PurchaseRequestData, PurchaseItemData } from '../../types';

// Simple remove icon
const RemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>;

interface PurchaseRequestFormProps {
  onSave: (data: PurchaseRequestData) => void;
  onClose: () => void;
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({ onSave, onClose }) => {
  const [items, setItems] = useState<PurchaseItemData[]>([]);
  const [globalNotes, setGlobalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemChange = (id: string, field: keyof Omit<PurchaseItemData, 'id'>, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: field === 'quantity' ? Math.max(1, Number(value)) : value } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems(prevItems => [...prevItems, { id: crypto.randomUUID(), itemName: '', quantity: 1 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(item => !item.itemName || item.quantity <= 0)) {
      alert("Todos os itens da compra devem ter um nome e quantidade válida (maior que zero).");
      return;
    }
    if (items.length === 0) {
        alert("Adicione pelo menos um item à requisição de compra.");
        return;
    }
    setIsSubmitting(true);
    onSave({ items, globalNotes });
    setIsSubmitting(false);
    // Parent component should handle closing the modal after save.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Itens para Compra</h3>
        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">Nenhum item adicionado.</p>
        )}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-x-3 items-center p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="col-span-6">
                <label htmlFor={`itemName-${item.id}`} className="sr-only">Nome do Item {index + 1}</label>
                <input
                  type="text"
                  id={`itemName-${item.id}`}
                  placeholder={`Item ${index + 1}`}
                  value={item.itemName}
                  onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                  required
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
              <div className="col-span-4">
                <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantidade do Item {index + 1}</label>
                <input
                  type="number"
                  id={`quantity-${item.id}`}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                  min="1"
                  required
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                  aria-label={`Remover item ${index + 1}`}
                >
                  <RemoveIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-dashed border-orange-400 text-orange-600 rounded-md hover:bg-orange-50 transition-colors text-sm font-medium"
        >
          + Adicionar Item à Lista
        </button>
      </div>

      <div>
        <label htmlFor="globalNotesPurchase" className="block text-sm font-medium text-gray-700">Observações Gerais</label>
        <textarea
          name="globalNotes"
          id="globalNotesPurchase"
          value={globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          placeholder="Fornecedores preferenciais, urgência, etc."
        ></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancelar</button>
        <button type="submit" disabled={isSubmitting || items.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400">
          {isSubmitting ? 'Salvando...' : 'Salvar Requisição de Compra'}
        </button>
      </div>
    </form>
  );
};

export default PurchaseRequestForm;
