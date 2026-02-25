




import React, { useState, useEffect, ChangeEvent } from 'react';
import type { Course, CourseCreationData } from '../../types';
import ImageUploadField from '../common/ImageUploadField';

interface CourseFormProps {
    onSave: (courseData: Partial<Course>) => Promise<void>;
    onClose: () => void;
    initialData?: Course | null;
    isSubmitting: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSave, onClose, initialData, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<Course>>({
        title: '',
        description: '',
        instructor: '',
        price: 0,
        imageUrl: '',
        duration: '',
        level: 'Iniciante',
        type: 'PRESENCIAL',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                price: Number(initialData.price) // Ensure price is a number
            });
        } else {
             setFormData({
                title: '', description: '', instructor: '', price: 0,
                imageUrl: '', duration: '', level: 'Iniciante', type: 'PRESENCIAL'
            });
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleImageUploaded = (url: string | null) => {
        setFormData(prev => ({ ...prev, imageUrl: url || undefined }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Curso</label>
                <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <ImageUploadField label="Imagem do Curso" value={formData.imageUrl || ''} onChange={handleImageUploaded} />
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instrutor</label>
                    <input type="text" name="instructor" id="instructor" value={formData.instructor || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                    <input type="number" name="price" id="price" value={formData.price || 0} onChange={handleChange} step="0.01" className="mt-1 w-full p-2 border rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duração</label>
                    <input type="text" name="duration" id="duration" value={formData.duration || ''} onChange={handleChange} placeholder="Ex: 40 horas" className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">Nível</label>
                    <select name="level" id="level" value={formData.level || 'Iniciante'} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                        <option>Iniciante</option>
                        <option>Intermediário</option>
                        <option>Avançado</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select name="type" id="type" value={formData.type || 'PRESENCIAL'} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="GRAVADO">Gravado</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                    {isSubmitting ? 'Salvando...' : 'Salvar Curso'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;