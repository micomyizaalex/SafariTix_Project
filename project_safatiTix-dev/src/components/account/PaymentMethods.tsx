import React, { useState } from 'react';

type Card = { id: string; brand: string; last4: string; exp: string };

const mock: Card[] = [
  { id: 'c_1', brand: 'Visa', last4: '4242', exp: '12/26' },
  { id: 'c_2', brand: 'Mastercard', last4: '5555', exp: '08/25' },
];

export default function PaymentMethods(){
  const [cards, setCards] = useState<Card[]>(mock);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', exp: '', cvc: '' });

  const add = ()=>{
    // simple validation
    if (form.number.replace(/\s+/g,'').length < 12) return alert('Enter valid card number');
    const last4 = form.number.replace(/\D/g,'').slice(-4);
    const brand = form.number.startsWith('4') ? 'Visa' : 'Card';
    const newCard = { id: `c_${Date.now()}`, brand, last4, exp: form.exp || '—' };
    setCards(c=>[...c,newCard]);
    setForm({ number:'', name:'', exp:'', cvc:'' });
    setAdding(false);
  };

  const remove = (id: string)=>{
    if (!confirm('Remove card?')) return;
    setCards(c=>c.filter(x=>x.id!==id));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
      <div className="space-y-3">
        {cards.map(c=> (
          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-semibold">{c.brand} •••• {c.last4}</div>
              <div className="text-sm text-slate-500">Exp {c.exp}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>remove(c.id)} className="text-red-600 px-3 py-1 rounded bg-red-50">Delete</button>
            </div>
          </div>
        ))}

        {!adding ? (
          <button onClick={()=>setAdding(true)} className="bg-[#0077B6] text-white px-4 py-2 rounded-lg">Add Card</button>
        ) : (
          <div className="space-y-2 p-3 border rounded-lg">
            <input placeholder="Card number" value={form.number} onChange={(e)=>setForm(f=>({...f, number:e.target.value}))} className="w-full px-3 py-2 border rounded" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Name on card" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} className="px-3 py-2 border rounded" />
              <input placeholder="MM/YY" value={form.exp} onChange={(e)=>setForm(f=>({...f, exp:e.target.value}))} className="px-3 py-2 border rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={add} className="bg-[#0077B6] text-white px-4 py-2 rounded-lg">Save Card</button>
              <button onClick={()=>setAdding(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
