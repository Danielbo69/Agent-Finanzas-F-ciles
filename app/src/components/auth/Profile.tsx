import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (!token) return;
    fetch('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((j) => { setUser(j); setName(j?.name || ''); });
  }, []);

  const save = async () => {
    // Minimal; in real case add endpoint to update user
    alert('Guardar no implementado en este scaffold');
  };

  if (!user) return <div>Inicia sesión para ver tu perfil</div>;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <label className="text-sm">Email</label>
        <Input value={user.email} disabled />
      </div>
      <div>
        <label className="text-sm">Nombre</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={save}>Guardar</Button>
        <Button variant="ghost" onClick={() => { localStorage.removeItem('ff_token'); window.location.reload(); }}>Salir</Button>
      </div>
    </div>
  );
}
