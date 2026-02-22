// commuter-dashboard/components/ProfileTab.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Bell, Settings, LogOut, ChevronRight, Star, Download, Shield, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { updateProfile } from '../../../services/user';

export default function ProfileTab() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    setSuccessMessage(null);
    
    try {
      const updatedUser = await updateProfile({ 
        name: profileForm.name, 
        email: profileForm.email, 
        phone: profileForm.phone 
      }) as any;
      
      // Update the auth store with new user data
      updateUser(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setEditingProfile(false);
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const settingsItems = [
    { label: 'Personal Information', icon: User, path: '/dashboard/account/personal' },
    { label: 'Payment Methods', icon: CreditCard, path: '/dashboard/account/payments' },
    { label: 'Notifications', icon: Bell, path: '/dashboard/account/notifications' },
    { label: 'Privacy & Security', icon: Shield, path: '/dashboard/account/privacy' },
    { label: 'Download Data', icon: Download, path: '/dashboard/account/download' },
  ];

  const rewardsPoints = user?.rewardsPoints || 1250;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>

      {/* Profile Card */}
      {!editingProfile ? (
        <div className="bg-gradient-to-br from-[#0077B6] to-[#005F8E] rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold mb-2">{user?.name || 'John Doe'}</h3>
              <p className="text-white/80 mb-1">{user?.email || 'john.doe@example.com'}</p>
              <p className="text-white/80">{user?.phone || '+250 788 123 456'}</p>
            </div>
            <button 
              onClick={() => setEditingProfile(true)} 
              className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Edit Personal Information</h3>
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}
          
          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {profileError}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
              <input 
                value={profileForm.name} 
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0077B6] focus:outline-none" 
                disabled={profileSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                type="email"
                value={profileForm.email} 
                onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0077B6] focus:outline-none" 
                disabled={profileSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0077B6] focus:outline-none" 
                disabled={profileSaving}
              />
            </div>
            
            <div className="flex gap-3 mt-2">
              <button 
                onClick={handleSaveProfile} 
                disabled={profileSaving} 
                className="flex items-center gap-2 bg-[#0077B6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005F8E] disabled:opacity-50 transition-all"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button 
                onClick={() => { 
                  setEditingProfile(false); 
                  setProfileError(null); 
                  setSuccessMessage(null);
                  setProfileForm({ 
                    name: user?.name || '', 
                    email: user?.email || '', 
                    phone: user?.phone || '' 
                  }); 
                }} 
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                disabled={profileSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0077B6]" />
            Account Settings
          </h3>
          
          <div className="space-y-3">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0077B6] hover:shadow-md transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0077B6]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0077B6] group-hover:text-white transition-all">
                      <Icon className="w-5 h-5 text-[#0077B6] group-hover:text-white transition-all" />
                    </div>
                    <span className="font-semibold text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0077B6] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#0077B6]" />
            Rewards & Benefits
          </h3>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 mb-4 border border-yellow-200">
            <div className="text-yellow-700 text-sm font-semibold mb-2">Total Points</div>
            <div className="text-4xl font-bold text-yellow-900 mb-2">{rewardsPoints.toLocaleString()}</div>
            <div className="text-sm text-yellow-600">Redeem for discounts and free trips!</div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full bg-[#0077B6] text-white py-3 rounded-xl font-semibold hover:bg-[#005F8E] transition-all duration-300">
              View Rewards Catalog
            </button>
            <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300">
              Points History
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all duration-300 border-2 border-red-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
}