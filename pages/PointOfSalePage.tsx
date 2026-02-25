
import React, { useState, useMemo, ChangeEvent, useEffect, useRef } from 'react';
// FIX: Changed import to allow SaleItemType to be used as a value.
import { type Product, type Service, type SaleTransaction, type Expense, SaleItemType } from '../types';
import Modal from '../components/common/Modal';
import apiService from '../services/apiService';

// Icons
const SellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>;
const AddServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RemoveItemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500 hover:text-red-700"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


interface ItemSuggestion {
  id: string; 
  name: string;
  type: SaleItemType;
  price: number;
  stock?: number;
  imageUrl?: string;
}

interface SaleListItem {
  clientId: string; 
  id: string; 
  name: string;
  itemType: SaleItemType;
  pricePerItem: number;
  quantity: number;
  stock?: number; 
  description?: string; 
  imageUrl?: string;
}


const PointOfSalePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsData, servicesData] = await Promise.all([
                apiService.get<Product[]>('/products'),
                apiService.get<Service[]>('/services'),
            ]);
            setProducts(productsData || []);
            setServices(servicesData || []);
        } catch(e) {
            alert('Falha ao carregar dados de produtos e serviços.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onAddSale = (sale: Omit<SaleTransaction, 'id'|'userId'|'createdAt'|'updatedAt'>) => {
        return apiService.post<SaleTransaction>('/sales', sale);
    };
    const onAddExpense = (expense: Omit<Expense, 'id'|'userId'|'createdAt'|'updatedAt'>) => {
        return apiService.post<Expense>('/expenses', expense);
    };

  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  
  const [currentSaleItems, setCurrentSaleItems] = useState<SaleListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense states
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick Service Modal states
  const [isQuickServiceModalOpen, setIsQuickServiceModalOpen] = useState(false);
  const [quickServiceName, setQuickServiceName] = useState('');
  const [quickServiceDescription, setQuickServiceDescription] = useState('');
  const [quickServicePrice, setQuickServicePrice] = useState<number>(0);

  const activeProducts = useMemo(() => products.filter(p => p.status === 'active'), [products]);

  const availableSuggestions = useMemo(() => {
    const productItems: ItemSuggestion[] = activeProducts
      .map(p => ({ 
          id: p.id, 
          name: p.name,
          type: SaleItemType.PRODUCT, 
          price: p.storePrice && p.storePrice > 0 ? p.storePrice : p.price, 
          stock: p.stock,
          imageUrl: p.imageUrls?.[0]
      }));
    const serviceItems: ItemSuggestion[] = services.map(s => ({ 
        id: s.id, 
        name: s.name,
        type: SaleItemType.SERVICE, 
        price: s.price, 
        stock: Infinity, 
        imageUrl: undefined 
    }));
    
    const allItems = [...productItems, ...serviceItems];
    const cleanedSearchTerm = searchTerm.trim().toLowerCase();
    if (!cleanedSearchTerm) return [];
    
    return allItems.filter(item => item.name.toLowerCase().includes(cleanedSearchTerm)).sort((a,b) => a.name.localeCompare(b.name));
  }, [activeProducts, services, searchTerm]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const addItemToSaleList = (item: ItemSuggestion) => {
    setCurrentSaleItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(li => li.id === item.id && li.itemType === item.type);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = currentItem.quantity + 1;
        if (item.type === SaleItemType.PRODUCT && item.stock !== undefined && newQuantity > item.stock) {
          alert(`Não é possível adicionar mais unidades de "${item.name}". Estoque disponível: ${item.stock}. Já na lista: ${currentItem.quantity}.`);
          return prevItems;
        }
        updatedItems[existingItemIndex] = { ...currentItem, quantity: newQuantity };
        return updatedItems;
      } else {
        if (item.type === SaleItemType.PRODUCT && item.stock !== undefined && 1 > item.stock) {
             alert(`Produto "${item.name}" está fora de estoque.`);
             return prevItems;
        }
        return [...prevItems, {
          clientId: crypto.randomUUID(),
          id: item.id,
          name: item.name,
          itemType: item.type,
          pricePerItem: item.price,
          quantity: 1,
          stock: item.stock,
          imageUrl: item.imageUrl,
        }];
      }
    });
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const updateSaleItemQuantity = (clientId: string, newQuantity: number) => {
    setCurrentSaleItems(prevItems => prevItems.map(item => {
      if (item.clientId === clientId) {
        const validatedQuantity = Math.max(1, newQuantity);
        if (item.itemType === SaleItemType.PRODUCT && item.stock !== undefined && validatedQuantity > item.stock) {
          alert(`Quantidade para "${item.name}" excede o estoque disponível de ${item.stock} unidades.`);
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity: validatedQuantity };
      }
      return item;
    }));
  };

  const removeSaleItem = (clientId: string) => {
    setCurrentSaleItems(prevItems => prevItems.filter(item => item.clientId !== clientId));
  };

  const handleAddQuickServiceToList = () => {
    if (!quickServiceName || quickServicePrice <= 0) {
      alert("Nome do serviço e preço (maior que zero) são obrigatórios para adicionar à venda.");
      return;
    }
    setCurrentSaleItems(prevItems => [...prevItems, {
      clientId: crypto.randomUUID(),
      id: `qs-${crypto.randomUUID()}`, 
      name: quickServiceName,
      itemType: SaleItemType.SERVICE,
      pricePerItem: quickServicePrice,
      quantity: 1,
      description: quickServiceDescription,
    }]);
    setIsQuickServiceModalOpen(false);
    setQuickServiceName('');
    setQuickServiceDescription('');
    setQuickServicePrice(0);
  };

  const totalSaleAmount = useMemo(() => {
    return currentSaleItems.reduce((total, item) => total + (item.pricePerItem * item.quantity), 0);
  }, [currentSaleItems]);

  const handleRecordSale = async () => {
    if (currentSaleItems.length === 0) {
      alert("Adicione itens à venda antes de registrar.");
      return;
    }
    setIsSubmitting(true);
    let allSalesSucceeded = true;
    const successfullyAddedSales: SaleTransaction[] = [];

    for (const item of currentSaleItems) {
      if (item.itemType === SaleItemType.PRODUCT) {
        const productDetails = products.find(p => p.id === item.id);
        if (!productDetails || productDetails.stock < item.quantity) {
          alert(`Estoque insuficiente para "${item.name}". Disponível: ${productDetails?.stock || 0}, Pedido: ${item.quantity}. Venda não registrada para este item.`);
          allSalesSucceeded = false;
          continue; 
        }
      }

      const saleData: Omit<SaleTransaction, 'id'|'userId'|'createdAt'|'updatedAt'> = {
        itemId: item.id,
        itemType: item.itemType,
        itemName: item.name,
        quantitySold: item.quantity,
        pricePerItem: item.pricePerItem,
        totalAmount: item.pricePerItem * item.quantity,
        date: new Date().toISOString(),
      };
      
      try {
        const newSale = await onAddSale(saleData);
        if (newSale) {
            successfullyAddedSales.push(newSale);
        } else {
            allSalesSucceeded = false;
            break; 
        }
      } catch (error) {
        allSalesSucceeded = false;
        console.error(`Erro ao registrar venda para ${item.name}:`, error);
        break; 
      }
    }
    
    setIsSubmitting(false);
    if (allSalesSucceeded && successfullyAddedSales.length === currentSaleItems.length) {
      alert(`Venda de ${successfullyAddedSales.length} tipo(s) de item(ns) registrada com sucesso!`);
      setCurrentSaleItems([]);
      await fetchData(); // Refresh product list after sale
    } else if (successfullyAddedSales.length > 0 && !allSalesSucceeded) {
      alert(`${successfullyAddedSales.length} item(ns) da venda foram registrados com sucesso, mas alguns falharam. Verifique os detalhes e o estoque.`);
      const successfulClientIds = successfullyAddedSales.map(s => currentSaleItems.find(csi => csi.id === s.itemId && csi.itemType === s.itemType)?.clientId);
      setCurrentSaleItems(prev => prev.filter(item => !successfulClientIds.includes(item.clientId)));
      await fetchData(); // Refresh product list after partial sale
    }
  };

  const handleAddExpense = async () => {
    if (!expenseDescription || expenseAmount <= 0 || !expenseCategory) {
      alert("Preencha todos os campos da despesa (descrição, valor > 0, categoria).");
      return;
    }
    setIsSubmitting(true);
    const expenseData: Omit<Expense, 'id'|'userId'|'createdAt'|'updatedAt'> = {
      description: expenseDescription,
      amount: expenseAmount,
      date: new Date(expenseDate).toISOString(), 
      category: expenseCategory,
    };
    try {
        const newExpense = await onAddExpense(expenseData);
        if (newExpense) { 
            setExpenseDescription('');
            setExpenseAmount(0);
            setExpenseCategory('');
            setExpenseDate(new Date().toISOString().split('T')[0]);
        }
    } catch (error) {
        console.error("Error adding expense:", error);
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Ponto de Venda</h1>
      <div className="bg-white shadow-md rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sales')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'sales' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            > <SellIcon /> Vendas </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === 'expenses' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            > <ExpenseIcon /> Despesas </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Registrar Nova Venda</h2>
              <div className="relative" ref={searchInputRef}>
                <label htmlFor="searchItem" className="block text-sm font-medium text-gray-700">Buscar Item (Produto/Serviço Cadastrado)</label>
                <input
                  type="text" id="searchItem" placeholder="Digite para buscar e adicionar à lista..." value={searchTerm}
                  onChange={handleSearchChange} onFocus={() => setShowSuggestions(true)} disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  autoComplete="off"
                />
                {showSuggestions && availableSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-72 overflow-y-auto shadow-lg">
                    {availableSuggestions.map(item => (
                      <li key={`${item.id}:${item.type}`} onClick={() => addItemToSaleList(item)}
                        className="px-3 py-2 hover:bg-green-50 cursor-pointer flex items-center space-x-3 transition-colors"
                        role="option"
                      >
                         <img src={(item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name.substring(0,2))}&background=e0e0e0&color=757575&size=40&font-size=0.4`)} 
                            alt={item.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate" title={item.name}>
                                {item.name} <span className="text-xs text-gray-500">({item.type === SaleItemType.PRODUCT ? 'Produto' : 'Serviço'})</span>
                            </p>
                            <p className="text-xs text-green-600 font-semibold">
                                R$ {item.price.toFixed(2)}
                                {item.type === SaleItemType.PRODUCT && typeof item.stock === 'number' ? 
                                  <span className={`ml-2 text-xs ${item.stock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}`}>(Estoque: {item.stock})</span> : ''}
                            </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                 {showSuggestions && availableSuggestions.length === 0 && searchTerm.trim() && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 p-3 text-sm text-gray-500 shadow-lg">
                        Nenhum item encontrado para "{searchTerm.trim()}".
                    </div>
                )}
              </div>
              <button type="button" onClick={() => setIsQuickServiceModalOpen(true)} disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400">
                <AddServiceIcon /> Adicionar Serviço Rápido à Venda
              </button>
              
              {currentSaleItems.length > 0 && (
                <div className="space-y-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-md font-semibold text-gray-700">Itens na Venda Atual:</h3>
                  {currentSaleItems.map(item => (
                    <div key={item.clientId} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 rounded">
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">{item.name} <span className="text-xs text-gray-500">({item.itemType === SaleItemType.PRODUCT ? 'Prod.' : 'Serv.'})</span></p>
                        <p className="text-xs text-gray-600">R$ {item.pricePerItem.toFixed(2)}/un.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateSaleItemQuantity(item.clientId, parseInt(e.target.value))}
                          min="1"
                          max={item.itemType === SaleItemType.PRODUCT && item.stock !== undefined ? item.stock : undefined}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          disabled={isSubmitting}
                          aria-label={`Quantidade para ${item.name}`}
                        />
                        <p className="text-sm font-semibold w-20 text-right">R$ {(item.pricePerItem * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeSaleItem(item.clientId)} disabled={isSubmitting} title="Remover item">
                          <RemoveItemIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-lg font-bold text-right text-gray-800 pt-3 border-t border-gray-200">
                    Total da Venda: R$ {totalSaleAmount.toFixed(2)}
                  </div>
                </div>
              )}
              
              <button onClick={handleRecordSale}
                disabled={isSubmitting || currentSaleItems.length === 0}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              > Registrar Venda </button>
            </div>
          )}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Registrar Nova Despesa</h2>
              <div>
                <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700">Descrição</label>
                <input type="text" id="expenseDescription" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input type="number" id="expenseAmount" value={expenseAmount} onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)} disabled={isSubmitting}
                  step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">Categoria</label>
                <input type="text" id="expenseCategory" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} disabled={isSubmitting}
                    placeholder="Ex: Aluguel, Fornecedores, Marketing"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" id="expenseDate" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <button onClick={handleAddExpense} disabled={isSubmitting}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
              > Registrar Despesa </button>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isQuickServiceModalOpen} onClose={() => setIsQuickServiceModalOpen(false)} title="Adicionar Serviço Rápido à Venda">
        <div className="space-y-4">
          <div>
            <label htmlFor="quickServiceName" className="block text-sm font-medium text-gray-700">Nome do Serviço Rápido</label>
            <input type="text" id="quickServiceName" value={quickServiceName} onChange={e => setQuickServiceName(e.target.value)} className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label htmlFor="quickServiceDescription" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
            <textarea id="quickServiceDescription" value={quickServiceDescription} onChange={e => setQuickServiceDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
          </div>
          <div>
            <label htmlFor="quickServicePrice" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
            <input type="number" id="quickServicePrice" value={quickServicePrice} onChange={e => setQuickServicePrice(parseFloat(e.target.value) || 0)} step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsQuickServiceModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="button" onClick={handleAddQuickServiceToList} disabled={isSubmitting} className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400">Adicionar à Venda</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PointOfSalePage;