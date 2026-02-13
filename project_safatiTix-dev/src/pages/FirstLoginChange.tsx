import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function FirstLoginChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { accessToken, signOut } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[A-Za-z]/.test(newPassword)) {
      setError('Password must be at least 8 characters with letters and numbers');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ newPassword })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Unable to change password');
      setSuccess('Password changed. Redirecting...');
      // reload profile
      const me = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (me.ok) {
        const mj = await me.json();
        await (window.localStorage.setItem('user', JSON.stringify(mj.user)), null);
      }
      setTimeout(() => navigate('/driver/dashboard'), 800);
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Change Temporary Password</h2>
        <p className="text-sm text-gray-600 mb-4">Use the temporary password provided by email. You must change it before accessing the dashboard.</p>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm password</label>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Change Password</button>
            <button type="button" onClick={() => { signOut(); navigate('/'); }} className="text-sm text-gray-500">Cancel & logout</button>
          </div>
        </form>
      </div>
    </div>
  );
}
