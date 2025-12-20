import React from 'react';
import { Check, Loader, Utensils,ShoppingBag, CheckCheck } from 'lucide-react';

const OrderTimeline = ({ statusHistory, currentStatus }) => {
  const allStatuses = [
    { key: 'pending', label: 'Pending', icon: <Loader size={18} /> },
    { key: 'accepted', label: 'Accepted', icon: <Check size={18} /> },
    { key: 'preparing', label: 'Preparing', icon: <Utensils size={18} /> },
    { key: 'ready', label: 'Ready for Pickup', icon: <ShoppingBag size={18} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCheck size={18} /> },
  ];

  const getStatusIndex = (status) => allStatuses.findIndex(s => s.key === status);
  const currentStatusIndex = getStatusIndex(currentStatus);

  if (currentStatus === 'cancelled') {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-red-700">Order Cancelled</h3>
        <p className="text-red-600">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="relative border-l border-gray-200">
        {allStatuses.map((status, index) => {
          const historyEntry = statusHistory.find(h => h.status === status.key);
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <li key={status.key} className="mb-8 ml-8">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white
                ${isCompleted ? 'bg-primary' : 'bg-gray-200'}
                ${isCurrent ? 'animate-pulse' : ''}
              `}
              >
                <div className={isCompleted ? 'text-white' : 'text-gray-500'}>
                  {status.icon}
                </div>
              </span>
              <h3
                className={`text-lg font-semibold ${
                  isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {status.label}
              </h3>
              {historyEntry && (
                <time className="block text-sm font-normal leading-none text-gray-500">
                  {new Date(historyEntry.timestamp).toLocaleString()}
                </time>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTimeline;