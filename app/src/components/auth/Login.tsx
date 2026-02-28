import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // If using react-router; otherwise adjust
  // const navigate = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm mx-auto">
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="text-sm">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Contraseña</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex justify-between items-center">
        <Button type="submit">Entrar</Button>
        <a href="/forgot-password" className="text-sm text-muted-foreground">Olvidé mi contraseña</a>
      </div>
    </form>
  );
}
