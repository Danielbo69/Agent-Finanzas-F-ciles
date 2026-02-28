import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ForgotPassword from './ForgotPassword';
// react-router not required here; navigation handled via reload

export default function AuthCard() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // If using react-router; otherwise adjust
  // const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  
  // ForgotPassword component imported above

  const submitLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error || 'Login failed');
      // store token
      localStorage.setItem('ff_token', json.token);
      // navigate('/');
      window.location.reload();
    } catch (err) {
      setError('Network error');
    }
  };

  const submitRegister = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, name })
      });
      if (!res.ok) {
        const j = await res.json();
        return setError(j.error || 'Error');
      }
      // after register, switch to login
      setMode('login');
      setPassword('');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="bg-card border rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-2">FF</div>
          <h1 className="text-2xl font-bold">Finanzas Fáciles</h1>
          <p className="text-sm text-muted-foreground">Administra tus finanzas de forma simple</p>
        </div>

        <div className="flex gap-2 mb-4 justify-center">
          <button
            className={`px-4 py-2 rounded-md ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            className={`px-4 py-2 rounded-md ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={submitLogin} className="space-y-4">
            <div>
                <label className="text-sm">Usuario</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit">Entrar</Button>
              <button type="button" className="text-sm text-muted-foreground" onClick={() => setMode('forgot')}>Olvidé mi contraseña</button>
            </div>
          </form>
        ) : mode === 'register' ? (
          <form onSubmit={submitRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Nombre de usuario</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Nombre completo</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Contraseña</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button type="submit">Crear cuenta</Button>
            </div>
          </form>
        ) : (
          <div>
            <ForgotPassword />
            <div className="mt-4 text-center">
              <button className="text-sm text-muted-foreground" onClick={() => setMode('login')}>Volver</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
