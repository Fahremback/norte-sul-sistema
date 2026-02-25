

import React, { useState } from 'react';
import type { Camera } from '../types';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';

// Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const VideoCameraSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9a2.25 2.25 0 00-2.25 2.25v9A2.25 2.25 0 004.5 18.75zM1.72 21.72a.75.75 0 01-1.06-1.06l19.5-19.5a.75.75 0 111.06 1.06l-19.5 19.5z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m1.008.087l.22-.124a1.875 1.875 0 00-.738-3.225L5.134 3.75m6.002 0l-1.954-1.897a.75.75 0 00-1.06 0L4.072 4.319a.75.75 0 00-.01.077Q4 4.5 4 4.875V19.5a2.25 2.25 0 002.25 2.25h11.5A2.25 2.25 0 0020 19.5V4.875c0-.375-.008-.716-.021-1.056a.75.75 0 00-.01-.077z" /></svg>;

// A mock camera feed component
const CameraCard: React.FC<{ camera: Camera; onEdit: (camera: Camera) => void; onDelete: (id: string) => void }> = ({ camera, onEdit, onDelete }) => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden group">
        <div className="bg-black aspect-video w-full flex items-center justify-center relative">
            <img 
                src={`https://via.placeholder.com/640x360.png?text=${encodeURIComponent(camera.name)}`}
                alt={`Visualização da ${camera.name}`}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-bold">Visualização da Câmera</p>
            </div>
        </div>
        <div className="p-4 flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-gray-800">{camera.name}</h3>
                <p className="text-xs text-gray-500">{camera.ipAddress}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => onEdit(camera)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon /></button>
                <button onClick={() => onDelete(camera.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><DeleteIcon /></button>
            </div>
        </div>
    </div>
);

// A modal form for adding/editing cameras
const CameraFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (camera: Omit<Camera, 'id'> | Camera) => void;
  initialData: Camera | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIpAddress(initialData.ipAddress);
    } else {
      setName('');
      setIpAddress('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress) {
      alert("Nome e Endereço IP são obrigatórios.");
      return;
    }
    onSave({ ...(initialData || {}), id: initialData?.id || '', name, ipAddress });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Câmera" : "Adicionar Nova Câmera"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cameraName" className="block text-sm font-medium text-gray-700">Nome da Câmera</label>
          <input
            type="text"
            id="cameraName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Frente da Loja"
            required
          />
        </div>
        <div>
          <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">Endereço IP da Câmera</label>
          <input
            type="text"
            id="ipAddress"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: http://192.168.1.10:8080/video"
            required
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Salvar</button>
        </div>
      </form>
    </Modal>
  );
};


const CamerasPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

    if (currentUser?.role !== 'admin') {
        return <div className="text-red-500 p-8 text-center">Acesso negado. Esta área é restrita para administradores.</div>;
    }

    const handleOpenModal = (camera: Camera | null = null) => {
        setEditingCamera(camera);
        setIsModalOpen(true);
    };

    const handleSaveCamera = (cameraData: Omit<Camera, 'id'> | Camera) => {
        if ('id' in cameraData && cameraData.id) {
            // Edit existing
            setCameras(cameras.map(c => c.id === cameraData.id ? cameraData : c));
        } else {
            // Add new
            const newCamera: Camera = { ...cameraData, id: crypto.randomUUID() };
            setCameras([...cameras, newCamera]);
        }
        setIsModalOpen(false);
        setEditingCamera(null);
    };

    const handleDeleteCamera = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover esta câmera?")) {
            setCameras(cameras.filter(c => c.id !== id));
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white shadow rounded-lg">
                <h1 className="text-3xl font-bold text-gray-800">Câmeras de Segurança</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out whitespace-nowrap w-full sm:w-auto"
                >
                    <AddIcon /> Adicionar Câmera
                </button>
            </div>

            {cameras.length === 0 ? (
                <div className="text-center py-16 bg-white shadow rounded-lg">
                    <VideoCameraSlashIcon />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma câmera adicionada</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Clique em "Adicionar Câmera" para começar a monitorar.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cameras.map(camera => (
                        <CameraCard 
                            key={camera.id}
                            camera={camera}
                            onEdit={handleOpenModal}
                            onDelete={handleDeleteCamera}
                        />
                    ))}
                </div>
            )}

            <CameraFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCamera}
                initialData={editingCamera}
            />
        </div>
    );
};

export default CamerasPage;