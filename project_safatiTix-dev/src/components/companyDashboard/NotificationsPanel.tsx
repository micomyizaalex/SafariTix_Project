import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { NotificationItem } from './types';

interface Props { notifications: NotificationItem[] }

export const NotificationsPanel: React.FC<Props> = ({ notifications }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-[#0077B6]" />
        Alerts & Notifications
      </h2>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className={`border-l-4 pl-3 py-2 ${
            notif.type === 'urgent' ? 'border-red-500 bg-red-50' :
            notif.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
              </div>
              {notif.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />}
            </div>
            <span className="text-xs text-gray-500 mt-1 block">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
