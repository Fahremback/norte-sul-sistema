


import React, { useState, useCallback, useMemo, ChangeEvent } from 'react';
import type { PendingService, PendingServiceStatus, ServicePriority, PurchaseRequestData, PurchaseRequest, PurchaseRequestStatus, PendingServiceFormData, Base64ImageUploaderProps } from '../types';
import { PENDING_SERVICE_STATUSES, SERVICE_PRIORITY_OPTIONS, ALL_PURCHASE_REQUEST_STATUSES } from '../types'; 
import Modal from '../components/common/Modal';
import ImageUploader from '../components/common/ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import AddChoiceModal, { AddChoiceOption } from '../components/services/AddChoiceModal';
import PurchaseRequestForm from '../components/services/PurchaseRequestForm';

// Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m1.008.087l.22-.124a1.875 1.875 0 00-.738-3.225L5.134 3.75m6.002 0l-1.954-1.897a.75.75 0 00-1.06 0L4.072 4.319a.75.75 0 00-.01.077Q4 4.5 4 4.875V19.5a2.25 2.25 0 002.25 2.25h11.5A2.25 2.25 0 0020 19.5V4.875c0-.375-.008-.716-.021-1.056a.75.75 0 00-.01-.077z" /></svg>;
const DefaultServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75-.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MarkDoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PurchaseRequestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-orange-600"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;

// Form Component
interface PendingServiceFormProps {
  onSave: (serviceData: PendingServiceFormData & { id?: string }) => void;
  onClose: () => void;
  initialData?: PendingService | null;
  isAdmin: boolean;
}

const PendingServiceForm: React.FC<PendingServiceFormProps> = ({ onSave, onClose, initialData, isAdmin }) => {
  const [formData, setFormData] = useState<PendingServiceFormData>({
    customerName: initialData?.customerName || '',
    customerPhone: initialData?.customerPhone || '',
    itemDescription: initialData?.itemDescription || '',
    serviceNotes: initialData?.serviceNotes || '',
    status: initialData?.status || 'Pendente',
    priority: initialData?.priority || 2,
    imageUrl: initialData?.imageUrl,
    imageBase64: undefined,
    imageMimeType: undefined,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'priority' ? parseInt(value) as ServicePriority : value }));
  };

  const handleImageUploaded: Base64ImageUploaderProps['onImageUploaded'] = useCallback((base64Data, mimeType, originalFile) => {
    setFormData(prev => ({
        ...prev,
        imageBase64: base64Data || undefined,
        imageMimeType: mimeType || undefined,
        imageUrl: base64Data ? undefined : prev.imageUrl,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.itemDescription) {
        alert("Nome do cliente e Descrição do item são obrigatórios.");
        return;
    }
    
    const servicePayload: PendingServiceFormData & { id?: string } = { ...formData };
    if (initialData?.id) {
        servicePayload.id = initialData.id;
    }
    
    onSave(servicePayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUploader 
        onImageUploaded={handleImageUploaded} 
        currentImageUrl={formData.imageBase64 ? `data:${formData.imageMimeType};base64,${formData.imageBase64}` : formData.imageUrl} 
        label="Foto do Item (Opcional)" 
      />
      {/* Form Fields... */}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Salvar Serviço</button>
      </div>
    </form>
  );
};

const getStatusColor = (status: PendingServiceStatus | PurchaseRequest['status']): string => {
    switch (status) {
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Em Análise': return 'bg-blue-100 text-blue-800';
        case 'Aguardando Peças': return 'bg-orange-100 text-orange-800';
        case 'Serviço Concluído': return 'bg-purple-100 text-purple-800';
        case 'Pronto para Retirada': return 'bg-teal-100 text-teal-800';
        case 'Entregue': return 'bg-green-100 text-green-800';
        case 'Aprovada': return 'bg-cyan-100 text-cyan-800';
        case 'Reprovada': return 'bg-red-200 text-red-900';
        case 'Enviada ao Fornecedor': return 'bg-fuchsia-100 text-fuchsia-800';
        case 'Recebida Parcialmente': return 'bg-amber-100 text-amber-800';
        case 'Recebida Totalmente': return 'bg-emerald-100 text-emerald-800';
        case 'Cancelada': return 'bg-stone-200 text-stone-700';
        case 'Finalizada': return 'bg-green-200 text-green-900';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityStyles = (priority: ServicePriority): { text: string; badgeClass: string; } => {
    const option = SERVICE_PRIORITY_OPTIONS.find(op => op.value === priority);
    return {
        text: option?.label || 'Normal',
        badgeClass: option?.badgeClass || 'bg-gray-100 text-gray-800'
    };
};

// Card Component
interface ServiceCardProps {
  service: PendingService;
  onEdit: (service: PendingService) => void;
  onDelete: (serviceId: string) => Promise<void>;
  canManage: boolean; 
  isSubmitting: boolean;
  isAdmin: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = React.memo(({ service, onEdit, onDelete, canManage, isSubmitting, isAdmin }) => {
  const priorityInfo = getPriorityStyles(service.priority);
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col md:flex-row">
       {/* Card content... */}
    </div>
  );
});
ServiceCard.displayName = 'ServiceCard';

// Page Component
interface PendingServicesPageProps {
  pendingServices: PendingService[];
  purchaseRequests: PurchaseRequest[];
  onAddService: (service: PendingServiceFormData) => Promise<void>;
  onUpdateService: (service: PendingServiceFormData & { id: string }) => Promise<void>;
  onDeleteService: (serviceId: string) => Promise<void>;
  onAddPurchaseRequest: (requestData: PurchaseRequestData) => Promise<PurchaseRequest | null>;
  onUpdatePurchaseRequest: (requestId: string, newStatus: PurchaseRequestStatus, newGlobalNotes?: string) => Promise<boolean>;
  onDeletePurchaseRequest: (requestId: string) => Promise<boolean>;
}

const PendingServicesPage: React.FC<PendingServicesPageProps> = ({ 
    pendingServices, 
    purchaseRequests,
    onAddService, 
    onUpdateService, 
    onDeleteService,
    onAddPurchaseRequest,
    onUpdatePurchaseRequest,
    onDeletePurchaseRequest
}) => {
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAddChoiceModalOpen, setIsAddChoiceModalOpen] = useState(false);
  const [isPurchaseRequestModalOpen, setIsPurchaseRequestModalOpen] = useState(false);
  const [isEditPurchaseRequestStatusModalOpen, setIsEditPurchaseRequestStatusModalOpen] = useState(false);
  const [editingPurchaseRequest, setEditingPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [newPurchaseRequestStatus, setNewPurchaseRequestStatus] = useState<PurchaseRequestStatus>('Pendente');

  const [editingService, setEditingService] = useState<PendingService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PendingServiceStatus | 'Todos'>('Todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser } = useAuth();
  const canManage = !!currentUser; 
  const isAdmin = currentUser?.role === 'admin';

  const handleOpenAddChoiceModal = () => setIsAddChoiceModalOpen(true);
  const handleCloseAddChoiceModal = () => setIsAddChoiceModalOpen(false);

  const handleOpenMaintenanceModal = (service?: PendingService) => {
    setEditingService(service || null);
    setIsMaintenanceModalOpen(true);
  };
  const handleCloseMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setEditingService(null);
  };

  const handleChoiceSelected = (choice: AddChoiceOption) => {
    handleCloseAddChoiceModal();
    if (choice === 'maintenance') {
      handleOpenMaintenanceModal();
    } else if (choice === 'purchase') {
      setIsPurchaseRequestModalOpen(true);
    }
  };

  const handleSaveMaintenanceService = async (serviceData: PendingServiceFormData & { id?: string }) => {
    setIsSubmitting(true);
    try {
      if (serviceData.id) {
        await onUpdateService(serviceData as PendingServiceFormData & { id: string });
      } else {
        await onAddService(serviceData);
      }
      handleCloseMaintenanceModal();
    } catch (error) {
      alert(`Erro ao salvar serviço: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePurchaseRequest = async (data: PurchaseRequestData) => {
     setIsSubmitting(true);
     try {
        const createdRequest = await onAddPurchaseRequest(data);
        if (createdRequest) {
            setIsPurchaseRequestModalOpen(false);
        }
     } catch (error) {
        alert(`Erro ao salvar requisição: ${(error as Error).message}`);
     } finally {
        setIsSubmitting(false);
     }
  };

  const filteredServices = useMemo(() => {
    // Sorting and filtering logic
    return pendingServices.filter(service => {
        const term = searchTerm.toLowerCase();
        const matchesTerm = (
          service.customerName.toLowerCase().includes(term) ||
          service.itemDescription.toLowerCase().includes(term)
        );
        const matchesStatus = statusFilter === 'Todos' || service.status === statusFilter;
        return matchesTerm && matchesStatus;
      });
  }, [pendingServices, searchTerm, statusFilter]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white shadow rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Central de Atividades</h1>
        {canManage && (
          <button
            onClick={handleOpenAddChoiceModal}
            disabled={isSubmitting}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
          >
            <AddIcon /> Adicionar
          </button>
        )}
      </div>

      {/* Filter and search UI */}
      {/* Services List */}
      {isAdmin && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          {/* Purchase Requests List */}
        </div>
      )}
      
      <AddChoiceModal 
        isOpen={isAddChoiceModalOpen} 
        onClose={handleCloseAddChoiceModal} 
        onChoiceSelected={handleChoiceSelected} 
      />
      
      <Modal isOpen={isPurchaseRequestModalOpen} onClose={() => setIsPurchaseRequestModalOpen(false)} title="Criar Requisição de Compra" size="xl">
        <PurchaseRequestForm onSave={handleSavePurchaseRequest} onClose={() => setIsPurchaseRequestModalOpen(false)} />
      </Modal>

      {/* Other Modals... */}
    </div>
  );
};

export default PendingServicesPage;