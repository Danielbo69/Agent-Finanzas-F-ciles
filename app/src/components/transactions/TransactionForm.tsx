import { useState } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  CreditCard
} from 'lucide-react';
import type { TransactionType } from '@/types';
import { format } from 'date-fns';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { accounts, categories, addTransaction } = useFinanceStore();
  

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    categoryId: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  
  const cashAndBankAccounts = accounts.filter((a) => a.type === 'cash' || a.type === 'bank');
  const creditCardAccounts = accounts.filter((a) => a.type === 'credit_card');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.fromAccountId) return;

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    let transactionData: {
      type: TransactionType;
      amount: number;
      fromAccountId: string;
      toAccountId?: string;
      categoryId: string;
      description: string;
      date: Date;
    };

    switch (activeTab) {
      case 'expense':
        transactionData = {
          type: 'expense',
          amount: Number(formData.amount),
          fromAccountId: formData.fromAccountId,
          categoryId: formData.categoryId || expenseCategories[0]?.id || '',
          description: formData.description || 'Gasto',
          date: dateTime
        };
        break;
      case 'income':
        transactionData = {
          type: 'income',
          amount: Number(formData.amount),
          fromAccountId: formData.fromAccountId,
          categoryId: formData.categoryId || incomeCategories[0]?.id || '',
          description: formData.description || 'Ingreso',
          date: dateTime
        };
        break;
      case 'transfer':
        transactionData = {
          type: 'transfer',
          amount: Number(formData.amount),
          fromAccountId: formData.fromAccountId,
          toAccountId: formData.toAccountId,
          categoryId: 'transfer',
          description: formData.description || 'Transferencia',
          date: dateTime
        };
        break;
      case 'credit_card_payment':
        transactionData = {
          type: 'credit_card_payment',
          amount: Number(formData.amount),
          fromAccountId: formData.fromAccountId,
          toAccountId: formData.toAccountId,
          categoryId: 'credit_payment',
          description: formData.description || 'Pago de tarjeta',
          date: dateTime
        };
        break;
      default:
        return;
    }

    addTransaction(transactionData);
    
    // Reset form
    setFormData({
      amount: '',
      fromAccountId: '',
      toAccountId: '',
      categoryId: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm')
    });
    
    onSuccess?.();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Gasto</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ingreso</span>
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Transferencia</span>
          </TabsTrigger>
          <TabsTrigger value="credit_card_payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pago TC</span>
          </TabsTrigger>
        </TabsList>

        {/* Monto */}
        <div className="space-y-2 mt-4">
          <Label>Monto</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              className="pl-8 text-2xl font-semibold"
              autoFocus
            />
          </div>
        </div>

        {/* Cuenta de Origen */}
        <div className="space-y-2">
          <Label>
            {activeTab === 'income' ? 'Cuenta de Destino' : 'Cuenta de Origen'}
          </Label>
          <Select 
            value={formData.fromAccountId} 
            onValueChange={(v) => setFormData({ ...formData, fromAccountId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {activeTab === 'expense' && (
                <>
                  <SelectItem value="__section_cash_debit" disabled>Gastos en efectivo o débito</SelectItem>
                  {cashAndBankAccounts.map((account) => (
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
                  <SelectItem value="__section_credit_card" disabled>Gastos con tarjeta de crédito</SelectItem>
                  {creditCardAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        {account.name} (Deuda: {formatCurrency(account.balance)})
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
              {activeTab === 'income' && cashAndBankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                    {account.name}
                  </div>
                </SelectItem>
              ))}
              {(activeTab === 'transfer' || activeTab === 'credit_card_payment') && cashAndBankAccounts.map((account) => (
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

        {/* Cuenta de Destino (para transferencias y pagos TC) */}
        {(activeTab === 'transfer' || activeTab === 'credit_card_payment') && (
          <div className="space-y-2">
            <Label>
              {activeTab === 'transfer' ? 'Cuenta de Destino' : 'Tarjeta a Pagar'}
            </Label>
            <Select 
              value={formData.toAccountId} 
              onValueChange={(v) => setFormData({ ...formData, toAccountId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {activeTab === 'transfer' ? (
                  cashAndBankAccounts
                    .filter((a) => a.id !== formData.fromAccountId)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  creditCardAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        {account.name} (Deuda: {formatCurrency(account.balance)})
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Categoría (solo para ingresos y gastos) */}
        {(activeTab === 'expense' || activeTab === 'income') && (
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
                {(activeTab === 'expense' ? expenseCategories : incomeCategories).map((category) => (
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
        )}

        {/* Descripción */}
        <div className="space-y-2">
          <Label>Descripción (opcional)</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={
              activeTab === 'expense' ? 'Ej: Supermercado Lider' :
              activeTab === 'income' ? 'Ej: Sueldo mensual' :
              activeTab === 'transfer' ? 'Ej: Ahorro mensual' :
              'Ej: Pago tarjeta febrero'
            }
            maxLength={140}
          />
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Hora</Label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={!formData.amount || !formData.fromAccountId}
        >
          {activeTab === 'expense' && <TrendingDown className="h-4 w-4 mr-2" />}
          {activeTab === 'income' && <TrendingUp className="h-4 w-4 mr-2" />}
          {activeTab === 'transfer' && <ArrowLeftRight className="h-4 w-4 mr-2" />}
          {activeTab === 'credit_card_payment' && <CreditCard className="h-4 w-4 mr-2" />}
          Guardar {activeTab === 'expense' ? 'Gasto' : activeTab === 'income' ? 'Ingreso' : activeTab === 'transfer' ? 'Transferencia' : 'Pago'}
        </Button>
      </Tabs>
    </form>
  );
}
