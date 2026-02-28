import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name })
      });
      if (!res.ok) {
        const j = await res.json();
        return setError(j.error || 'Error');
      }
      window.location.href = '/login';
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm mx-auto">
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Nombre de usuario</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
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

      <Button type="submit">Registrar</Button>
    </form>
  );
}
