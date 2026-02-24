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
  Target,
  TrendingUp,
  Wallet,
  Plane,
  Car,
  Home,
  GraduationCap,
  Heart,
  Gift,
  Briefcase,
  Smartphone
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const GOAL_ICONS: { [key: string]: React.ElementType } = {
  plane: Plane,
  car: Car,
  home: Home,
  graduation: GraduationCap,
  heart: Heart,
  gift: Gift,
  briefcase: Briefcase,
  smartphone: Smartphone,
  target: Target,
  wallet: Wallet
};

const GOAL_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#84cc16'
];

export default function Goals() {
  const { accounts, goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinanceStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    color: GOAL_COLORS[0],
    icon: 'target'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGoalIcon = (iconName: string) => {
    const Icon = GOAL_ICONS[iconName] || Target;
    return Icon;
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.targetAmount) return;

    if (editingGoal) {
      updateGoal(editingGoal, {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        color: formData.color,
        icon: formData.icon
      });
      setEditingGoal(null);
    } else {
      addGoal({
        userId: 'demo-user',
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: 0,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        color: formData.color,
        icon: formData.icon
      });
    }

    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      color: GOAL_COLORS[0],
      icon: 'target'
    });
  };

  const handleEdit = (goal: typeof goals[0]) => {
    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      targetDate: goal.targetDate ? format(goal.targetDate, 'yyyy-MM-dd') : '',
      color: goal.color,
      icon: goal.icon
    });
    setEditingGoal(goal.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta meta?')) {
      deleteGoal(id);
    }
  };

  const handleContribute = () => {
    if (!selectedGoal || !contributeAmount || !selectedAccount) return;

    contributeToGoal(selectedGoal, Number(contributeAmount), selectedAccount);
    
    setIsContributeDialogOpen(false);
    setContributeAmount('');
    setSelectedAccount('');
    setSelectedGoal(null);
  };

  const openContributeDialog = (goalId: string) => {
    setSelectedGoal(goalId);
    setIsContributeDialogOpen(true);
  };

  // Calcular totales
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ahorrado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progreso General</p>
                <p className="text-2xl font-bold">
                  {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mis Metas de Ahorro</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingGoal(null);
                setFormData({
                  name: '',
                  targetAmount: '',
                  targetDate: '',
                  color: GOAL_COLORS[0],
                  icon: 'target'
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre de la Meta</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Viaje a Europa"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Monto Objetivo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha Objetivo (opcional)</Label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icono</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(GOAL_ICONS).map((icon) => {
                      const Icon = GOAL_ICONS[icon];
                      return (
                        <button
                          key={icon}
                          onClick={() => setFormData({ ...formData, icon })}
                          className={cn(
                            "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                            formData.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-200'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes metas de ahorro</p>
                <p className="text-sm text-muted-foreground">Crea tu primera meta para comenzar a ahorrar</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const Icon = getGoalIcon(goal.icon);
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = goal.targetDate ? differenceInDays(goal.targetDate, new Date()) : null;
              const monthlyNeeded = goal.targetDate && daysLeft && daysLeft > 0
                ? (goal.targetAmount - goal.currentAmount) / (daysLeft / 30)
                : null;

              return (
                <Card key={goal.id} className="group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: goal.color }} />
                        </div>
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          {goal.targetDate && (
                            <p className="text-sm text-muted-foreground">
                              Meta: {format(goal.targetDate, 'dd/MM/yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Ahorrado</p>
                          <p className="text-xl font-bold" style={{ color: goal.color }}>
                            {formatCurrency(goal.currentAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Meta</p>
                          <p className="text-lg font-semibold">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(goal.targetAmount - goal.currentAmount)} restante
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: goal.color
                            }}
                          />
                        </div>
                      </div>

                      {daysLeft !== null && daysLeft > 0 && monthlyNeeded !== null && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                          <p>Necesitas ahorrar <strong>{formatCurrency(monthlyNeeded)}/mes</strong></p>
                          <p>para alcanzar tu meta en {daysLeft} días</p>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => openContributeDialog(goal.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Aportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog de Aporte */}
      <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aportar a la Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Aportar</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cuenta de Origen</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.type === 'cash' || a.type === 'bank')
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name} ({formatCurrency(account.balance)})
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleContribute} 
              className="w-full"
              disabled={!contributeAmount || !selectedAccount}
            >
              Confirmar Aporte
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
