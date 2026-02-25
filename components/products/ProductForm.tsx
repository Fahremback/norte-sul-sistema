
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import type { Product, AiProductSuggestion, Base64ImageUploaderProps, ProductFormData } from '../../types';
import ImageUploader from '../common/ImageUploader';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/apiService';

interface ProductFormProps {
  onSave: (productData: Partial<Product> & { imageBase64?: string, imageMimeType?: string }, makeActive: boolean) => Promise<void>;
  onClose: () => void;
  initialData?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onClose, initialData }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    storePrice: initialData?.storePrice || undefined,
    stock: initialData?.stock || 0,
    imageUrl: initialData?.imageUrls?.[0] || undefined,
    imageBase64: undefined,
    imageMimeType: undefined,
    aiKeywords: '',
    status: initialData?.status 
  });
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [originalFileObject, setOriginalFileObject] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'price' || name === 'storePrice' || name === 'stock') ? parseFloat(value) || 0 : value 
    }));
  };

  const runAIWithFile = useCallback(async (file: File) => {
    setIsAiLoading(true);
    try {
      const result = await apiService.uploadAndProcessImage(file);
      setFormData(prev => ({
        ...prev,
        ...result, // Popula o formulário com os dados da IA
        imageUrl: result.imageUrl,
        imageBase64: undefined,
        imageMimeType: undefined,
      }));
    } catch (error) {
      alert(`Falha ao processar imagem: ${(error as Error).message}`);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleImageUploadedCallback: Base64ImageUploaderProps['onImageUploaded'] = 
    useCallback((base64Data, mimeType, originalFile) => {
      if (originalFile) {
        setOriginalFileObject(originalFile);
        runAIWithFile(originalFile);
      } else {
        setFormData(prev => ({
          ...prev,
          imageBase64: undefined,
          imageMimeType: undefined,
          imageUrl: undefined,
        }));
        setOriginalFileObject(null);
      }
  }, [runAIWithFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        alert("Nome do produto é obrigatório.");
        return;
    }
    const makeActive = (formData.price || 0) > 0 && (formData.stock || 0) >= 0 && !!formData.name;
    const { aiKeywords, imageBase64, imageMimeType, ...restOfFormData } = formData;

    const productPayload: Partial<Product> & { imageBase64?: string, imageMimeType?: string } = {
        ...restOfFormData,
        imageUrls: formData.imageUrl ? [formData.imageUrl] : (initialData?.imageUrls || []),
        status: makeActive ? 'active' : 'pending_details',
    };
    if (initialData?.id) {
        (productPayload as any).id = initialData.id;
    }
    
    await onSave(productPayload, makeActive);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUploader 
        onImageUploaded={handleImageUploadedCallback} 
        currentImageUrl={formData.imageBase64 ? `data:${formData.imageMimeType};base64,${formData.imageBase64}` : formData.imageUrl} 
        label="Foto do Produto" 
      />
      
      {isAiLoading && <LoadingSpinner size="sm" text="Analisando imagem com IA..." />}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
        <input type="text" name="category" id="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço no Site (R$)</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="storePrice" className="block text-sm font-medium text-gray-700">Preço na Loja (R$)</label>
          <input type="number" name="storePrice" id="storePrice" value={formData.storePrice || ''} onChange={handleChange} step="0.01" min="0" placeholder="Opcional" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Quantidade em Estoque</label>
          <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} step="1" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Salvar Produto</button>
      </div>
    </form>
  );
};

export default ProductForm;
