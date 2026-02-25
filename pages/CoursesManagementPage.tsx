
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Course, CourseCreationData } from '../../types';
import Modal from '../components/common/Modal';
import CourseForm from '../components/courses/CourseForm';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CoursesManagementPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.get<Course[]>('/courses');
            setCourses(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load courses.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleOpenFormModal = (course?: Course) => {
        setEditingCourse(course || null);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingCourse(null);
    };

    const handleSaveCourse = async (courseData: Partial<Course>) => {
        setIsSubmitting(true);
        try {
            if (editingCourse) {
                await apiService.put(`/courses/${editingCourse.id}`, courseData);
            } else {
                await apiService.post('/courses', courseData as CourseCreationData);
            }
            await fetchCourses();
            handleCloseFormModal();
        } catch (err) {
            alert(`Error saving course: ${(err as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o curso "${courseTitle}"?`)) {
            try {
                await apiService.del(`/courses/${courseId}`);
                await fetchCourses();
            } catch (err) {
                alert(`Error deleting course: ${(err as Error).message}`);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gerenciamento de Cursos</h1>
                <button
                    onClick={() => handleOpenFormModal()}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                    Adicionar Curso
                </button>
            </div>

            {isLoading && <LoadingSpinner text="Carregando cursos..." />}
            {error && <p className="text-red-500">{error}</p>}

            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrutor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(course.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenFormModal(course)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                        <button onClick={() => handleDeleteCourse(course.id, course.title)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingCourse ? 'Editar Curso' : 'Adicionar Curso'} size="2xl">
                <CourseForm 
                    initialData={editingCourse}
                    onSave={handleSaveCourse}
                    onClose={handleCloseFormModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default CoursesManagementPage;
