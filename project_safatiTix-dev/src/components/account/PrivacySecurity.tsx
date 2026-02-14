import React, { useState } from 'react';

export default function PrivacySecurity(){
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twofa, setTwofa] = useState(false);

  const changePassword = async ()=>{
    setError(null);
    if (!current || !pw || pw!==pw2) return setError('Please fill fields and ensure new passwords match');
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: pw }) });
      if (!res.ok) throw new Error(await res.text());
      alert('Password changed'); setCurrent(''); setPw(''); setPw2('');
    } catch (err:any) { setError(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Change password</h3>
        <div className="space-y-2">
          <input value={current} onChange={e=>setCurrent(e.target.value)} placeholder="Current password" type="password" className="w-full px-3 py-2 border rounded" />
          <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="New password" type="password" className="w-full px-3 py-2 border rounded" />
          <input value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Confirm new password" type="password" className="w-full px-3 py-2 border rounded" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button disabled={saving} onClick={changePassword} className="bg-[#0077B6] text-white px-4 py-2 rounded-lg">{saving ? 'Saving…' : 'Change Password'}</button>
            <button onClick={()=>{ setCurrent(''); setPw(''); setPw2(''); }} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Two-factor authentication (2FA)</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Enable 2FA</div>
            <div className="text-sm text-slate-500">UI only for now; backend integration needed to enable real 2FA.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={twofa} onChange={(e)=>setTwofa(e.target.checked)} className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors ${twofa ? 'bg-[#27AE60]' : 'bg-gray-200'}`}></div>
            <div className={`dot absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition ${twofa ? 'translate-x-5' : 'translate-x-0'}`} />
          </label>
        </div>
      </div>
    </div>
  );
}
