import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, Account, Transaction, Category, Budget, Goal, 
  FinancialKPIs, CreditCardPayment
} from '@/types';
import { format, startOfMonth, endOfMonth, subDays, isWithinInterval } from 'date-fns';

interface FinanceState {
  // Datos del usuario
  user: User | null;
  isAuthenticated: boolean;
  
  // Datos financieros
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  
  // Acciones de cuentas
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Acciones de transacciones
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'isVoided' | 'userId'>) => void;
  voidTransaction: (id: string) => void;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByDateRange: (start: Date, end: Date) => Transaction[];
  
  // Acciones de categorías
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Acciones de presupuestos
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Acciones de metas
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId: string) => void;
  
  // Cálculos y reportes
  getKPIs: () => FinancialKPIs;
  getCreditCardPayments: () => CreditCardPayment[];
  getMonthlyData: (month: number, year: number) => { income: number; expense: number };
  getCategoryBreakdown: (month: number, year: number) => { categoryId: string; amount: number; percentage: number }[];
  getDailyExpenses: (month: number, year: number) => { date: string; amount: number }[];
  getBudgetStatus: () => { budget: Budget; spent: number; remaining: number; percentage: number }[];
}

// Datos de demostración
const createDemoData = () => {
  const now = new Date();
  const userId = 'demo-user';
  
  const demoAccounts: Account[] = [
    {
      id: 'acc-1',
      userId,
      name: 'Efectivo',
      type: 'cash',
      balance: 150000,
      color: '#22c55e',
      icon: 'wallet',
      createdAt: now
    },
    {
      id: 'acc-2',
      userId,
      name: 'Cuenta Corriente',
      type: 'bank',
      balance: 1250300,
      color: '#3b82f6',
      icon: 'bank',
      createdAt: now
    },
    {
      id: 'acc-3',
      userId,
      name: 'Banco Estado Visa',
      type: 'credit_card',
      balance: 450300,
      creditLimit: 2000000,
      closingDay: 25,
      dueDay: 10,
      color: '#f97316',
      icon: 'credit-card',
      createdAt: now
    }
  ];
  
  const demoCategories: Category[] = [
    { id: 'cat-1', userId: null, name: 'Sueldo', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
    { id: 'cat-2', userId: null, name: 'Supermercado', icon: '🛒', color: '#f97316', type: 'expense', isDefault: true },
    { id: 'cat-3', userId: null, name: 'Restaurantes', icon: '🍽️', color: '#f97316', type: 'expense', isDefault: true },
    { id: 'cat-4', userId: null, name: 'Uber/Taxi', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
    { id: 'cat-5', userId: null, name: 'Streaming', icon: '📺', color: '#f59e0b', type: 'expense', isDefault: true },
    { id: 'cat-6', userId: null, name: 'Arriendo', icon: '🏠', color: '#8b5cf6', type: 'expense', isDefault: true },
    { id: 'cat-7', userId: null, name: 'Cuentas Básicas', icon: '💡', color: '#8b5cf6', type: 'expense', isDefault: true },
    { id: 'cat-8', userId: null, name: 'Otros', icon: '✨', color: '#6b7280', type: 'expense', isDefault: true },
  ];
  
  const demoTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      amount: 2100000,
      type: 'income',
      categoryId: 'cat-1',
      description: 'Sueldo Febrero',
      fromAccountId: 'acc-2',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-2',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      amount: 500000,
      type: 'expense',
      categoryId: 'cat-6',
      description: 'Arriendo',
      fromAccountId: 'acc-2',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-3',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      amount: 85000,
      type: 'expense',
      categoryId: 'cat-7',
      description: 'Luz, agua, gas',
      fromAccountId: 'acc-2',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-4',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      amount: 125000,
      type: 'expense',
      categoryId: 'cat-2',
      description: 'Supermercado Lider',
      fromAccountId: 'acc-2',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-5',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      amount: 8900,
      type: 'expense',
      categoryId: 'cat-4',
      description: 'Uber',
      fromAccountId: 'acc-3',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-6',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      amount: 11300,
      type: 'expense',
      categoryId: 'cat-5',
      description: 'Netflix',
      fromAccountId: 'acc-3',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-7',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 18),
      amount: 45300,
      type: 'expense',
      categoryId: 'cat-2',
      description: 'Supermercado',
      fromAccountId: 'acc-1',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-8',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 20),
      amount: 25000,
      type: 'expense',
      categoryId: 'cat-3',
      description: 'Almuerzo',
      fromAccountId: 'acc-3',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-9',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 22),
      amount: 18000,
      type: 'expense',
      categoryId: 'cat-4',
      description: 'Uber',
      fromAccountId: 'acc-3',
      isVoided: false,
      createdAt: now
    },
    {
      id: 'tx-10',
      userId,
      date: new Date(now.getFullYear(), now.getMonth(), 23),
      amount: 32000,
      type: 'expense',
      categoryId: 'cat-3',
      description: 'Cena',
      fromAccountId: 'acc-3',
      isVoided: false,
      createdAt: now
    }
  ];
  
  const demoBudgets: Budget[] = [
    {
      id: 'bud-1',
      userId,
      categoryId: 'cat-2',
      amount: 200000,
      period: 'monthly',
      alertThreshold: 80,
      createdAt: now
    },
    {
      id: 'bud-2',
      userId,
      categoryId: 'cat-5',
      amount: 50000,
      period: 'monthly',
      alertThreshold: 80,
      createdAt: now
    }
  ];
  
  const demoGoals: Goal[] = [
    {
      id: 'goal-1',
      userId,
      name: 'Viaje a Europa',
      targetAmount: 3000000,
      currentAmount: 800000,
      targetDate: new Date(now.getFullYear(), 11, 31),
      color: '#3b82f6',
      icon: 'plane',
      createdAt: now
    },
    {
      id: 'goal-2',
      userId,
      name: 'Auto Nuevo',
      targetAmount: 2000000,
      currentAmount: 200000,
      targetDate: new Date(now.getFullYear() + 1, 5, 30),
      color: '#f97316',
      icon: 'car',
      createdAt: now
    }
  ];
  
  return { demoAccounts, demoCategories, demoTransactions, demoBudgets, demoGoals };
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => {
      const demoData = createDemoData();
      
      return {
        user: {
          id: 'demo-user',
          email: 'demo@finanzasfaciles.cl',
          name: 'Carlos Demo',
          currency: 'CLP',
          createdAt: new Date()
        },
        isAuthenticated: true,
        accounts: demoData.demoAccounts,
        transactions: demoData.demoTransactions,
        categories: demoData.demoCategories,
        budgets: demoData.demoBudgets,
        goals: demoData.demoGoals,
        
        login: async (email: string) => {
          set({
            user: {
              id: 'user-' + Date.now(),
              email,
              name: email.split('@')[0],
              currency: 'CLP',
              createdAt: new Date()
            },
            isAuthenticated: true
          });
          return true;
        },
        
        register: async (email: string, name: string) => {
          set({
            user: {
              id: 'user-' + Date.now(),
              email,
              name,
              currency: 'CLP',
              createdAt: new Date()
            },
            isAuthenticated: true,
            accounts: [],
            transactions: [],
            categories: demoData.demoCategories,
            budgets: [],
            goals: []
          });
          return true;
        },
        
        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            accounts: [],
            transactions: [],
            budgets: [],
            goals: []
          });
        },
        
        updateUser: (updates: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({ user: { ...user, ...updates } });
          }
        },
        
        addAccount: (account) => {
          const newAccount: Account = {
            ...account,
            id: 'acc-' + Date.now(),
            createdAt: new Date()
          };
          set((state) => ({ accounts: [...state.accounts, newAccount] }));
        },
        
        updateAccount: (id, updates) => {
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.id === id ? { ...acc, ...updates } : acc
            )
          }));
        },
        
        deleteAccount: (id) => {
          set((state) => ({
            accounts: state.accounts.filter((acc) => acc.id !== id)
          }));
        },
        
        addTransaction: (transaction) => {
          const newTransaction: Transaction = {
            ...transaction,
            userId: 'demo-user',
            id: 'tx-' + Date.now(),
            isVoided: false,
            createdAt: new Date()
          };
          
          // Actualizar saldos de cuentas
          const { accounts } = get();
          const updatedAccounts = accounts.map((acc) => {
            if (acc.id === transaction.fromAccountId) {
              if (transaction.type === 'income') {
                return { ...acc, balance: acc.balance + transaction.amount };
              } else if (transaction.type === 'expense') {
                if (acc.type === 'credit_card') {
                  return { ...acc, balance: acc.balance + transaction.amount };
                }
                return { ...acc, balance: acc.balance - transaction.amount };
              } else if (transaction.type === 'transfer' || transaction.type === 'credit_card_payment') {
                return { ...acc, balance: acc.balance - transaction.amount };
              }
            }
            if (acc.id === transaction.toAccountId && (transaction.type === 'transfer' || transaction.type === 'credit_card_payment')) {
              if (acc.type === 'credit_card' && transaction.type === 'credit_card_payment') {
                return { ...acc, balance: acc.balance - transaction.amount };
              }
              return { ...acc, balance: acc.balance + transaction.amount };
            }
            return acc;
          });
          
          set((state) => ({
            transactions: [...state.transactions, newTransaction],
            accounts: updatedAccounts
          }));
        },
        
        voidTransaction: (id) => {
          const { transactions, accounts } = get();
          const transaction = transactions.find((t) => t.id === id);
          if (!transaction || transaction.isVoided) return;
          
          // Crear transacción de anulación
          const voidTransaction: Transaction = {
            ...transaction,
            id: 'tx-void-' + Date.now(),
            amount: -transaction.amount,
            description: `Anulación: ${transaction.description}`,
            isVoided: false,
            createdAt: new Date()
          };
          
          // Revertir saldos
          const updatedAccounts = accounts.map((acc) => {
            if (acc.id === transaction.fromAccountId) {
              if (transaction.type === 'income') {
                return { ...acc, balance: acc.balance - transaction.amount };
              } else if (transaction.type === 'expense') {
                if (acc.type === 'credit_card') {
                  return { ...acc, balance: acc.balance - transaction.amount };
                }
                return { ...acc, balance: acc.balance + transaction.amount };
              } else if (transaction.type === 'transfer' || transaction.type === 'credit_card_payment') {
                return { ...acc, balance: acc.balance + transaction.amount };
              }
            }
            if (acc.id === transaction.toAccountId && (transaction.type === 'transfer' || transaction.type === 'credit_card_payment')) {
              if (acc.type === 'credit_card' && transaction.type === 'credit_card_payment') {
                return { ...acc, balance: acc.balance + transaction.amount };
              }
              return { ...acc, balance: acc.balance - transaction.amount };
            }
            return acc;
          });
          
          set((state) => ({
            transactions: [
              ...state.transactions.map((t) =>
                t.id === id ? { ...t, isVoided: true, voidedBy: voidTransaction.id } : t
              ),
              voidTransaction
            ],
            accounts: updatedAccounts
          }));
        },
        
        getTransactionsByAccount: (accountId) => {
          return get().transactions.filter(
            (t) => (t.fromAccountId === accountId || t.toAccountId === accountId) && !t.isVoided
          );
        },
        
        getTransactionsByDateRange: (start, end) => {
          return get().transactions.filter(
            (t) => isWithinInterval(t.date, { start, end }) && !t.isVoided
          );
        },
        
        addCategory: (category) => {
          const newCategory: Category = {
            ...category,
            id: 'cat-' + Date.now()
          };
          set((state) => ({ categories: [...state.categories, newCategory] }));
        },
        
        updateCategory: (id, updates) => {
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat.id === id ? { ...cat, ...updates } : cat
            )
          }));
        },
        
        deleteCategory: (id) => {
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id)
          }));
        },
        
        addBudget: (budget) => {
          const newBudget: Budget = {
            ...budget,
            id: 'bud-' + Date.now(),
            createdAt: new Date()
          };
          set((state) => ({ budgets: [...state.budgets, newBudget] }));
        },
        
        updateBudget: (id, updates) => {
          set((state) => ({
            budgets: state.budgets.map((bud) =>
              bud.id === id ? { ...bud, ...updates } : bud
            )
          }));
        },
        
        deleteBudget: (id) => {
          set((state) => ({
            budgets: state.budgets.filter((bud) => bud.id !== id)
          }));
        },
        
        addGoal: (goal) => {
          const newGoal: Goal = {
            ...goal,
            id: 'goal-' + Date.now(),
            createdAt: new Date()
          };
          set((state) => ({ goals: [...state.goals, newGoal] }));
        },
        
        updateGoal: (id, updates) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === id ? { ...goal, ...updates } : goal
            )
          }));
        },
        
        deleteGoal: (id) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== id)
          }));
        },
        
        contributeToGoal: (goalId, amount, fromAccountId) => {
          const { goals, accounts } = get();
          const goal = goals.find((g) => g.id === goalId);
          const account = accounts.find((a) => a.id === fromAccountId);
          
          if (!goal || !account || account.balance < amount) return;
          
          // Actualizar meta
          set((state) => ({
            goals: state.goals.map((g) =>
              g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
            ),
            accounts: state.accounts.map((a) =>
              a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
            )
          }));
        },
        
        getKPIs: () => {
          const { accounts, transactions } = get();
          const now = new Date();
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);
          
          // Calcular saldos
          const liquidAccounts = accounts.filter((a) => a.type === 'cash' || a.type === 'bank');
          const creditCards = accounts.filter((a) => a.type === 'credit_card');
          
          const liquidBalance = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);
          const totalDebt = creditCards.reduce((sum, a) => sum + a.balance, 0);
          const realBalance = liquidBalance - totalDebt;
          
          // Transacciones del mes actual
          const monthlyTransactions = transactions.filter(
            (t) => isWithinInterval(t.date, { start: startOfCurrentMonth, end: endOfCurrentMonth }) && !t.isVoided
          );
          
          const totalIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const totalExpense = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          // Tasa de ahorro
          const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
          
          // Días de autonomía (promedio de gastos últimos 30 días)
          const last30Days = subDays(now, 30);
          const recentExpenses = transactions.filter(
            (t) => t.type === 'expense' && t.date >= last30Days && !t.isVoided
          );
          const avgDailyExpense = recentExpenses.length > 0
            ? recentExpenses.reduce((sum, t) => sum + t.amount, 0) / 30
            : 0;
          const daysOfAutonomy = avgDailyExpense > 0 ? Math.floor(liquidBalance / avgDailyExpense) : 999;
          
          // Carga financiera
          const monthlyIncome = totalIncome || 2100000;
          const financialLoad = (totalDebt / monthlyIncome) * 100;
          
          return {
            realBalance,
            totalIncome,
            totalExpense,
            savingsRate,
            daysOfAutonomy,
            financialLoad,
            liquidBalance,
            totalDebt
          };
        },
        
        getCreditCardPayments: () => {
          const { accounts, transactions } = get();
          const now = new Date();
          const creditCards = accounts.filter((a) => a.type === 'credit_card');
          
          return creditCards.map((card) => {
            // Calcular deuda del período actual
            const closingDate = new Date(now.getFullYear(), now.getMonth(), card.closingDay || 25);
            if (closingDate < now) {
              closingDate.setMonth(closingDate.getMonth() + 1);
            }
            
            const periodStart = new Date(closingDate);
            periodStart.setMonth(periodStart.getMonth() - 1);
            
            const periodTransactions = transactions.filter(
              (t) =>
                t.fromAccountId === card.id &&
                t.type === 'expense' &&
                isWithinInterval(t.date, { start: periodStart, end: closingDate }) &&
                !t.isVoided
            );
            
            const amount = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
            const dueDate = new Date(closingDate);
            dueDate.setDate(card.dueDay || 10);
            
            return {
              cardId: card.id,
              cardName: card.name,
              amount,
              dueDate
            };
          });
        },
        
        getMonthlyData: (month, year) => {
          const { transactions } = get();
          const start = new Date(year, month, 1);
          const end = endOfMonth(start);
          
          const monthlyTransactions = transactions.filter(
            (t) => isWithinInterval(t.date, { start, end }) && !t.isVoided
          );
          
          const income = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const expense = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          return { income, expense };
        },
        
        getCategoryBreakdown: (month, year) => {
          const { transactions } = get();
          const start = new Date(year, month, 1);
          const end = endOfMonth(start);
          
          const expenses = transactions.filter(
            (t) =>
              t.type === 'expense' &&
              isWithinInterval(t.date, { start, end }) &&
              !t.isVoided
          );
          
          const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
          
          const categoryMap = new Map<string, number>();
          expenses.forEach((t) => {
            const current = categoryMap.get(t.categoryId) || 0;
            categoryMap.set(t.categoryId, current + t.amount);
          });
          
          return Array.from(categoryMap.entries())
            .map(([categoryId, amount]) => ({
              categoryId,
              amount,
              percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);
        },
        
        getDailyExpenses: (month, year) => {
          const { transactions } = get();
          const start = new Date(year, month, 1);
          const end = endOfMonth(start);
          
          const expenses = transactions.filter(
            (t) =>
              t.type === 'expense' &&
              isWithinInterval(t.date, { start, end }) &&
              !t.isVoided
          );
          
          const dailyMap = new Map<string, number>();
          expenses.forEach((t) => {
            const dateStr = format(t.date, 'yyyy-MM-dd');
            const current = dailyMap.get(dateStr) || 0;
            dailyMap.set(dateStr, current + t.amount);
          });
          
          return Array.from(dailyMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
        },
        
        getBudgetStatus: () => {
          const { budgets, transactions } = get();
          const now = new Date();
          const start = startOfMonth(now);
          const end = endOfMonth(now);
          
          return budgets.map((budget) => {
            const spent = transactions
              .filter(
                (t) =>
                  t.categoryId === budget.categoryId &&
                  t.type === 'expense' &&
                  isWithinInterval(t.date, { start, end }) &&
                  !t.isVoided
              )
              .reduce((sum, t) => sum + t.amount, 0);
            
            return {
              budget,
              spent,
              remaining: budget.amount - spent,
              percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
            };
          });
        }
      };
    },
    {
      name: 'finanzas-faciles-storage'
    }
  )
);
