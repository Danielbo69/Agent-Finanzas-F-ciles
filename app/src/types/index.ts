// Tipos principales de la aplicación Finanzas Fáciles

export type AccountType = 'cash' | 'bank' | 'credit_card';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'credit_card_payment';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  parentId?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  date: Date;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  fromAccountId: string;
  toAccountId?: string;
  isVoided: boolean;
  voidedBy?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly';
  alertThreshold: number;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  color: string;
  icon: string;
  accountId?: string;
  createdAt: Date;
}

export interface FinancialKPIs {
  realBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  daysOfAutonomy: number;
  financialLoad: number;
  liquidBalance: number;
  totalDebt: number;
}

export interface CreditCardPayment {
  cardId: string;
  cardName: string;
  amount: number;
  dueDate: Date;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  transactions: Transaction[];
  categoryBreakdown: { categoryId: string; amount: number; percentage: number }[];
}

// Categorías predefinidas
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Sueldo', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
  { name: 'Freelance', icon: '💻', color: '#22c55e', type: 'income', isDefault: true },
  { name: 'Devoluciones', icon: '↩️', color: '#22c55e', type: 'income', isDefault: true },
  { name: 'Otros Ingresos', icon: '💵', color: '#22c55e', type: 'income', isDefault: true },
  { name: 'Supermercado', icon: '🛒', color: '#f97316', type: 'expense', isDefault: true, parentId: 'alimentacion' },
  { name: 'Restaurantes', icon: '🍽️', color: '#f97316', type: 'expense', isDefault: true, parentId: 'alimentacion' },
  { name: 'Delivery', icon: '🍔', color: '#f97316', type: 'expense', isDefault: true, parentId: 'alimentacion' },
  { name: 'Bencina', icon: '⛽', color: '#3b82f6', type: 'expense', isDefault: true, parentId: 'transporte' },
  { name: 'Uber/Taxi', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true, parentId: 'transporte' },
  { name: 'Mantención', icon: '🔧', color: '#3b82f6', type: 'expense', isDefault: true, parentId: 'transporte' },
  { name: 'Arriendo/Dividendo', icon: '🏠', color: '#8b5cf6', type: 'expense', isDefault: true, parentId: 'vivienda' },
  { name: 'Cuentas Básicas', icon: '💡', color: '#8b5cf6', type: 'expense', isDefault: true, parentId: 'vivienda' },
  { name: 'Gastos Comunes', icon: '🏢', color: '#8b5cf6', type: 'expense', isDefault: true, parentId: 'vivienda' },
  { name: 'Ropa', icon: '👕', color: '#ec4899', type: 'expense', isDefault: true, parentId: 'compras' },
  { name: 'Electrónica', icon: '📱', color: '#ec4899', type: 'expense', isDefault: true, parentId: 'compras' },
  { name: 'Hogar', icon: '🏡', color: '#ec4899', type: 'expense', isDefault: true, parentId: 'compras' },
  { name: 'Streaming', icon: '📺', color: '#f59e0b', type: 'expense', isDefault: true, parentId: 'entretenimiento' },
  { name: 'Cine', icon: '🎬', color: '#f59e0b', type: 'expense', isDefault: true, parentId: 'entretenimiento' },
  { name: 'Salidas', icon: '🎉', color: '#f59e0b', type: 'expense', isDefault: true, parentId: 'entretenimiento' },
  { name: 'Deportes', icon: '⚽', color: '#f59e0b', type: 'expense', isDefault: true, parentId: 'entretenimiento' },
  { name: 'Farmacia', icon: '💊', color: '#ef4444', type: 'expense', isDefault: true, parentId: 'salud' },
  { name: 'Consultas', icon: '🩺', color: '#ef4444', type: 'expense', isDefault: true, parentId: 'salud' },
  { name: 'Seguros', icon: '🛡️', color: '#ef4444', type: 'expense', isDefault: true, parentId: 'salud' },
  { name: 'Cursos', icon: '📚', color: '#14b8a6', type: 'expense', isDefault: true, parentId: 'educacion' },
  { name: 'Libros', icon: '📖', color: '#14b8a6', type: 'expense', isDefault: true, parentId: 'educacion' },
  { name: 'Universidad', icon: '🎓', color: '#14b8a6', type: 'expense', isDefault: true, parentId: 'educacion' },
  { name: 'Otros', icon: '✨', color: '#6b7280', type: 'expense', isDefault: true },
];

// Colores para cuentas
export const ACCOUNT_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#84cc16'
];

// Iconos para cuentas
export const ACCOUNT_ICONS = [
  'wallet', 'credit-card', 'bank', 'piggy-bank', 'coins',
  'banknote', 'landmark', 'circle-dollar-sign', 'trending-up', 'shield'
];
