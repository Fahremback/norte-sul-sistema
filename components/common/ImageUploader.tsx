

import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import type { Base64ImageUploaderProps } from '../../types'; 

const ImageUploader: React.FC<Base64ImageUploaderProps> = ({ onImageUploaded, currentImageUrl, label = "Foto" }) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from isUploading
  const inputId = React.useId();

  useEffect(() => {
    // If currentImageUrl is a full data URL (e.g., from a previous unsaved base64 preview),
    // or a server path, set it.
    if (currentImageUrl?.startsWith('data:image/') || currentImageUrl?.startsWith('/uploads/')) {
        setPreview(currentImageUrl);
    } else if (currentImageUrl) {
        // If it's just a filename or other non-displayable string, don't attempt to set it as src
        // but log a warning if it's unexpected. This state indicates an existing server image.
        // console.warn("ImageUploader currentImageUrl is not a displayable path or data URL:", currentImageUrl);
        setPreview(currentImageUrl); // Assume it's a server path
    } else {
        setPreview(null);
    }
  }, [currentImageUrl]);

  const processFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit for local processing
      setError("A imagem é muito grande. O limite é 10MB.");
      setPreview(null);
      onImageUploaded(null, null, file); 
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError("Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.");
      setPreview(null);
      onImageUploaded(null, null, file); 
      return;
    }
    setError(null);
    setIsProcessing(true);

    let base64Data: string | null = null;
    const mimeType: string | null = file.type;

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          setPreview(resultStr); // Show local preview immediately
          const commaIndex = resultStr.indexOf(',');
          if (commaIndex !== -1 && resultStr.length > commaIndex + 1) {
            resolve(resultStr.substring(commaIndex + 1));
          } else {
            reject(new Error("Falha ao processar a imagem (base64)."));
          }
        };
        reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
        reader.readAsDataURL(file);
      });
      base64Data = await base64Promise;
      onImageUploaded(base64Data, mimeType, file);
    } catch (readError: any) {
      console.error('File Read Error:', readError);
      setError(readError.message || "Falha ao ler a imagem para processamento.");
      onImageUploaded(null, mimeType, file); // Pass what we have
    } finally {
      setIsProcessing(false);
    }
  }, [onImageUploaded]);
  
  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          processFile(file);
      } else { // Handle if user cancels file selection after selecting one
          setPreview(currentImageUrl || null); // Revert to initial or last good preview
          setError(null);
          // Notify parent that selection was cleared or reverted
          onImageUploaded(null, null, null); 
      }
  }, [processFile, currentImageUrl, onImageUploaded]);


  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
        aria-describedby={error ? `${inputId}-error` : undefined}
        disabled={isProcessing}
      />
      {isProcessing && <p className="text-xs text-blue-600 mt-1">Processando imagem...</p>}
      {error && <p id={`${inputId}-error`} className="text-xs text-red-600 mt-1">{error}</p>}
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Pré-visualização" className="max-h-48 w-auto rounded-md border border-gray-300 object-contain" />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;