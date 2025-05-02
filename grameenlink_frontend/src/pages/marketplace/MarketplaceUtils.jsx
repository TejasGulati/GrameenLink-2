import React from 'react';
import { Loader, Archive, Package, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const DataTable = ({ 
  items, 
  columns, 
  actions = [], 
  onRowClick,
  emptyMessage = 'No data available',
  loading = false
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center">
                <Loader className="animate-spin mx-auto h-8 w-8 text-indigo-600" />
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                <Archive className="mx-auto h-8 w-8 mb-2" />
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr 
                key={item.id || index}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-1">
                    {actions.map((action, i) => (
                      (!action.condition || action.condition(item)) && (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.handler(item);
                          }}
                          className={`p-1 rounded-md ${action.color} hover:opacity-80`}
                          title={action.tooltip}
                          disabled={action.disabled?.(item) || false}
                        >
                          <action.icon size={16} />
                        </button>
                      )
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount || 0);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const statusBadge = (status, type) => {
  const statusMap = {
    order: {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> },
      processing: { color: 'bg-purple-100 text-purple-800', icon: <Package size={14} /> },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: <Package size={14} /> },
      delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
      returned: { color: 'bg-gray-100 text-gray-800', icon: <Package size={14} /> }
    },
    payment: {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      partial: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> },
      paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: <CheckCircle size={14} /> },
      failed: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> }
    },
    demand: {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      fulfilled: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      low: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      medium: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> },
      high: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle size={14} /> },
      urgent: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} /> }
    },
    review: {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> }
    },
    product: {
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      inactive: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> }
    }
  };

  const statusInfo = statusMap[type]?.[status.toLowerCase()] || { 
    color: 'bg-gray-100 text-gray-800', 
    icon: <AlertTriangle size={14} />
  };
  
  return (
    <span 
      className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusInfo.color}`}
    >
      {statusInfo.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const formatLocation = (location) => {
  if (!location) return 'N/A';
  const parts = location.split(',').map(part => part.trim()).filter(part => part);
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};

export const inventoryStatus = (quantity, threshold = 10) => {
  if (quantity <= 0) {
    return { text: 'Out of Stock', color: 'text-red-600', icon: <XCircle size={14} /> };
  }
  if (quantity <= threshold) {
    return { text: 'Low Stock', color: 'text-yellow-600', icon: <AlertTriangle size={14} /> };
  }
  return { text: 'In Stock', color: 'text-green-600', icon: <CheckCircle size={14} /> };
};

export const calculateMargin = (price, cost) => {
  if (!cost || cost <= 0) return 0;
  return ((price - cost) / cost) * 100;
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateTime = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const MarketplaceUtils = {
  DataTable,
  formatCurrency,
  statusBadge,
  formatLocation,
  inventoryStatus,
  calculateMargin,
  formatDate,
  formatDateTime
};

export default MarketplaceUtils;