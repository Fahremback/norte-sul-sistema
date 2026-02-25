
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Order } from '../types';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const getStatusClass = (status: string) => {
    switch(status?.toUpperCase()) {
        case 'PAID': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CANCELED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status: string, trackingCode?: string | null) => {
    if (status === 'PAID') return trackingCode ? 'Enviado' : 'Pagamento Aprovado';
    if (status === 'PENDING') return 'Aguardando Pagamento';
    if (status === 'CANCELED') return 'Cancelado';
    return status;
};

const OrderDetailsModal: React.FC<{ order: Order | null, onClose: () => void }> = ({ order, onClose }) => {
    if (!order) return null;
    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Detalhes do Pedido #${order.id.substring(0,8)}`} size="2xl">
            <div className="space-y-4">
                <p><strong>Cliente:</strong> {order.customerName} ({order.user?.email})</p>
                <p><strong>Telefone:</strong> {order.user?.phone || 'Não informado'}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>{getStatusLabel(order.status, order.trackingCode)}</span></p>
                <p><strong>Total:</strong> R$ {Number(order.totalAmount).toFixed(2)}</p>
                <p><strong>Endereço de Entrega:</strong> {`${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPostalCode}`}</p>
                <div>
                    <p><strong>Itens:</strong></p>
                    <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                        {order.items.map(item => (
                            <li key={item.id}>
                                {item.product?.name || item.course?.title} - {item.quantity} x R$ {Number(item.price).toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    );
}

const OrdersManagementPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.get<Order[]>('/orders');
            setOrders(data || []);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Falha ao carregar pedidos.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateTracking = async (orderId: string) => {
        const code = trackingCodes[orderId];
        if (!code) return;
        try {
            await apiService.patch(`/orders/${orderId}/tracking`, { trackingCode: code });
            await fetchOrders(); 
        } catch (err) {
            alert(`Falha ao atualizar rastreio: ${(err as Error).message}`);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await apiService.patch(`/orders/${orderId}/status`, { status });
            await fetchOrders();
        } catch (err) {
            alert(`Falha ao atualizar status: ${(err as Error).message}`);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => filter === 'all' || order.status === filter);
    }, [orders, filter]);

    const allStatuses = useMemo(() => {
        return ['all', ...Array.from(new Set(orders.map(o => o.status)))];
    }, [orders]);

    return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos do Site</h1>
       <div className="mb-4 flex items-center bg-white p-3 rounded-md shadow-sm">
            <label htmlFor="status-filter" className="mr-2 font-medium text-gray-700">Filtrar por status:</label>
            <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white focus:ring-green-500 focus:border-green-500">
                {allStatuses.map(status => <option key={status} value={status}>{status === 'all' ? 'Todos' : getStatusLabel(status)}</option>)}
            </select>
        </div>
      {isLoading ? <LoadingSpinner text="Carregando pedidos..." /> : error ? <p className="text-red-500">{error}</p> : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Rastreio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => setSelectedOrder(order)}>#{order.id.substring(0,8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <select value={order.status} onChange={e => handleUpdateStatus(order.id, e.target.value)} className={`text-xs p-1 rounded-md border-0 ${getStatusClass(order.status)}`}>
                         <option value="PENDING">PENDING</option>
                         <option value="PAID">PAID</option>
                         <option value="CANCELED">CANCELED</option>
                      </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">R$ {Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.trackingCode ? (
                          <a href={order.trackingUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{order.trackingCode}</a>
                      ) : (
                          order.status === 'PAID' && (
                            <div className="flex items-center gap-1">
                                <input type="text" placeholder="Código" className="p-1 border rounded-md text-sm w-32" onChange={e => setTrackingCodes(prev => ({...prev, [order.id]: e.target.value}))} />
                                <button onClick={() => handleUpdateTracking(order.id)} disabled={!trackingCodes[order.id]} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Salvar</button>
                            </div>
                          )
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:underline">Ver Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default OrdersManagementPage;
