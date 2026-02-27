import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  CreditCard,
  Trash2,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import type { TransactionType } from '@/types';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const { 
    transactions, 
    accounts, 
    categories, 
    voidTransaction,
    getMonthlyData
  } = useFinanceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthlyData = getMonthlyData(selectedMonth, selectedYear);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Desconocido';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || 'Desconocido';
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-600" />;
      case 'credit_card_payment':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      default:
        return <TrendingDown className="h-5 w-5" />;
    }
  };

  // Filtrar transacciones
  const filteredTransactions = transactions
    .filter((t) => {
      const toDate = (d: any) => (d instanceof Date ? d : new Date(d));
      const txDateObj = toDate(t.date);
      // Filtro por búsqueda
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(t.categoryId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAccountName(t.fromAccountId).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por tipo
      const matchesType = filterType === 'all' || t.type === filterType;
      
      // Filtro por cuenta
      const matchesAccount = filterAccount === 'all' || 
        t.fromAccountId === filterAccount || 
        t.toAccountId === filterAccount;
      
      // Filtro por mes
      const transactionMonth = txDateObj.getMonth();
      const transactionYear = txDateObj.getFullYear();
      const matchesMonth = transactionMonth === selectedMonth && transactionYear === selectedYear;
      
      return matchesSearch && matchesType && matchesAccount && matchesMonth;
    })
    .sort((a, b) => {
      const toDate = (d: any) => (d instanceof Date ? d : new Date(d));
      return toDate(b.date).getTime() - toDate(a.date).getTime();
    });

  const handleVoid = (id: string) => {
    if (confirm('¿Estás seguro de anular esta transacción? Se creará un registro de auditoría.')) {
      voidTransaction(id);
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Resumen del Mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-xl font-semibold text-green-600">+{formatCurrency(monthlyData.income)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos</p>
                <p className="text-xl font-semibold text-red-600">-{formatCurrency(monthlyData.expense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={cn(
                  "text-xl font-semibold",
                  monthlyData.income - monthlyData.expense >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {monthlyData.income - monthlyData.expense >= 0 ? '+' : ''}
                  {formatCurrency(monthlyData.income - monthlyData.expense)}
                </p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType | 'all')}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                  <SelectItem value="transfer">Transferencias</SelectItem>
                  <SelectItem value="credit_card_payment">Pagos TC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Transacciones ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No se encontraron transacciones</p>
                <p className="text-sm">Intenta ajustar los filtros</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50",
                    transaction.isVoided && "opacity-50 bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === 'income' ? 'bg-green-100' :
                      transaction.type === 'expense' ? 'bg-red-100' :
                      transaction.type === 'credit_card_payment' ? 'bg-orange-100' : 'bg-blue-100'
                    )}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className={cn("font-medium", transaction.isVoided && "line-through")}>
                        {transaction.description || getCategoryName(transaction.categoryId)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                        />
                        {getCategoryName(transaction.categoryId)}
                        <span>•</span>
                        {getAccountName(transaction.fromAccountId)}
                        {transaction.toAccountId && (
                          <>
                            <span>→</span>
                            {getAccountName(transaction.toAccountId)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' :
                      transaction.type === 'credit_card_payment' ? 'text-orange-600' : 'text-blue-600',
                      transaction.isVoided && "line-through"
                    )}>
                      {transaction.type === 'income' ? '+' : 
                       transaction.type === 'expense' || transaction.type === 'credit_card_payment' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(transaction.date, 'dd/MM/yyyy HH:mm')}
                    </p>
                    {transaction.isVoided && (
                      <p className="text-xs text-red-600 font-medium">Anulado</p>
                    )}
                  </div>
                  
                  {!transaction.isVoided && (
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleVoid(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
