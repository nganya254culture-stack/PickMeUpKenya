import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { Bell, X, CheckCheck, Shield, Car, DollarSign, AlertCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, dismissNotification, markAllNotificationsAsRead } = useRide();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'safety':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'driver_alert':
        return <Car className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl border-l border-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-neutral-900">Trip Push Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              title="Mark all as read"
            >
              Mark Read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-xs">
              No notifications yet. You will receive live trip updates here.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all ${
                  n.read ? 'bg-white border-neutral-200 opacity-80' : 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-white rounded-lg border border-neutral-200 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{n.title}</div>
                      <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-mono">{n.timestamp}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="text-neutral-300 hover:text-neutral-500 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
