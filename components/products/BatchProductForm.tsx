
import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/apiService';
import type { DraftProductLine } from '../../types'; 

interface BatchProductFormProps {
  onSaveBatch: (draftsData: Array<Omit<DraftProductLine, 'id' | 'imageFile' | 'isAiProcessing' | 'aiError'>>) => void;
  onClose: () => void;
}

const BatchProductForm: React.FC<BatchProductFormProps> = ({ onSaveBatch, onClose }) => {
  const [draftLines, setDraftLines] = useState<DraftProductLine[]>([]);
  const multipleFileUploaderRef = useRef<HTMLInputElement>(null);

  const processLineWithAI = useCallback(async (lineId: string, file: File) => {
    try {
      const suggestion = await apiService.uploadAndProcessImage(file);
      setDraftLines(prevLines =>
        prevLines.map(line =>
          line.id === lineId
            ? {
                ...line,
                ...suggestion,
                isAiProcessing: false,
                aiError: undefined,
              }
            : line
        )
      );
    } catch (error) {
      console.error(`BatchForm: AI processing error for line ${lineId}`, error);
      setDraftLines(prevLines =>
        prevLines.map(line =>
          line.id === lineId
            ? {
                ...line,
                isAiProcessing: false,
                aiError: 'Erro ao processar imagem com IA.',
                name: line.name || file.name.split('.')[0] || `Produto_${lineId.substring(0,4)}`,
              }
            : line
        )
      );
    }
  }, []); 

  const handleRemoveLine = (id: string) => {
    setDraftLines(prev => prev.filter(line => line.id !== id));
  };

  const handleLineChange = (id: string, field: keyof DraftProductLine, value: any) => {
    setDraftLines(prev =>
      prev.map(line => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const handleMultipleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDrafts: DraftProductLine[] = Array.from(files).map((file): DraftProductLine | null => {
        if (file.size > 10 * 1024 * 1024) { 
          alert(`A imagem "${file.name}" é muito grande (limite 10MB) e não será adicionada.`);
          return null;
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          alert(`Formato inválido para "${file.name}" (use JPG, PNG, WEBP, GIF) e não será adicionada.`);
          return null;
        }
        return {
          id: crypto.randomUUID(),
          imageFile: file, 
          name: '', description: '', category: '', 
          price: 0,
          stock: 0,
          // FIX: Explicitly cast status to its literal type to satisfy DraftProductLine type.
          status: 'pending_details' as const,
          isAiProcessing: true, 
          aiError: undefined,
          imageUrl: URL.createObjectURL(file), // For local preview
        };
      }).filter((d): d is DraftProductLine => d !== null);

      setDraftLines(prev => [...prev, ...newDrafts]);

      newDrafts.forEach(draft => {
        if (draft.imageFile) {
          processLineWithAI(draft.id, draft.imageFile);
        }
      });
    }
    if (event.target) event.target.value = ''; 
  };

  const handleSubmit = () => {
    const draftsToSave = draftLines
      .filter(line => line.name && line.name.trim() !== '' && !line.isAiProcessing) 
      .map(({ id, imageFile, isAiProcessing, aiError, imageUrl, ...rest }) => ({
          ...rest,
          imageUrls: rest.imageUrls || [], // Ensure it's an array
      }));

    const currentlyProcessingCount = draftLines.filter(l => l.isAiProcessing).length;
    if (currentlyProcessingCount > 0) {
      alert(`Aguarde ${currentlyProcessingCount} produto(s) terminarem o processamento com IA.`);
      return;
    }
    
    if (draftsToSave.length === 0) {
      alert("Nenhum produto pronto para salvar.");
      return;
    }
    
    onSaveBatch(draftsToSave);
    onClose();
  };
  
  const processingCount = draftLines.filter(line => line.isAiProcessing).length;
  const readyToSaveCount = draftLines.filter(line => line.name && line.name.trim() !== '' && !line.isAiProcessing && !line.aiError).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Selecione múltiplas imagens. Elas serão enviadas ao servidor para processamento com IA, que tentará preencher nome, descrição e categoria.
      </p>

      <input 
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={multipleFileUploaderRef}
        onChange={handleMultipleFilesSelected}
        className="hidden"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => multipleFileUploaderRef.current?.click()}
        className="w-full flex items-center justify-center px-4 py-2 border border-green-500 text-green-700 rounded-md hover:bg-green-50 transition-colors font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        Selecionar Múltiplas Imagens
      </button>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {draftLines.length === 0 && (
            <p className="text-center text-gray-500 py-4">Nenhuma imagem adicionada ainda.</p>
        )}
        {draftLines.map((line) => (
          <div key={line.id} className="p-4 border border-gray-300 rounded-lg space-y-3 bg-gray-50 relative">
            <button
                type="button"
                onClick={() => handleRemoveLine(line.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded-full shadow"
                aria-label="Remover esta linha"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex gap-4">
              <img src={line.imageUrl} alt="Prévia" className="w-20 h-20 object-contain rounded border bg-white flex-shrink-0"/>
              <div className="flex-grow space-y-2">
                 <input
                    type="text"
                    placeholder="Nome do Produto"
                    value={line.name}
                    onChange={e => handleLineChange(line.id, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                 <div className="grid grid-cols-3 gap-2">
                     <input type="number" placeholder="Preço" value={line.price} onChange={e => handleLineChange(line.id, 'price', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                     <input type="number" placeholder="Estoque" value={line.stock} onChange={e => handleLineChange(line.id, 'stock', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                     <input type="text" placeholder="Categoria" value={line.category} onChange={e => handleLineChange(line.id, 'category', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                 </div>
              </div>
            </div>
            {line.isAiProcessing && <LoadingSpinner text="Processando com IA..." size="sm" />}
            {!line.isAiProcessing && line.aiError && <p className="text-xs text-red-500 p-2 bg-red-50 rounded">Erro: {line.aiError}</p>}
          </div>
        ))}
      </div>
     
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          disabled={processingCount > 0 || readyToSaveCount === 0}
        >
          {processingCount > 0 ? `Processando IA (${processingCount})...` : `Salvar ${readyToSaveCount} Produtos`}
        </button>
      </div>
    </div>
  );
};

export default BatchProductForm;