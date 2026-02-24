import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  TrendingDown,
  PieChart,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Budgets() {
  const { categories, budgets, addBudget, updateBudget, deleteBudget, getBudgetStatus } = useFinanceStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly',
    alertThreshold: 80
  });

  const budgetStatus = getBudgetStatus();
  const expenseCategories = categories.filter((c) => c.type === 'expense');

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

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.icon || '📦';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  const handleSubmit = () => {
    if (!formData.categoryId || !formData.amount) return;

    if (editingBudget) {
      updateBudget(editingBudget, {
        amount: Number(formData.amount),
        alertThreshold: formData.alertThreshold
      });
      setEditingBudget(null);
    } else {
      addBudget({
        userId: 'demo-user',
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        period: formData.period,
        alertThreshold: formData.alertThreshold
      });
    }

    setIsAddDialogOpen(false);
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      alertThreshold: 80
    });
  };

  const handleEdit = (budget: typeof budgets[0]) => {
    setFormData({
      categoryId: budget.categoryId,
      amount: String(budget.amount),
      period: budget.period,
      alertThreshold: budget.alertThreshold
    });
    setEditingBudget(budget.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
      deleteBudget(id);
    }
  };

  // Calcular totales
  const totalBudgeted = budgetStatus.reduce((sum, b) => sum + b.budget.amount, 0);
  const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastado</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponible</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(totalRemaining)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progreso General</p>
                <p className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                overallPercentage >= 100 ? 'bg-red-100' : overallPercentage >= 80 ? 'bg-yellow-100' : 'bg-green-100'
              )}>
                <AlertCircle className={cn(
                  "h-6 w-6",
                  overallPercentage >= 100 ? 'text-red-600' : overallPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progreso General */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Progreso General del Presupuesto</span>
              <span className={cn(
                "font-semibold",
                overallPercentage >= 100 ? 'text-red-600' : overallPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {overallPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={cn(
                  "h-4 rounded-full transition-all",
                  overallPercentage >= 100 ? 'bg-red-500' : overallPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {overallPercentage >= 100 
                ? 'Has excedido tu presupuesto total' 
                : overallPercentage >= 80 
                  ? 'Estás cerca de alcanzar tu presupuesto' 
                  : 'Vas bien con tu presupuesto'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Presupuestos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Presupuestos por Categoría</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingBudget(null);
                setFormData({
                  categoryId: '',
                  amount: '',
                  period: 'monthly',
                  alertThreshold: 80
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monto del Presupuesto</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(v: 'monthly' | 'weekly') => setFormData({ ...formData, period: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Umbral de Alerta (%)</Label>
                  <Input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Te avisaremos cuando alcances este porcentaje del presupuesto
                  </p>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingBudget ? 'Guardar Cambios' : 'Crear Presupuesto'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatus.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes presupuestos configurados</p>
                <p className="text-sm text-muted-foreground">Crea tu primer presupuesto para comenzar a controlar tus gastos</p>
              </CardContent>
            </Card>
          ) : (
            budgetStatus.map((status) => {
              const isOverBudget = status.percentage >= 100;
              
              return (
                <Card key={status.budget.id} className={cn(
                  "group transition-colors",
                  isOverBudget && "border-red-200 bg-red-50/30"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${getCategoryColor(status.budget.categoryId)}20` }}
                        >
                          {getCategoryIcon(status.budget.categoryId)}
                        </div>
                        <div>
                          <p className="font-semibold">{getCategoryName(status.budget.categoryId)}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {status.budget.period === 'monthly' ? 'Mensual' : 'Semanal'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(status.budget)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(status.budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Gastado</p>
                          <p className={cn(
                            "text-lg font-semibold",
                            isOverBudget ? 'text-red-600' : 'text-foreground'
                          )}>
                            {formatCurrency(status.spent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Presupuesto</p>
                          <p className="text-lg font-semibold">{formatCurrency(status.budget.amount)}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn(
                            status.percentage >= 100 ? 'text-red-600' : status.percentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                          )}>
                            {status.percentage.toFixed(0)}%
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(status.remaining)} disponible
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all",
                              status.percentage >= 100 ? 'bg-red-500' : status.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            )}
                            style={{ width: `${Math.min(status.percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {status.percentage >= status.budget.alertThreshold && (
                        <div className={cn(
                          "flex items-center gap-2 text-sm p-2 rounded-lg",
                          status.percentage >= 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            {status.percentage >= 100 
                              ? 'Has excedido tu presupuesto' 
                              : `Has gastado el ${status.percentage.toFixed(0)}% de tu presupuesto`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
