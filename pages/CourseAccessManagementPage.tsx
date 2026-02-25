
import React, { useState, useEffect, useCallback } from 'react';
import type { CourseAccessRequest } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CourseAccessManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<CourseAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.get<CourseAccessRequest[]>('/courses/access-requests');
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar solicitações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      await apiService.post(`/courses/access-requests/${requestId}/approve`, {});
      await fetchRequests(); 
    } catch (err) {
      alert(`Erro ao aprovar: ${(err as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Aprovação de Acesso a Cursos</h1>
      {isLoading && <LoadingSpinner text="Carregando solicitações..." />}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {!isLoading && !error && (
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{req.user.name} <span className="font-normal text-gray-500">({req.user.email})</span></p>
                  <p className="text-sm text-gray-600">
                    Solicitou acesso ao curso: <span className="font-medium text-green-700">{req.course.title}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    em {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Aprovar
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white shadow rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma solicitação pendente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tudo certo por aqui! Não há solicitações de acesso a cursos para aprovar no momento.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseAccessManagementPage;
