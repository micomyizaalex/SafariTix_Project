import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const DriverHeader: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold text-[#2B2D42]">Driver Portal</div>
      </div>
      <div>
        <button
          onClick={() => { signOut(); navigate('/app/login', { replace: true }); }}
          className="px-3 py-1 bg-[#0077B6] text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default DriverHeader;
