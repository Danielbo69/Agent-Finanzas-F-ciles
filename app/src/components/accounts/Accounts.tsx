import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  CreditCard, 
  Landmark, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import type { AccountType } from '@/types';
import { cn } from '@/lib/utils';

const ACCOUNT_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#84cc16'
];

const ACCOUNT_ICONS: { [key: string]: React.ElementType } = {
  wallet: Wallet,
  'credit-card': CreditCard,
  bank: Landmark,
  'piggy-bank': TrendingUp,
  coins: TrendingDown,
  banknote: Wallet,
  landmark: Landmark,
  'circle-dollar-sign': TrendingUp,
  'trending-up': TrendingUp,
  shield: AlertCircle
};

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, getKPIs } = useFinanceStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as AccountType,
    balance: 0,
    creditLimit: 0,
    closingDay: 25,
    dueDay: 10,
    color: ACCOUNT_COLORS[0],
    icon: 'wallet'
  });

  const kpis = getKPIs();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAccountIcon = (iconName: string) => {
    const Icon = ACCOUNT_ICONS[iconName] || Wallet;
    return Icon;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingAccount) {
      updateAccount(editingAccount, {
        ...formData,
        balance: Number(formData.balance)
      });
      setEditingAccount(null);
    } else {
      addAccount({
        userId: 'demo-user',
        ...formData,
        balance: Number(formData.balance)
      });
    }
    
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      type: 'cash',
      balance: 0,
      creditLimit: 0,
      closingDay: 25,
      dueDay: 10,
      color: ACCOUNT_COLORS[0],
      icon: 'wallet'
    });
  };

  const handleEdit = (account: typeof accounts[0]) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      creditLimit: account.creditLimit || 0,
      closingDay: account.closingDay || 25,
      dueDay: account.dueDay || 10,
      color: account.color,
      icon: account.icon
    });
    setEditingAccount(account.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
      deleteAccount(id);
    }
  };

  const cashAndBankAccounts = accounts.filter(a => a.type === 'cash' || a.type === 'bank');
  const creditCardAccounts = accounts.filter(a => a.type === 'credit_card');

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dinero Disponible</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis.liquidBalance)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deuda Total TC</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(kpis.totalDebt)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Real</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(kpis.realBalance)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuentas de Débito y Efectivo */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cuentas de Débito y Efectivo</h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAccount(null);
                setFormData({
                  name: '',
                  type: 'cash',
                  balance: 0,
                  creditLimit: 0,
                  closingDay: 25,
                  dueDay: 10,
                  color: ACCOUNT_COLORS[0],
                  icon: 'wallet'
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cuenta Corriente"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Cuenta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="bank">Cuenta Bancaria</SelectItem>
                      <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {formData.type === 'credit_card' ? 'Deuda Actual' : 'Saldo Inicial'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                  />
                </div>

                {formData.type === 'credit_card' && (
                  <>
                    <div className="space-y-2">
                      <Label>Límite de Crédito</Label>
                      <Input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Día de Cierre</Label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={formData.closingDay}
                          onChange={(e) => setFormData({ ...formData, closingDay: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Día de Pago</Label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={formData.dueDay}
                          onChange={(e) => setFormData({ ...formData, dueDay: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_COLORS.map((color) => (
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
                  {editingAccount ? 'Guardar Cambios' : 'Crear Cuenta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashAndBankAccounts.map((account) => {
            const Icon = getAccountIcon(account.icon);
            return (
              <Card key={account.id} className="group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: account.color }} />
                      </div>
                      <div>
                        <p className="font-semibold">{account.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.type === 'cash' ? 'Efectivo' : 'Cuenta Bancaria'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tarjetas de Crédito */}
      {creditCardAccounts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Tarjetas de Crédito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCardAccounts.map((account) => {
              const Icon = getAccountIcon(account.icon);
              const utilization = account.creditLimit 
                ? (account.balance / account.creditLimit) * 100 
                : 0;
              
              return (
                <Card key={account.id} className="group border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${account.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: account.color }} />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cierre: {account.closingDay} • Pago: {account.dueDay}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Deuda actual</span>
                        <span className="text-xl font-bold text-orange-600">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                      
                      {account.creditLimit && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Límite</span>
                            <span>{formatCurrency(account.creditLimit)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full transition-all",
                                utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              )}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {utilization.toFixed(1)}% utilizado
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
