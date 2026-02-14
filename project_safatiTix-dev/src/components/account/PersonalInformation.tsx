import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';

export default function PersonalInformation() {
  const { user, accessToken, signIn } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    setForm({ name: user?.name || '', email: user?.email || '', phone: (user as any)?.phone || '' });
  }, [user]);

  const validate = () => {
    if (!form.name.trim()) return 'Enter full name';
    if (!form.email.includes('@')) return 'Enter valid email';
    if (form.phone && form.phone.replace(/\D/g,'').length < 8) return 'Enter valid phone';
    return null;
  };

  const save = async ()=>{
    const v = validate(); if (v) return setError(v);
    setSaving(true); setError(null);
    try {
      const hdrs: Record<string,string> = { 'Content-Type':'application/json' };
      if (accessToken) hdrs['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch('/api/auth/me', { method: 'PUT', headers: hdrs, body: JSON.stringify({ full_name: form.name, email: form.email, phone_number: form.phone }) });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const updated = json.user || json;
      if (signIn) await signIn(accessToken || '', updated);
      setEditing(false);
    } catch (err:any) {
      setError(err.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-slate-500">Full name</div>
            <div className="font-semibold text-slate-900">{user?.name || '—'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-slate-500">Email</div>
            <div className="font-semibold text-slate-900">{user?.email || '—'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-slate-500">Phone</div>
            <div className="font-semibold text-slate-900">{(user as any)?.phone || '—'}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setEditing(true)} className="bg-[#0077B6] text-white px-4 py-2 rounded-lg font-semibold">Edit</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.phone} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button disabled={saving} onClick={save} className="bg-[#0077B6] text-white px-4 py-2 rounded-lg font-semibold">{saving ? 'Saving…' : 'Save Changes'}</button>
            <button onClick={()=>{ setEditing(false); setForm({ name: user?.name||'', email: user?.email||'', phone: (user as any)?.phone||'' }); setError(null); }} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
