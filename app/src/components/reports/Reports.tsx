import { useState, useRef } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar,
  Wallet,
  Target,
  PieChart,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

export default function Reports() {
  const { 
    transactions, 
    accounts, 
    categories, 
    getMonthlyData, 
    getCategoryBreakdown, 
    getDailyExpenses,
    getKPIs
  } = useFinanceStore();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const reportRef = useRef<HTMLDivElement>(null);

  const monthlyData = getMonthlyData(selectedMonth, selectedYear);
  const categoryBreakdown = getCategoryBreakdown(selectedMonth, selectedYear);
  const dailyExpenses = getDailyExpenses(selectedMonth, selectedYear);
  const kpis = getKPIs();

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

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

  // Datos para gráficos
  const pieData = categoryBreakdown.slice(0, 8).map((item) => ({
    name: getCategoryName(item.categoryId),
    value: item.amount,
    color: getCategoryColor(item.categoryId)
  }));

  const barData = dailyExpenses.map((item) => ({
    date: format(new Date(item.date), 'dd'),
    amount: item.amount
  }));

  // Transacciones del mes filtrado
  const monthTransactions = transactions
    .filter((t) => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return tMonth === selectedMonth && tYear === selectedYear && !t.isVoided;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Crear datos para Excel
    const data = monthTransactions.map((t) => ({
      Fecha: format(t.date, 'dd/MM/yyyy'),
      Tipo: t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : t.type === 'transfer' ? 'Transferencia' : 'Pago TC',
      Categoría: getCategoryName(t.categoryId),
      Descripción: t.description,
      Monto: t.amount,
      Cuenta: getAccountName(t.fromAccountId),
      'Cuenta Destino': t.toAccountId ? getAccountName(t.toAccountId) : ''
    }));

    // Convertir a CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => `"${String((row as Record<string, unknown>)[h])}"`).join(','))
    ].join('\n');

    // Descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finanzas-${months[selectedMonth]}-${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={handlePrint}>
                <FileText className="h-4 w-4 mr-2" />
                Imprimir / PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporte */}
      <div ref={reportRef} className="space-y-6">
        {/* Encabezado del Reporte */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-primary">Finanzas Fáciles</h1>
          <p className="text-xl font-semibold mt-2">Reporte Mensual</p>
          <p className="text-muted-foreground">
            {months[selectedMonth]} {selectedYear}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Generado el {format(new Date(), 'dd/MM/yyyy')}
          </p>
        </div>

        {/* Resumen Ejecutivo */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Resumen Ejecutivo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-xl font-bold text-green-600">+{formatCurrency(monthlyData.income)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(monthlyData.expense)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={cn(
                  "text-xl font-bold",
                  monthlyData.income - monthlyData.expense >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {monthlyData.income - monthlyData.expense >= 0 ? '+' : ''}
                  {formatCurrency(monthlyData.income - monthlyData.expense)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Tasa de Ahorro</p>
                <p className="text-xl font-bold text-primary">
                  {monthlyData.income > 0 
                    ? (((monthlyData.income - monthlyData.expense) / monthlyData.income) * 100).toFixed(1) 
                    : 0}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* KPIs */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores Financieros
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Saldo Real</p>
                <p className="text-lg font-bold">{formatCurrency(kpis.realBalance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Días de Autonomía</p>
                <p className="text-lg font-bold">{kpis.daysOfAutonomy} días</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Carga Financiera</p>
                <p className={cn(
                  "text-lg font-bold",
                  kpis.financialLoad <= 20 ? 'text-green-600' : kpis.financialLoad <= 40 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {kpis.financialLoad.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Deuda Total TC</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(kpis.totalDebt)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
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
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gastos Diarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle de Transacciones */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalle de Transacciones
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Fecha</th>
                      <th className="text-left p-3 text-sm font-medium">Tipo</th>
                      <th className="text-left p-3 text-sm font-medium">Categoría</th>
                      <th className="text-left p-3 text-sm font-medium">Descripción</th>
                      <th className="text-left p-3 text-sm font-medium">Cuenta</th>
                      <th className="text-right p-3 text-sm font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          No hay transacciones en este período
                        </td>
                      </tr>
                    ) : (
                      monthTransactions.map((t) => (
                        <tr key={t.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{format(t.date, 'dd/MM/yyyy')}</td>
                          <td className="p-3 text-sm">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              t.type === 'income' ? 'bg-green-100 text-green-700' :
                              t.type === 'expense' ? 'bg-red-100 text-red-700' :
                              t.type === 'credit_card_payment' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            )}>
                              {t.type === 'income' ? 'Ingreso' :
                               t.type === 'expense' ? 'Gasto' :
                               t.type === 'credit_card_payment' ? 'Pago TC' :
                               'Transferencia'}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{getCategoryName(t.categoryId)}</td>
                          <td className="p-3 text-sm">{t.description || '-'}</td>
                          <td className="p-3 text-sm">{getAccountName(t.fromAccountId)}</td>
                          <td className={cn(
                            "p-3 text-sm text-right font-medium",
                            t.type === 'income' ? 'text-green-600' :
                            t.type === 'expense' ? 'text-red-600' :
                            t.type === 'credit_card_payment' ? 'text-orange-600' : 'text-blue-600'
                          )}>
                            {t.type === 'income' ? '+' : t.type === 'expense' || t.type === 'credit_card_payment' ? '-' : ''}
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pie de página */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-8">
          <p>Finanzas Fáciles - Reporte generado automáticamente</p>
          <p>Este documento es solo para fines informativos.</p>
        </div>
      </div>
    </div>
  );
}
