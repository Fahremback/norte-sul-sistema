

import React from 'react';
import type { Product } from '../../types';

// Icons
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.095" /></svg>;
const DefaultImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  isSelected: boolean;
  onSelectToggle: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, canEdit, canDelete, isSelected, onSelectToggle }) => {

  const cardContent = () => {
    const hasStorePrice = product.storePrice != null && product.storePrice > 0;
    
    switch (product.status) {
      case 'pending_details':
        return (
          <>
            <p className="text-sm text-orange-600 font-semibold mb-2">Detalhes Pendentes</p>
            <p className="text-xs text-gray-500 mb-1 h-8 overflow-hidden" title={product.description}>Descrição IA: {product.description || "N/A"}</p>
            <p className="text-xs text-gray-500 mb-3">Categoria IA: {product.category || "N/A"}</p>
            {(canEdit || canDelete) && (
              <div className="flex space-x-2">
                {canEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-400 text-yellow-800 rounded-md hover:bg-yellow-500 text-sm font-medium transition-colors"
                  >
                    <EditIcon /> <span className="ml-1">Adicionar Detalhes</span>
                  </button>
                )}
                 {canDelete && (
                    <button
                        onClick={() => { if(window.confirm(`Tem certeza que deseja excluir "${product.name || 'Produto pendente'}"?`)) onDelete(product.id)}}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
                        aria-label={`Excluir ${product.name || 'Produto pendente'}`}
                    >
                        <DeleteIcon /> <span className="ml-1">Excluir</span>
                    </button>
                )}
              </div>
            )}
          </>
        );
      case 'active':
        return (
          <>
            <p className="text-gray-600 text-sm mb-1 h-10 overflow-hidden" title={product.description}>
              {product.description && product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description || "Sem descrição"}
            </p>
            <p className="text-xs text-gray-500 mb-3">{product.category || "Sem categoria"}</p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600">R$ {product.price.toFixed(2)} <span className="text-xs font-normal"> (Site)</span></span>
                {hasStorePrice && <span className="text-md font-semibold text-sky-600">R$ {product.storePrice?.toFixed(2)} <span className="text-xs font-normal">(Loja)</span></span>}
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
              </span>
            </div>
            {(canEdit || canDelete) && (
              <div className="flex space-x-2">
                {canEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-400 text-yellow-800 rounded-md hover:bg-yellow-500 text-sm font-medium transition-colors"
                    aria-label={`Editar ${product.name}`}
                  >
                    <EditIcon /> <span className="ml-1">Editar</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => { if(window.confirm(`Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`)) onDelete(product.id)}}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
                    aria-label={`Excluir ${product.name}`}
                  >
                  <DeleteIcon /> <span className="ml-1">Excluir</span>
                  </button>
                )}
              </div>
            )}
          </>
        );
      default:
        return <p className="text-red-500">Status desconhecido: {product.status}</p>;
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out relative ${isSelected ? 'ring-2 ring-green-500 border-green-500' : 'border border-transparent'}`}>
      <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(product.id)}
            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
            aria-label={`Selecionar ${product.name || 'produto'}`}
          />
      </div>
      <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <img src={product.imageUrls[0]} alt={product.name || 'Imagem do Produto'} className="h-full w-full object-cover" />
        ) : (
          <DefaultImageIcon />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate pr-8" title={product.name || 'Produto sem nome'}>
            {product.name || "Produto Sem Nome"}
        </h3>
        {cardContent()}
      </div>
    </div>
  );
};

export default ProductCard;