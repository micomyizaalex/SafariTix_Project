import React, { useState } from 'react';
import SidebarTabs from '../../components/account/SidebarTabs';
import PersonalInformation from '../../components/account/PersonalInformation';
import PaymentMethods from '../../components/account/PaymentMethods';
import NotificationsSettings from '../../components/account/NotificationsSettings';
import PrivacySecurity from '../../components/account/PrivacySecurity';
import { useAuth } from '../../components/AuthContext';

const TABS = ['Personal Information', 'Payment Methods', 'Notifications', 'Privacy & Security'] as const;
type Tab = (typeof TABS)[number];

export default function AccountSettings() {
  const [active, setActive] = useState<Tab>('Personal Information');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SidebarTabs tabs={TABS as string[]} active={active} onChange={(t)=>setActive(t as Tab)} />
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
              <p className="text-sm text-slate-500">Manage your personal information, payment methods, notifications and privacy.</p>
            </div>

            <div>
              {active === 'Personal Information' && <PersonalInformation />}
              {active === 'Payment Methods' && <PaymentMethods />}
              {active === 'Notifications' && <NotificationsSettings />}
              {active === 'Privacy & Security' && <PrivacySecurity />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
