
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User, UserRole } from '../types';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserManagementPage: React.FC = () => {
  const { users, addUser, removeUser, updateUserRole, currentUser, fetchUsers } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // States for the new user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  
  const [isLoading, setIsLoading] = useState(false); 
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsLoading(true);
      fetchUsers()
        .finally(() => setIsLoading(false));
    }
  }, [currentUser, fetchUsers]);


  const openAddModal = () => {
    setName('');
    setEmail('');
    setCpfCnpj('');
    setPassword('');
    setRole('user');
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmitNewUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Nome, email e senha são obrigatórios para novos usuários.');
      return;
    }
    if (cpfCnpj && cpfCnpj.replace(/\D/g, '').length < 11) {
        alert('CPF/CNPJ inválido.');
        return;
    }
    setIsFormSubmitting(true);
    const success = await addUser({ name, email, cpfCnpj: cpfCnpj || undefined, password, role });
    setIsFormSubmitting(false);
    if (success) {
      handleModalClose();
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (window.confirm(`Tem certeza que deseja alterar a função deste usuário para ${newRole}?`)) {
        setIsLoading(true);
        await updateUserRole(userId, newRole);
        setIsLoading(false);
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && window.confirm(`Tem certeza que deseja remover o usuário ${userToDelete.email}? Esta ação não pode ser desfeita.`)) {
        setIsLoading(true);
        await removeUser(userId);
        setIsLoading(false);
    }
  }

  if (currentUser?.role !== 'admin') {
    return <p className="text-red-500 p-4">Acesso negado. Esta página é apenas para administradores.</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center p-4 bg-white shadow rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
        <button
          onClick={openAddModal}
          disabled={isLoading || isFormSubmitting}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400"
        >
          Adicionar Novo Usuário
        </button>
      </div>

      {isLoading && <div className="text-center p-4"><LoadingSpinner text="Carregando usuários..." /></div>}

      {!isLoading && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.cpfCnpj || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="p-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                      disabled={user.email === 'nortesulinformaticaloja@gmail.com' || isLoading} 
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.email !== 'nortesulinformaticaloja@gmail.com' && ( 
                      <button onClick={() => handleDeleteUser(user.id)} disabled={isLoading} className="text-red-600 hover:text-red-900 disabled:text-gray-400">
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title={'Adicionar Novo Usuário'}>
        <form onSubmit={handleSubmitNewUser} className="space-y-4">
           <div>
            <label htmlFor="name-modal" className="block text-sm font-medium text-gray-700">Nome do Usuário*</label>
            <input type="text" id="name-modal" value={name} onChange={(e) => setName(e.target.value)} required disabled={isFormSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="email-modal" className="block text-sm font-medium text-gray-700">Email do Usuário*</label>
            <input type="email" id="email-modal" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isFormSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
           <div>
            <label htmlFor="cpf-modal" className="block text-sm font-medium text-gray-700">CPF/CNPJ (Opcional)</label>
            <input type="text" id="cpf-modal" placeholder="Apenas números" value={cpfCnpj} disabled={isFormSubmitting}
              onChange={(e) => setCpfCnpj(e.target.value.replace(/\D/g,''))} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700">Senha*</label>
            <input type="password" id="password-modal" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={isFormSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="role-modal" className="block text-sm font-medium text-gray-700">Função</label>
            <select id="role-modal" value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={isFormSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm">
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">Lembre-se: Senhas devem ser fortes. O backend fará o hash seguro.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={handleModalClose} disabled={isFormSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={isFormSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isFormSubmitting ? <LoadingSpinner size="sm" colorClass="border-white"/> : 'Adicionar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
