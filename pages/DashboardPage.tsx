



import React, { useState, useMemo, useEffect } from 'react';
import type { SaleTransaction, Expense, Product, ChartDataPoint } from '../types';
import { SaleItemType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Modal from '../components/common/Modal';
import EditSaleForm from '../components/transactions/EditSaleForm';
import EditExpenseForm from '../components/transactions/EditExpenseForm';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

type Period = 'daily' | 'weekly' | 'monthly' | 'all';

const formatDateKey = (date: Date, period: Period): string => {
  if (period === 'daily') {
    return date.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' });
  } else if (period === 'weekly') {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); 
    return `Sem ${startOfWeek.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' })}`;
  } else if (period === 'monthly') {
    return date.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });
  } else { 
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }
};

const sortChartData = (data: ChartDataPoint[], period: Period): ChartDataPoint[] => {
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
  };

  return data.sort((a, b) => {
    let dateA_obj: Date | null, dateB_obj: Date | null;

    const parseDateString = (dateStr: string, p: Period): Date | null => {
      const currentFullYear = new Date().getFullYear();
      let year_num: number, month_num: number, day_num: number;

      if (dateStr.includes('/')) { 
        if (p === 'daily') { 
            const [day, month, yearShort] = dateStr.split('/');
            year_num = parseInt(`20${yearShort}`);
            month_num = parseInt(month) - 1;
            day_num = parseInt(day);
        } else if (p === 'weekly' && dateStr.startsWith('Sem ')) { 
            const datePart = dateStr.substring(4); 
            const [day, month] = datePart.split('/');
            year_num = currentFullYear; 
            month_num = parseInt(month) - 1;
            day_num = parseInt(day);
        } else {
            return null; 
        }
      } else if (dateStr.includes(' de ') || (p === 'monthly' && dateStr.match(/^\d{1,2} [a-zA-Z]{3}\.?$/))) {
        const parts = dateStr.replace('.', '').split(' '); 
        if (p === 'monthly' && parts.length === 2) { 
            day_num = parseInt(parts[0]);
            month_num = monthMap[parts[1].toLowerCase().substring(0,3)];
            year_num = currentFullYear; 
        } else if (p === 'all' && parts.length === 2) {
            day_num = 1; 
            month_num = monthMap[parts[0].toLowerCase().substring(0,3)];
            year_num = parseInt(`20${parts[1]}`);
        } else {
            return null; 
        }
      } else {
        return null; 
      }

      if (isNaN(year_num) || isNaN(month_num) || isNaN(day_num) || month_num === undefined) {
        return null;
      }
      return new Date(year_num, month_num, day_num);
    };

    dateA_obj = parseDateString(a.date, period);
    dateB_obj = parseDateString(b.date, period);

    if (!dateA_obj || !dateB_obj || isNaN(dateA_obj.getTime()) || isNaN(dateB_obj.getTime())) {
      return a.date.localeCompare(b.date); 
    }

    return dateA_obj.getTime() - dateB_obj.getTime();
  });
};


const filterByPeriod = <T extends { date: string },>(items: T[], period: Period): T[] => {
  const now = new Date();
  let startDate: Date;

  if (period === 'all') return items;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); 
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0); 
  }
  startDate.setHours(0,0,0,0);
  return items.filter(item => new Date(item.date) >= startDate);
};

const aggregateDataForChart = (items: (SaleTransaction | Expense)[], period: Period): ChartDataPoint[] => {
  const filtered = filterByPeriod(items, period);
  const aggregated: { [key: string]: number } = {};

  filtered.forEach(item => {
    const date = new Date(item.date);
    const key = formatDateKey(date, period);
    const value = item.hasOwnProperty('totalAmount') ? (item as SaleTransaction).totalAmount : (item as Expense).amount;
    aggregated[key] = (aggregated[key] || 0) + value;
  });
  
  const chartData = Object.entries(aggregated).map(([date, value]) => ({ date, value }));
  return sortChartData(chartData, period);
};


const StatCard: React.FC<{ title: string; value: string; colorClass: string; icon?: React.ReactNode }> = ({ title, value, colorClass, icon }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${colorClass}`}>
    {icon && <div className="p-3 bg-white bg-opacity-20 rounded-full">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-white opacity-90">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.218 12.77 10.5 12 10.5c-.77 0-1.536.718-2.121 1.282L9 12.536M4.5 9.75L3 11.25M9 4.5l1.5 1.5M19.5 9.75l1.5 1.5M15 4.5l-1.5 1.5" /></svg>;
const ExpensesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>;
const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;

interface DashboardPageProps {
  sales: SaleTransaction[];
  expenses: Expense[];
  products: Product[];
  onUpdateSale: (sale: SaleTransaction) => Promise<void>;
  onDeleteSale: (saleId: string) => Promise<void>;
  onUpdateExpense: (expense: Expense) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}


const DashboardPage: React.FC<DashboardPageProps> = ({ sales, expenses, products, onUpdateSale, onDeleteSale, onUpdateExpense, onDeleteExpense }) => {
    const [isLoading, setIsLoading] = useState(false); // Used for local actions like goal editing

    // The rest of the component logic remains largely the same...
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    const [period, setPeriod] = useState<Period>('monthly');
    const [salesGoal, setSalesGoal] = useState<number>(() => parseFloat(localStorage.getItem('salesGoal') || '10000'));
    const [isEditingGoal, setIsEditingGoal] = useState(false);

    // Editing modals state
    const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<SaleTransaction | null>(null);
    const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleSaveGoal = () => {
      localStorage.setItem('salesGoal', salesGoal.toString());
      setIsEditingGoal(false);
    }
  
    const openEditSaleModal = (sale: SaleTransaction) => {
      setEditingSale(sale);
      setIsEditSaleModalOpen(true);
    };
    const openEditExpenseModal = (expense: Expense) => {
      setEditingExpense(expense);
      setIsEditExpenseModalOpen(true);
    };
  
    const handleSaveSale = async (updatedSaleData: SaleTransaction): Promise<void> => {
        setIsSubmitting(true);
        try {
            await onUpdateSale(updatedSaleData);
            setIsEditSaleModalOpen(false);
            setEditingSale(null);
        } catch (error) {
            alert(`Falha ao salvar venda: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSaleItem = async (saleId: string): Promise<void> => {
        if (window.confirm("Tem certeza que deseja excluir esta venda? Esta ação ajustará o estoque de produtos, se aplicável.")) {
            setIsSubmitting(true);
            try {
                await onDeleteSale(saleId);
                setIsEditSaleModalOpen(false);
                setEditingSale(null);
            } catch (error) {
                 alert(`Falha ao excluir venda: ${(error as Error).message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleSaveExpense = async (updatedExpenseData: Expense): Promise<void> => {
        setIsSubmitting(true);
        try {
            await onUpdateExpense(updatedExpenseData);
            setIsEditExpenseModalOpen(false);
            setEditingExpense(null);
        } catch (error) {
            alert(`Falha ao salvar despesa: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteExpenseItem = async (expenseId: string): Promise<void> => {
        if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
            setIsSubmitting(true);
             try {
                await onDeleteExpense(expenseId);
                setIsEditExpenseModalOpen(false); 
                setEditingExpense(null);
            } catch (error) {
                 alert(`Falha ao excluir despesa: ${(error as Error).message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };
  
  
    const filteredSales = useMemo(() => filterByPeriod(sales, period), [sales, period]);
    const filteredExpenses = useMemo(() => filterByPeriod(expenses, period), [expenses, period]);
  
    const totalRevenue = useMemo(() => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0), [filteredSales]);
    const totalExpensesAmount = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);
    const netProfit = totalRevenue - totalExpensesAmount;
  
    const salesChartData = useMemo(() => aggregateDataForChart(sales, period), [sales, period]);
    const expensesChartData = useMemo(() => aggregateDataForChart(expenses, period), [expenses, period]);
  
    const topSellingProducts = useMemo(() => {
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      const activeProducts = products.filter(p => p.status === 'active');
  
      filterByPeriod(sales, 'all').forEach((sale: SaleTransaction) => {
        if (sale.itemType === SaleItemType.PRODUCT) {
          const productDetails = activeProducts.find(p => p.id === sale.itemId);
          if (productDetails) { 
            if (!productSales[sale.itemId]) {
              productSales[sale.itemId] = { name: productDetails.name, quantity: 0, revenue: 0 };
            }
            productSales[sale.itemId].quantity += sale.quantitySold;
            productSales[sale.itemId].revenue += sale.totalAmount;
          }
        }
      });
      return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [sales, products]); 
    
    const expenseBreakdown = useMemo(() => {
      const breakdown: { [category: string]: number } = {};
      filteredExpenses.forEach(expense => {
        const categoryKey = expense.category || "Não Categorizada";
        breakdown[categoryKey] = (breakdown[categoryKey] || 0) + expense.amount;
      });
      return Object.entries(breakdown).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [filteredExpenses]);
  
    const recentSalesForList = useMemo(() => [...sales].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,15), [sales]);
    const recentExpensesForList = useMemo(() => [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,15), [expenses]);
  

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner text="Carregando dashboard..." /></div>
    }
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Dashboard de Performance</h1>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow">
          {(['daily', 'weekly', 'monthly', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${period === p ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {p === 'daily' ? 'Hoje' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Receita Total" value={`R$ ${totalRevenue.toFixed(2)}`} colorClass="bg-gradient-to-r from-green-500 to-emerald-600" icon={<RevenueIcon />} />
        <StatCard title="Despesas Totais" value={`R$ ${totalExpensesAmount.toFixed(2)}`} colorClass="bg-gradient-to-r from-red-500 to-pink-600" icon={<ExpensesIcon />} />
        <StatCard title="Lucro Líquido" value={`R$ ${netProfit.toFixed(2)}`} colorClass={`bg-gradient-to-r ${netProfit >= 0 ? 'from-sky-500 to-indigo-600' : 'from-amber-500 to-orange-600'}`} icon={<ProfitIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Vendas ({period === 'daily' ? 'Diário' : period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensal' : 'Total'})</h2>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Vendas"]}/>
                <Legend />
                <Line type="monotone" dataKey="value" name="Vendas" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6, fill: "#059669" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Sem dados de vendas para o período selecionado.</p>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Despesas ({period === 'daily' ? 'Diário' : period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensal' : 'Total'})</h2>
          {expensesChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="date" stroke="#666"/>
              <YAxis stroke="#666" tickFormatter={(value) => `R$${value}`}/>
              <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Despesas"]}/>
              <Legend />
              <Bar dataKey="value" name="Despesas" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
          ) : <p className="text-gray-500">Sem dados de despesas para o período selecionado.</p>}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Metas de Vendas ({period === 'daily' ? 'Diário' : period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensal' : 'Total'})</h2>
        {isEditingGoal ? (
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              value={salesGoal} 
              onChange={(e) => setSalesGoal(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              aria-label="Definir meta de vendas"
            />
            <button onClick={handleSaveGoal} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Salvar Meta</button>
            <button onClick={() => setIsEditingGoal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancelar</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Meta Atual: <span className="font-bold text-green-600">R$ {salesGoal.toFixed(2)}</span></p>
              <p className="text-gray-600">Receita Atual ({period}): <span className="font-bold">R$ {totalRevenue.toFixed(2)}</span></p>
              {salesGoal > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min((totalRevenue / salesGoal) * 100, 100)}%` }}
                    aria-valuenow={Math.min((totalRevenue / salesGoal) * 100, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  ></div>
                </div>
              )}
               <p className="text-sm text-gray-500 mt-1">
                {salesGoal > 0 ? `${(Math.min((totalRevenue / salesGoal) * 100, 100)).toFixed(1)}% da meta atingida` : 'Defina uma meta para acompanhar o progresso.'}
              </p>
            </div>
            <button onClick={() => setIsEditingGoal(true)} className="px-4 py-2 bg-yellow-400 text-yellow-800 rounded-md hover:bg-yellow-500">Editar Meta</button>
          </div>
        )}
         <p className="text-xs text-gray-500 mt-4">Projeções futuras: Com base nos dados atuais, analise as tendências dos gráficos para planejar os próximos passos. A IA poderá auxiliar em análises mais complexas no futuro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Últimas Vendas Registradas (Máx. 15)</h3>
          {recentSalesForList.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {recentSalesForList.map(sale => (
                <div key={sale.id} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800 text-sm truncate" title={sale.itemName}>{sale.itemName}</p>
                    <span className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span>Qtd: {sale.quantitySold}</span>
                    <span className="mx-1">|</span>
                    <span>Preço Un.: R$ {sale.pricePerItem.toFixed(2)}</span>
                    <span className="mx-1">|</span>
                    <span className="font-semibold text-green-700">Total: R$ {sale.totalAmount.toFixed(2)}</span>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => openEditSaleModal(sale)}
                      className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <EditIcon /> <span className="ml-1">Editar</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">Nenhuma venda registrada.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Últimas Despesas Registradas (Máx. 15)</h3>
          {recentExpensesForList.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {recentExpensesForList.map(expense => (
                <div key={expense.id} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800 text-sm truncate" title={expense.description}>{expense.description}</p>
                    <span className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold text-red-700">Valor: R$ {expense.amount.toFixed(2)}</span>
                    {expense.category && <><span className="mx-1">|</span><span>Categoria: {expense.category}</span></>}
                  </div>
                   {isAdmin && (
                    <button 
                      onClick={() => openEditExpenseModal(expense)}
                       className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded disabled:opacity-50"
                       disabled={isSubmitting}
                    >
                      <EditIcon /> <span className="ml-1">Editar</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">Nenhuma despesa registrada.</p>}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Produtos Mais Vendidos (Geral)</h3>
          {topSellingProducts.length > 0 ? (
            <ul className="space-y-2">
              {topSellingProducts.map(p => (
                <li key={p.name} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-800 truncate max-w-[60%]">{p.name}</span>
                  <span className="font-semibold text-green-600">R$ {p.revenue.toFixed(2)} ({p.quantity} un.)</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500">Nenhum produto vendido ainda.</p>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Despesas por Categoria ({period})</h3>
           {expenseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, expenseBreakdown.length * 40)}>
                <BarChart data={expenseBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `R$${value}`} />
                    <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12, fill: '#374151'}} interval={0} />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]}/>
                    <Bar dataKey="value" fill="#ef4444" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
           ) : <p className="text-sm text-gray-500">Nenhuma despesa registrada no período.</p>}
        </div>
      </div>

      {editingSale && (
        <Modal isOpen={isEditSaleModalOpen} onClose={() => { setIsEditSaleModalOpen(false); setEditingSale(null); }} title="Editar Venda" size="lg">
          <EditSaleForm 
            initialData={editingSale} 
            products={products}
            onSave={handleSaveSale} 
            onDelete={() => handleDeleteSaleItem(editingSale.id)}
            onClose={() => { setIsEditSaleModalOpen(false); setEditingSale(null); }} 
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {editingExpense && (
        <Modal isOpen={isEditExpenseModalOpen} onClose={() => { setIsEditExpenseModalOpen(false); setEditingExpense(null);}} title="Editar Despesa" size="md">
          <EditExpenseForm 
            initialData={editingExpense} 
            onSave={handleSaveExpense} 
            onDelete={() => handleDeleteExpenseItem(editingExpense.id)} 
            onClose={() => { setIsEditExpenseModalOpen(false); setEditingExpense(null); }}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

    </div>
  );
};

export default DashboardPage;