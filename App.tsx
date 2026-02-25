

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import type { Product, SaleTransaction, Expense, Service, PendingService, Ticket, PurchaseRequest, SupportTicketData, PurchaseRequestData, TicketStatus, PurchaseRequestStatus, PendingServiceFormData } from './types';


// Pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import PointOfSalePage from './pages/PointOfSalePage';
import UserManagementPage from './pages/UserManagementPage';
import OrdersManagementPage from './pages/OrdersManagementPage';
import CoursesManagementPage from './pages/CoursesManagementPage';
import CourseAccessManagementPage from './pages/CourseAccessManagementPage';
import SiteSettingsManagementPage from './pages/SiteSettingsManagementPage';
import TicketsManagementPage from './pages/TicketsManagementPage';
import PendingServicesPage from './pages/PendingServicesPage';


// Contexts & Services
import { AuthProvider, useAuth } from './contexts/AuthContext';
import apiService from './services/apiService'; 
import LoadingSpinner from './components/common/LoadingSpinner';

// Icons
import {
  ChartPieIcon, CreditCardIcon, UsersIcon, Cog6ToothIcon,
  AcademicCapIcon, KeyIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon,
  CircleStackIcon, WrenchScrewdriverIcon, TicketIcon
} from '@heroicons/react/24/outline';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <LoadingSpinner text="Carregando autenticação..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly: boolean;
}

const AppContent: React.FC = () => {
  const { currentUser, logout, isLoadingAuth, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Centralized State
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser || !token) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
        const [
            productsData, servicesData, pendingServicesData, salesData, expensesData, ticketsData
        ] = await Promise.all([
            apiService.get<Product[]>('/products'),
            apiService.get<Service[]>('/services'),
            apiService.get<PendingService[]>('/pending-services'),
            apiService.get<SaleTransaction[]>('/sales'),
            apiService.get<Expense[]>('/expenses'),
            apiService.get<Ticket[]>('/tickets'),
        ]);

        setProducts(productsData || []);
        setServices(servicesData || []);
        setPendingServices(pendingServicesData || []);
        setSales(salesData || []);
        setExpenses(expensesData || []);
        setSupportTickets(ticketsData || []);
        
        if (currentUser.role === 'admin') {
            const [purchaseRequestsData] = await Promise.all([
                apiService.get<PurchaseRequest[]>('/purchase-requests'),
            ]);
            setPurchaseRequests(purchaseRequestsData || []);
        }

    } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Falha ao carregar dados do servidor.');
        console.error("Fetch data error:", error);
    } finally {
        setIsLoadingData(false);
    }
}, [currentUser, token]);


  useEffect(() => {
    if (currentUser && token) {
        fetchData();
    }
  }, [currentUser, token, fetchData]);
  
  const handleAddService = useCallback(async (serviceData: PendingServiceFormData) => { await apiService.post('/pending-services', serviceData); await fetchData(); }, [fetchData]);
  const handleUpdateService = useCallback(async (serviceData: PendingServiceFormData & { id: string }) => { await apiService.put(`/pending-services/${serviceData.id}`, serviceData); await fetchData(); }, [fetchData]);
  const handleDeleteService = useCallback(async (serviceId: string) => { await apiService.del(`/pending-services/${serviceId}`); await fetchData(); }, [fetchData]);

  const handleUpdateTicket = useCallback(async (ticketId: string, status: TicketStatus) => { await apiService.patch(`/tickets/${ticketId}/status`, { status }); await fetchData(); }, [fetchData]);
  const handleDeleteTicket = useCallback(async (ticketId: string) => { await apiService.del(`/tickets/${ticketId}`); await fetchData(); }, [fetchData]);
  
  const handleAddPurchaseRequest = useCallback(async (requestData: PurchaseRequestData): Promise<PurchaseRequest | null> => { const newRequest = await apiService.post<PurchaseRequest>('/purchase-requests', requestData); await fetchData(); return newRequest; }, [fetchData]);
  const handleUpdatePurchaseRequest = useCallback(async (requestId: string, status: PurchaseRequestStatus, globalNotes?: string): Promise<boolean> => { const result = await apiService.put(`/purchase-requests/${requestId}`, { status, globalNotes }); await fetchData(); return !!result; }, [fetchData]);
  const handleDeletePurchaseRequest = useCallback(async (requestId: string): Promise<boolean> => { await apiService.del(`/purchase-requests/${requestId}`); await fetchData(); return true; }, [fetchData]);

  // Handlers for Products
  const handleAddProduct = useCallback(async (productData: any) => {
    setIsSubmitting(true);
    try {
      await apiService.post('/products', productData);
      await fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Falha ao adicionar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleUpdateProduct = useCallback(async (productData: any) => {
    setIsSubmitting(true);
    try {
      await apiService.put(`/products/${productData.id}`, productData);
      await fetchData();
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Falha ao atualizar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    setIsSubmitting(true);
    try {
      await apiService.del(`/products/${productId}`);
      await fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`Falha ao excluir produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleAddMultipleProducts = useCallback(async (newProducts: any[]) => {
    setIsSubmitting(true);
    try {
      await apiService.post('/products/bulk', newProducts);
      await fetchData();
    } catch (error) {
      console.error("Error adding multiple products:", error);
      alert(`Falha ao adicionar produtos em lote: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);
  
  // Handlers for Dashboard (Sales & Expenses)
  const handleUpdateSale = useCallback(async (sale: SaleTransaction) => {
    setIsSubmitting(true);
    try {
      await apiService.put(`/sales/${sale.id}`, sale);
      await fetchData();
    } catch (error) {
      console.error("Error updating sale:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleDeleteSale = useCallback(async (saleId: string) => {
    setIsSubmitting(true);
    try {
      await apiService.del(`/sales/${saleId}`);
      await fetchData();
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleUpdateExpense = useCallback(async (expense: Expense) => {
    setIsSubmitting(true);
    try {
      await apiService.put(`/expenses/${expense.id}`, expense);
      await fetchData();
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);

  const handleDeleteExpense = useCallback(async (expenseId: string) => {
    setIsSubmitting(true);
    try {
      await apiService.del(`/expenses/${expenseId}`);
      await fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchData]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isLoadingAuth) {
    return <div className="flex flex-col justify-center items-center h-screen"><LoadingSpinner text="Carregando autenticação..." /></div>;
  }
  
  if (!currentUser) {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
  }

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartPieIcon, adminOnly: false },
    { path: '/pos', label: 'Ponto de Venda', icon: CreditCardIcon, adminOnly: false },
    { path: '/', label: 'Central de Atividades', icon: WrenchScrewdriverIcon, adminOnly: false },
    { path: '/products', label: 'Gerenciamento de Produtos', icon: BuildingStorefrontIcon, adminOnly: true },
    { path: '/courses', label: 'Gerenciamento de Cursos', icon: AcademicCapIcon, adminOnly: true },
    { path: '/approvals', label: 'Aprovação de Acesso a Cursos', icon: KeyIcon, adminOnly: true },
    { path: '/orders', label: 'Todos os Pedidos', icon: CircleStackIcon, adminOnly: true },
    { path: '/tickets', label: 'Gerenciamento de Tickets', icon: TicketIcon, adminOnly: true },
    { path: '/users', label: 'Gerenciamento de Usuários', icon: UsersIcon, adminOnly: true },
    { path: '/settings', label: 'Configurações Gerais do Site', icon: Cog6ToothIcon, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || (currentUser && currentUser.role === 'admin'));

  const NavLink: React.FC<{ to: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, label: string }> = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
        <Icon className={`w-6 h-6 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        <span>{label}</span>
      </Link>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white shadow-lg w-64 flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
        <div className="flex items-center justify-center p-6 border-b">
          <span className="font-bold text-2xl text-green-600">Norte Sul</span>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map(item => (
            <NavLink key={item.path} to={item.path} icon={item.icon} label={item.label} />
          ))}
        </nav>
        <div className="w-full p-4 border-t">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors">
            <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3 text-gray-500" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white shadow-sm flex justify-between items-center p-4 z-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
           <span className="font-bold text-xl text-green-600">Norte Sul</span>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
            <Routes>
                <Route path="/" element={<ProtectedRoute><PendingServicesPage 
                    pendingServices={pendingServices}
                    purchaseRequests={purchaseRequests}
                    onAddService={handleAddService}
                    onUpdateService={handleUpdateService}
                    onDeleteService={handleDeleteService}
                    onAddPurchaseRequest={handleAddPurchaseRequest}
                    onUpdatePurchaseRequest={handleUpdatePurchaseRequest}
                    onDeletePurchaseRequest={handleDeletePurchaseRequest}
                 /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage 
                    sales={sales}
                    expenses={expenses}
                    products={products}
                    onUpdateSale={handleUpdateSale}
                    onDeleteSale={handleDeleteSale}
                    onUpdateExpense={handleUpdateExpense}
                    onDeleteExpense={handleDeleteExpense}
                /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><PointOfSalePage /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><ProductCatalogPage 
                    products={products}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAddMultipleProducts={handleAddMultipleProducts}
                /></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute><CoursesManagementPage /></ProtectedRoute>} />
                <Route path="/approvals" element={<ProtectedRoute><CourseAccessManagementPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersManagementPage /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute><TicketsManagementPage 
                    supportTickets={supportTickets}
                    onUpdateTicket={handleUpdateTicket}
                    onDeleteTicket={handleDeleteTicket}
                    isSubmitting={isSubmitting}
                /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SiteSettingsManagementPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
