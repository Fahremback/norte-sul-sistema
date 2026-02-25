
import React, { useState } from 'react';
import type { Ticket, TicketStatus } from '../types';
import { ALL_TICKET_STATUSES } from '../types';

interface TicketsManagementPageProps {
    supportTickets: Ticket[];
    onUpdateTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
    onDeleteTicket: (ticketId: string) => Promise<void>;
    isSubmitting: boolean;
}

const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case 'OPEN': return 'bg-rose-100 text-rose-800';
        case 'CLOSED': return 'bg-lime-100 text-lime-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const TicketsManagementPage: React.FC<TicketsManagementPageProps> = ({
    supportTickets,
    onUpdateTicket,
    onDeleteTicket,
    isSubmitting
}) => {
    const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

    const filteredTickets = supportTickets.filter(ticket => filter === 'all' || ticket.status === filter);
    const allStatuses = ['all', ...ALL_TICKET_STATUSES];

    const handleUpdate = async (id: string, status: TicketStatus) => {
        await onUpdateTicket(id, status);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este ticket?')) {
            await onDeleteTicket(id);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gerenciamento de Tickets de Contato</h1>
             <div className="mb-4">
                <label htmlFor="ticket-status-filter" className="mr-2">Filtrar por status:</label>
                <select id="ticket-status-filter" value={filter} onChange={(e) => setFilter(e.target.value as any)} className="p-2 border rounded-md">
                    {allStatuses.map(status => <option key={status} value={status}>{status === 'all' ? 'Todos' : status}</option>)}
                </select>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{ticket.name}</div>
                                    <div className="text-sm text-gray-500">{ticket.email}</div>
                                    {ticket.phone && <div className="text-sm text-gray-500">{ticket.phone}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 max-w-md whitespace-pre-wrap">{ticket.message}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select 
                                        value={ticket.status} 
                                        onChange={(e) => handleUpdate(ticket.id, e.target.value as TicketStatus)}
                                        className={`text-xs p-1 rounded-md border-0 ${getStatusColor(ticket.status)}`}
                                        disabled={isSubmitting}
                                    >
                                        {ALL_TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleDelete(ticket.id)} disabled={isSubmitting} className="text-red-600 hover:text-red-900 disabled:text-gray-400">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketsManagementPage;
