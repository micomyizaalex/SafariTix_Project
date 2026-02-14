import React from 'react';

type Props = {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
};

export default function SidebarTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => onChange(t)} className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${active===t ? 'bg-[#0077B6] text-white' : 'text-slate-700 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
