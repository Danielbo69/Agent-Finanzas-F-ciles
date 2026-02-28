import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/store/financeStore';

export default function Profile() {
  const store = useFinanceStore();
  const { user, updateUser, logout } = store;

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setAddress((user as any).address || '');
      return;
    }

    const token = localStorage.getItem('ff_token');
    if (!token) return;
    fetch('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) return;
        const j = await r.json();
        setName(j.name || '');
        setUsername(j.username || '');
        setEmail(j.email || '');
      })
      .catch(() => {});
  }, [user]);

  const save = async () => {
    setLoading(true);
    const token = localStorage.getItem('ff_token');
    if (!token) {
      alert('No autenticado');
      setLoading(false);
      return;
    }

    const payload: any = { email, phone, address };
    try {
      const res = await fetch('http://localhost:4000/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'No se pudo actualizar en el servidor');
      } else {
        const updated = await res.json().catch(() => null);
        if (updated) {
          setEmail(updated.email || email);
          setName(updated.name || name);
          setUsername(updated.username || username);
          updateUser(updated as any);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al guardar');
    }

    // Update local-only fields as well
    updateUser({ name, username, email, phone, address } as any);
    setLoading(false);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEmail(user?.email || '');
    setPhone((user as any)?.phone || '');
    setAddress((user as any)?.address || '');
    setEditing(false);
  };

//   const doLogout = () => {
//     try { logout(); } catch (e) { /* ignore */ }
//     try { window.location.reload(); } catch (e) { /* ignore */ }
//   };

  return (
    <div className="max-w-3xl mx-auto bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-extrabold text-3xl shadow-md ring-2 ring-primary/20">
          {(name || username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{name || username || 'Tu perfil'}</h2>
          <p className="text-sm text-muted-foreground">Información de la cuenta</p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Editar</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={cancelEdit}>Cancelar</Button>
              <Button onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
            </>
          )}
          {/* <Button variant="ghost" onClick={doLogout}>Cerrar sesión</Button> */}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Nombre completo</label>
          <Input value={name} disabled />
        </div>
        <div>
          <label className="text-sm">Usuario</label>
          <Input value={username} disabled />
        </div>

        <div>
          <label className="text-sm">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
        </div>
        <div>
          <label className="text-sm">Teléfono</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Dirección</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} disabled={!editing} />
        </div>
      </div>
    </div>
  );
}
