import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  AlertCircle,
  PiggyBank,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'];

export default function Dashboard() {
  const { 
    getKPIs, 
    getCreditCardPayments, 
    getCategoryBreakdown, 
    getDailyExpenses,
    getBudgetStatus,
    accounts,
    categories,
    transactions,
    user,
    logout
  } = useFinanceStore();

  const kpis = getKPIs();
  const creditCardPayments = getCreditCardPayments();
  const categoryBreakdown = getCategoryBreakdown(new Date().getMonth(), new Date().getFullYear());
  const dailyExpenses = getDailyExpenses(new Date().getMonth(), new Date().getFullYear());
  const budgetStatus = getBudgetStatus();

  const now = new Date();
  
  // Últimas transacciones
  const recentTransactions = transactions
    // .filter((t) => !t.isVoided).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

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

  // Datos para gráfico de torta
  const pieData = categoryBreakdown.slice(0, 6).map((item, index) => ({
    name: getCategoryName(item.categoryId),
    value: item.amount,
    color: getCategoryColor(item.categoryId) || COLORS[index % COLORS.length]
  }));

  // Datos para gráfico de barras
  const barData = dailyExpenses.slice(-7).map((item) => ({
    date: format(new Date(item.date), 'dd/MM'),
    amount: item.amount
  }));

  return (
    <div className="space-y-6">
      {/* User header: show name and logout */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bienvenido</p>
          <h3 className="text-lg font-semibold">{user?.name || user?.username || 'Usuario'}</h3>
        </div>
      </div>
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Real</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(kpis.realBalance)}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Disponible
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Ahorro</p>
                <p className="text-2xl font-bold mt-1">{kpis.savingsRate.toFixed(1)}%</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={cn(
                    kpis.savingsRate >= 20 ? 'text-green-600' : 'text-yellow-600',
                    "flex items-center gap-1"
                  )}>
                    {kpis.savingsRate >= 20 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpis.savingsRate >= 20 ? 'Excelente' : 'Mejorable'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Días de Autonomía</p>
                <p className="text-2xl font-bold mt-1">{kpis.daysOfAutonomy}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={cn(
                    kpis.daysOfAutonomy >= 30 ? 'text-green-600' : kpis.daysOfAutonomy >= 15 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {kpis.daysOfAutonomy >= 30 ? 'Seguro' : kpis.daysOfAutonomy >= 15 ? 'Regular' : 'Crítico'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carga Financiera</p>
                <p className="text-2xl font-bold mt-1">{kpis.financialLoad.toFixed(1)}%</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className={cn(
                    kpis.financialLoad <= 20 ? 'text-green-600' : kpis.financialLoad <= 40 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {kpis.financialLoad <= 20 ? 'Saludable' : kpis.financialLoad <= 40 ? 'Atención' : 'Riesgo'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Ingresos y Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                <p className="text-xl font-semibold text-green-600">+{formatCurrency(kpis.totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos del Mes</p>
                <p className="text-xl font-semibold text-red-600">-{formatCurrency(kpis.totalExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={cn(
                  "text-xl font-semibold",
                  kpis.totalIncome - kpis.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {kpis.totalIncome - kpis.totalExpense >= 0 ? '+' : ''}
                  {formatCurrency(kpis.totalIncome - kpis.totalExpense)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Pagos de Tarjetas */}
      {creditCardPayments.length > 0 && creditCardPayments.some(p => p.amount > 0) && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Próximos Pagos de Tarjetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditCardPayments.filter(p => p.amount > 0).map((payment) => (
                <div key={payment.cardId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">{payment.cardName}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence: {format(payment.dueDate, 'dd/MM/yyyy')} ({differenceInDays(payment.dueDate, now)} días)
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Torta - Distribución de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Gastos Diarios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gastos Diarios (Últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Presupuestos */}
      {budgetStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Presupuestos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetStatus.map((status) => (
                <div key={status.budget.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{getCategoryName(status.budget.categoryId)}</span>
                    <div className="text-sm">
                      <span className={cn(
                        status.percentage >= 100 ? 'text-red-600' : status.percentage >= 80 ? 'text-yellow-600' : 'text-green-600',
                        "font-medium"
                      )}>
                        {formatCurrency(status.spent)}
                      </span>
                      <span className="text-muted-foreground"> / {formatCurrency(status.budget.amount)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(status.percentage, 100)} 
                    className={cn(
                      status.percentage >= 100 ? 'bg-red-100' : status.percentage >= 80 ? 'bg-yellow-100' : 'bg-green-100'
                    )}
                  />
                  {status.percentage >= 80 && (
                    <p className={cn(
                      "text-xs mt-1",
                      status.percentage >= 100 ? 'text-red-600' : 'text-yellow-600'
                    )}>
                      {status.percentage >= 100 
                        ? '¡Has excedido tu presupuesto!' 
                        : `Has gastado el ${status.percentage.toFixed(0)}% de tu presupuesto`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay transacciones recientes</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === 'income' ? 'bg-green-100' : 
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                    )}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : transaction.type === 'expense' ? (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <Wallet className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(transaction.categoryId)} • {getAccountName(transaction.fromAccountId)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      transaction.type === 'income' ? 'text-green-600' : 
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    )}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(transaction.date, 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
