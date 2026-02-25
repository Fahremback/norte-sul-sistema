
import React, { useState, useEffect, useCallback } from 'react';
import type { SiteSettings } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageUploadField from '../components/common/ImageUploadField';

const SiteSettingsManagementPage: React.FC = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.get<SiteSettings>('/settings/admin');
      if (data) {
        setSettings({ ...data, storeAddress: data.address });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
    setSettings(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };

  const handleImageUploaded = (fieldName: keyof SiteSettings, url: string | null) => {
    setSettings(prev => ({ ...prev, [fieldName]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiService.post('/settings', settings);
      setSuccessMessage('Configurações salvas com sucesso!');
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="Carregando configurações..." />;
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações Gerais do Site</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
        {successMessage && <div className="p-3 bg-green-100 text-green-800 rounded-md">{successMessage}</div>}
        
        <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Identidade Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Site</label>
                    <input type="text" name="siteName" value={settings.siteName || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição do Site (SEO)</label>
                    <textarea name="siteDescription" value={settings.siteDescription || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <ImageUploadField label="Logo do Site" value={settings.logoUrl || ''} onChange={(url) => handleImageUploaded('logoUrl', url)} />
                <ImageUploadField label="Favicon" value={settings.faviconUrl || ''} onChange={(url) => handleImageUploaded('faviconUrl', url)} />
            </div>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Informações de Contato</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço da Loja</label>
                    <textarea name="storeAddress" value={settings.storeAddress || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Horário de Funcionamento</label>
                    <textarea name="storeHours" value={settings.storeHours || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
            </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsManagementPage;
