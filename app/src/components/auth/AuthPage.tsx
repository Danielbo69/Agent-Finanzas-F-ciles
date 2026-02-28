import AuthCard from './Login';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Illustration / marketing column (hidden on small screens) */}
          <div className="hidden lg:flex flex-col items-start justify-center gap-6">
            <h2 className="text-4xl font-extrabold text-foreground">Controla tu dinero con facilidad</h2>
            <p className="text-lg text-muted-foreground max-w-md">Panel ligero para seguimiento de cuentas, presupuestos y metas. Comienza en segundos.</p>
            <div aria-hidden className="w-full max-w-sm h-56 rounded-lg bg-gradient-to-r from-primary/20 to-accent/10 shadow-md" />
          </div>

          {/* Auth card column */}
          <div className="flex items-center justify-center">
            <AuthCard />
          </div>
        </div>
      </div>
    </div>
  );
}
