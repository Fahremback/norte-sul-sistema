
import React, { useState, useCallback, useMemo, useEffect } from 'react';
// FIX: Corrected import path to use the types from the management system.
import type { Product, DraftProductLine } from '../types';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';

import ProductCard from '../components/products/ProductCard';
import ProductForm from '../components/products/ProductForm';
import BatchProductForm from '../components/products/BatchProductForm';

// Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const BatchAddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;
const SelectAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M15.75 21H9a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 019 3h6.75a2.25 2.25 0 012.25 2.25v6.75P19.5 12.568M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DeselectAllIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m15.75-3.75v11.25A2.25 2.25 0 0119.5 21H4.5A2.25 2.25 0 012.25 18.75V8.25A2.25 2.25 0 014.5 6H12" /></svg>;
const DeleteSelectedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m1.008.087l.22-.124a1.875 1.875 0 00-.738-3.225L5.134 3.75m6.002 0l-1.954-1.897a.75.75 0 00-1.06 0L4.072 4.319a.75.75 0 00-.01.077Q4 4.5 4 4.875V19.5a2.25 2.25 0 002.25 2.25h11.5A2.25 2.25 0 0020 19.5V4.875c0-.375-.008-.716-.021-1.056a.75.75 0 00-.01-.077z" /></svg>;


interface ProductCatalogPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { imageBase64?: string }) => Promise<void>;
  onUpdateProduct: (product: Product & { imageBase64?: string }) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onAddMultipleProducts: (newProducts: Array<Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { imageBase64?: string }>) => Promise<void>;
}

const ProductCatalogPage: React.FC<ProductCatalogPageProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onAddMultipleProducts }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Product['status'] | 'all'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // FIX: Removed geminiApiKey from useAuth as it's a backend-only key.
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEditDelete = currentUser?.role === 'admin';
  const canAdd = !!currentUser;

  const handleOpenFormModal = (product?: Product) => {
    if (product && !canEditDelete && product.status !== 'pending_details') {
        alert("Você não tem permissão para editar este produto.");
        return;
    }
    if (product && currentUser?.role !== 'admin' && product.status === 'active'){
         alert("Você não tem permissão para editar produtos ativos.");
        return;
    }
    setEditingProduct(product || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenBatchModal = () => {
    if (!canAdd) {
      alert("Você precisa estar logado para adicionar produtos.");
      return;
    }
    setIsBatchModalOpen(true);
  };
  const handleCloseBatchModal = () => setIsBatchModalOpen(false);

  const handleSaveProduct = async (productDataFromForm: Partial<Product> & { imageBase64?: string; imageMimeType?: string; }, makeActive: boolean) => {
    setIsSubmitting(true);
    
    const productToSave = { 
        ...productDataFromForm, 
    };

    try {
        if (editingProduct && (productToSave as Product).id) {
          if (currentUser?.role === 'admin' || editingProduct.status === 'pending_details') {
            await onUpdateProduct(productToSave as Product & { imageBase64?: string });
          } else {
            alert("Você não tem permissão para atualizar este produto.");
            setIsSubmitting(false);
            return;
          }
        } else {
          const { id, ...newProductData } = productToSave;
          // FIX: Cast product data to match the expected type for onAddProduct, as 'name' is required.
          await onAddProduct(newProductData as Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { imageBase64?: string });
        }
        handleCloseFormModal();
    } catch (error) {
        console.error("Error saving product:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleSaveBatchProducts = async (draftsData: Array<Omit<DraftProductLine, 'id' | 'imageFile' | 'isAiProcessing' | 'aiError'>>) => {
    setIsSubmitting(true);
    // FIX: Add type assertion to resolve incorrect type inference from the .map function.
    const newProductsToSave = draftsData.map(draft => {
        // FIX: The `draft` object from draftsData has some properties removed already in BatchProductForm.
        // Destructuring out properties that are not part of the final product save payload.
        const { aiKeywords, imageMimeType, ...productData } = draft;
        return {
            ...productData,
            name: productData.name || `Produto Desconhecido`,
        };
    }) as Array<Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { imageBase64?: string }>;
    try {
        await onAddMultipleProducts(newProductsToSave);
        handleCloseBatchModal();
    } catch (error) {
         console.error("Error saving batch products:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    if (!canEditDelete && currentUser?.role !== 'admin') { 
        alert("Você não tem permissão para excluir produtos.");
        return;
    }
    if (currentUser?.role !== 'admin' && productToDelete.status === 'active') {
        alert("Você não tem permissão para excluir produtos ativos.");
        return;
    }
    setIsSubmitting(true);
    try {
        await onDeleteProduct(productId);
        setSelectedProductIds(prev => prev.filter(id => id !== productId)); 
    } catch (error) {
        console.error("Error deleting product:", error);
    } finally {
        setIsSubmitting(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const term = searchTerm.toLowerCase();
        const matchesTerm = (
            product.name.toLowerCase().includes(term) ||
            (product.category && product.category.toLowerCase().includes(term)) ||
            (product.description && product.description.toLowerCase().includes(term)) ||
            (product.status && product.status.toLowerCase().includes(term))
        );
        const statusMatch = statusFilter === 'all' || product.status === statusFilter;
        return matchesTerm && statusMatch;
    }).sort((a,b) => {
        const statusOrder = { 'pending_details': 1, 'active': 2 };
        if (statusOrder[a.status] < statusOrder[b.status]) return -1;
        if (statusOrder[a.status] > statusOrder[b.status]) return 1;
        return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm, statusFilter]);

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSelectAllVisibleProducts = () => {
    setSelectedProductIds(filteredProducts.map(p => p.id));
  };

  const handleDeselectAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) {
      alert("Nenhum produto selecionado para excluir.");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir ${selectedProductIds.length} produto(s) selecionado(s)? Esta ação não pode ser desfeita.`)) {
      setIsSubmitting(true);
      const deletePromises: Promise<void>[] = [];
      selectedProductIds.forEach(id => {
        const product = products.find(p => p.id === id);
        if (product) {
          if (currentUser?.role === 'admin' || product.status !== 'active') {
            deletePromises.push(onDeleteProduct(id));
          } else {
            alert(`Produto "${product.name}" é ativo e você não tem permissão para excluí-lo. Admin pode excluir.`);
          }
        }
      });
      try {
        await Promise.all(deletePromises);
        setSelectedProductIds([]);
      } catch (error) {
          console.error("Error deleting selected products:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
      handleOpenFormModal(product);
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white shadow rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo de Produtos</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
           <input
            type="text"
            placeholder="Buscar produtos..."
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 w-full sm:w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Product['status'] | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 w-full sm:w-auto"
          >
            <option value="all">Todos os Status</option>
            <option value="pending_details">Detalhes Pendentes</option>
            <option value="active">Ativos</option>
          </select>
          {canAdd && (
            <>
            <button
                onClick={() => handleOpenFormModal()}
                disabled={isSubmitting}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out whitespace-nowrap w-full sm:w-auto disabled:bg-gray-400"
            >
                <AddIcon /> Adicionar Produto
            </button>
            <button
                onClick={handleOpenBatchModal}
                disabled={isSubmitting}
                className="flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out whitespace-nowrap w-full sm:w-auto disabled:bg-gray-400"
            >
                <BatchAddIcon /> Adicionar em Lote
            </button>
            </>
          )}
        </div>
      </div>
      
      {products.length > 0 && canEditDelete && (
        <div className="p-4 bg-gray-50 shadow rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-700">
            {selectedProductIds.length > 0 
              ? `${selectedProductIds.length} produto(s) selecionado(s)`
              : "Nenhum produto selecionado."
            }
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSelectAllVisibleProducts}
              disabled={isSubmitting || filteredProducts.length === 0 || selectedProductIds.length === filteredProducts.length}
              className="flex items-center text-xs px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              <SelectAllIcon /> Selecionar Visíveis
            </button>
            <button
              onClick={handleDeselectAllProducts}
              disabled={isSubmitting || selectedProductIds.length === 0}
              className="flex items-center text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300"
            >
              <DeselectAllIcon /> Limpar Seleção
            </button>
            <button
              onClick={handleDeleteSelectedProducts}
              disabled={isSubmitting || selectedProductIds.length === 0}
              className="flex items-center text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
            >
               <DeleteSelectedIcon /> Excluir Selecionados
            </button>
          </div>
        </div>
      )}

      {isSubmitting && <div className="text-center p-4">Processando...</div>}

      {filteredProducts.length === 0 && !isSubmitting && (
         <div className="text-center py-10 bg-white shadow rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={searchTerm || statusFilter !== 'all' ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" } />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? "Tente ajustar seus termos de busca ou filtro." : "Use os botões acima para adicionar seu primeiro produto!"}
            </p>
          </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={handleEditProduct} 
                onDelete={handleDeleteProduct}
                canEdit={!isSubmitting && (canEditDelete || (product.status !== 'active' && canAdd))} 
                canDelete={!isSubmitting && (canEditDelete || (product.status !== 'active' && canAdd))}
                isSelected={selectedProductIds.includes(product.id)}
                onSelectToggle={handleToggleProductSelection}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'} size="lg">
        <ProductForm onSave={handleSaveProduct} onClose={handleCloseFormModal} initialData={editingProduct} />
      </Modal>

      <Modal isOpen={isBatchModalOpen} onClose={handleCloseBatchModal} title="Adicionar Produtos em Lote (Processamento IA Automático)" size="2xl">
        <BatchProductForm onSaveBatch={handleSaveBatchProducts} onClose={handleCloseBatchModal} />
      </Modal>
    </div>
  );
};

export default ProductCatalogPage;
