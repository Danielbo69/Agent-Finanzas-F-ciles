import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    await fetch('http://localhost:4000/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
    });
    setSent(true);
  };

  return (
    <div className="max-w-sm mx-auto">
      {sent ? (
        <p className="text-sm">Si existe una cuenta, recibirás un correo con instrucciones.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit">Enviar instrucciones</Button>
        </form>
      )}
    </div>
  );
}
