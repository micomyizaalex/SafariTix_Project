import React, { useState } from 'react';

function Toggle({ label, checked, onChange }:{ label:string; checked:boolean; onChange:(v:boolean)=>void }){
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <div className="font-semibold">{label}</div>
      </div>
      <div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} className="sr-only" />
          <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#27AE60]' : 'bg-gray-200'}`}></div>
          <div className={`dot absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </label>
      </div>
    </div>
  );
}

export default function NotificationsSettings(){
  const [confirmations, setConfirmations] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [promos, setPromos] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-3">
        <Toggle label="Booking confirmations" checked={confirmations} onChange={setConfirmations} />
        <Toggle label="Bus departure reminders" checked={reminders} onChange={setReminders} />
        <Toggle label="Promotions" checked={promos} onChange={setPromos} />
      </div>
      <div className="mt-4 text-sm text-slate-500">These settings are stored locally in the UI for now.</div>
    </div>
  );
}
