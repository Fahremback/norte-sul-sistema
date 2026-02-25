import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthContextType, LoginResult } from '../types';
import apiService from '../services/apiService'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL_FOR_INITIAL_CHECK = 'nortesulinformaticaloja@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    apiService.setToken(null);
    setUsers([]);
  }, []);

  const fetchAdminData = useCallback(async (userToken: string) => {
    if (!userToken) return;
    apiService.setToken(userToken); 
    try {
      const [fetchedUsers] = await Promise.all([
        apiService.get<User[]>('/users'),
      ]);
      if (fetchedUsers) setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch admin data (users):", error);
      throw error; // Rethrow to be caught by the caller
    }
  }, []);


  useEffect(() => {
    const initializeAuth = async () => {
        setIsLoadingAuth(true);
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
            apiService.setToken(storedToken);
            try {
                const userProfile = await apiService.getMyProfile();
                if (userProfile) {
                    setCurrentUser(userProfile);
                    setToken(storedToken);
                    localStorage.setItem('currentUser', JSON.stringify(userProfile)); // Keep localStorage in sync
                    if (userProfile.role === 'admin') {
                        await fetchAdminData(storedToken);
                    }
                } else {
                    // Profile is null, something is wrong with the token/user
                    logout();
                }
            } catch (e) {
                console.error("Token validation failed during profile fetch, logging out.", e);
                logout(); // Token is invalid/expired, clear it
            }
        }
        setIsLoadingAuth(false);
    };
    initializeAuth();
  }, [fetchAdminData, logout]); 

  const login = useCallback(async (identifier: string, passwordAttempt: string): Promise<LoginResult> => {
    setIsLoadingAuth(true);
    try {
      const response = await apiService.post<{ token: string, user: User }>('/auth/login', { emailOrCpf: identifier, password: passwordAttempt });
      if (response && response.token && response.user) {
        setToken(response.token);
        setCurrentUser(response.user);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        apiService.setToken(response.token);
        if (response.user.role === 'admin') {
          await fetchAdminData(response.token); 
        }
        setIsLoadingAuth(false);
        return 'success';
      }
      setIsLoadingAuth(false);
      return 'unknown_error';
    } catch (error: any) {
      setIsLoadingAuth(false);
      if (error.status === 401 || error.status === 404) {
        if(error.data?.message?.toLowerCase().includes('password')) return 'invalid_password';
        return 'user_not_found';
      }
      if (error.message?.includes('Failed to fetch')) return 'network_error';
      console.error("Login error:", error);
      return 'unknown_error';
    }
  }, [fetchAdminData]);
  
  const fetchUsers = useCallback(async () => { 
    if (currentUser?.role !== 'admin' || !token) return;
    try {
      const fetchedUsersData = await apiService.get<User[]>('/users');
      if (fetchedUsersData) setUsers(fetchedUsersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Falha ao carregar lista de usuários.");
    }
  }, [currentUser, token]);


  const addUser = useCallback(async (newUserParams: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'username'>): Promise<boolean> => {
    if (currentUser?.role !== 'admin') {
        alert("Apenas administradores podem adicionar usuários.");
        return false;
    }
    try {
      const payload = { ...newUserParams, isAdmin: newUserParams.role === 'admin' };
      const createdUser = await apiService.post<User>('/auth/register', payload);
      if (createdUser) {
        await fetchUsers(); // Refetch users to get the latest list
        return true;
      }
      return false;
    } catch (error: any) {
      alert(`Erro ao adicionar usuário: ${error.data?.message || error.message}`);
      return false;
    }
  }, [currentUser, fetchUsers]);

  const removeUser = useCallback(async (userId: string) => {
    if (currentUser?.role !== 'admin') {
        alert("Apenas administradores podem remover usuários.");
        return;
    }
    const userToRemove = users.find(u => u.id === userId);
    if (userToRemove && userToRemove.email === ADMIN_EMAIL_FOR_INITIAL_CHECK) {
      alert('Não é possível remover o usuário administrador padrão do frontend.');
      return;
    }
    try {
      await apiService.del(`/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (error: any) {
      alert(`Erro ao remover usuário: ${error.data?.message || error.message}`);
    }
  }, [users, currentUser]);
  
  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== 'admin') {
        alert("Apenas administradores podem alterar funções.");
        return;
    }
     const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate && userToUpdate.email === ADMIN_EMAIL_FOR_INITIAL_CHECK && newRole !== 'admin') {
      alert('O usuário administrador padrão não pode ter sua função alterada para não-admin (validação frontend).');
      return;
    }
    try {
      await apiService.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? {...u, role: newRole} : u));
    } catch (error: any) {
      alert(`Erro ao atualizar função do usuário: ${error.data?.message || error.message}`);
      fetchUsers();
    }
  }, [users, currentUser, fetchUsers]);

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        token, 
        users, 
        login, 
        logout, 
        addUser, 
        removeUser, 
        updateUserRole, 
        isLoadingAuth, 
        fetchUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
