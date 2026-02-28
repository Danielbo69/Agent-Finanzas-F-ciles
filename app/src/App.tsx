/* eslint-disable react-hooks/static-components */
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  Target,
  FileText,
  Plus,
  Menu,
  Bell,
  User,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFinanceStore } from '@/store/financeStore';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AuthPage from './components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import Profile from './components/auth/Profile';
import Accounts from '@/components/accounts/Accounts';
import Transactions from '@/components/transactions/Transactions';
import Budgets from '@/components/budgets/Budgets';
import Goals from '@/components/goals/Goals';
import Reports from '@/components/reports/Reports';
import TransactionForm from '@/components/transactions/TransactionForm';
import './App.css';

type ViewType = 'login' | 'register' | 'forgot' | 'dashboard' | 'accounts' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'profile';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useFinanceStore();
  const { isAuthenticated } = useFinanceStore();

  // On mount, if we have a token try to fetch profile and populate store
  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (!token) return;
    if (isAuthenticated && user) return;
    fetch('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) return;
        const j = await r.json();
        // populate zustand store directly
        try { useFinanceStore.setState({ user: j, isAuthenticated: true }); } catch (e) { /* ignore */ }
      })
      .catch(() => { });
  }, [isAuthenticated, user]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigationItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as ViewType, label: 'Cuentas', icon: Wallet },
    { id: 'transactions' as ViewType, label: 'Transacciones', icon: Receipt },
    { id: 'budgets' as ViewType, label: 'Presupuestos', icon: PieChart },
    { id: 'goals' as ViewType, label: 'Metas', icon: Target },
    { id: 'reports' as ViewType, label: 'Reportes', icon: FileText },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'forgot':
        return <ForgotPassword />;
      case 'accounts':
        return <Accounts />;
      case 'transactions':
        return <Transactions />;
      case 'budgets':
        return <Budgets />;
      case 'goals':
        return <Goals />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Finanzas Fáciles
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        {/* <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div> */}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-1"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex-1"
            onClick={() => { logout(); try { window.location.reload(); } catch (e) { /* ignore */ } }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const isLoggedIn = isAuthenticated || !!localStorage.getItem('ff_token');

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:border-r lg:bg-card">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <NavContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-primary flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Finanzas Fáciles
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {navigationItems.find((item) => item.id === currentView)?.label}
              </h2>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button> */}
              <Button variant="outline" size="icon" onClick={() => setCurrentView('profile')}>
                <User className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsAddTransactionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Movimiento
              </Button>
            </div>
          </div>

          {/* Mobile Add Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-30">
            <Button
              size="lg"
              className="rounded-full shadow-lg"
              onClick={() => {
                setIsAddTransactionOpen(!isAddTransactionOpen);
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* View Content */}
          {renderView()}
        </div>
      </main>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
          </DialogHeader>
          <TransactionForm onSuccess={() => setIsAddTransactionOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
