import React from 'react';
import { Package, HardDrive, Box, Activity, Wrench, Search, BarChart2, ShieldCheck } from 'lucide-react';
import { formatLocation } from './NodesUtils';

const NodesTabs = ({
  user, isAdmin, activeTab, setActiveTab, searchQuery, setSearchQuery,
  setPagination, data, loading, errors, setSelectedItem, setFormData,
  setShowModal, handleAI, filters, setFilters, pagination, loadData,
  children
}) => {
  const tabs = [
    { 
      id: 'nodes', 
      name: 'Nodes', 
      icon: <HardDrive size={18} />, 
      roles: ['admin', 'node'],
      stats: data.nodes?.length || 0,
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 'inventory', 
      name: 'Inventory', 
      icon: <Box size={18} />, 
      roles: ['admin', 'node'],
      stats: data.inventory?.length || 0,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: <Activity size={18} />, 
      roles: ['admin', 'node'],
      stats: data.performance?.length || 0,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      id: 'routes', 
      name: 'Routes', 
      icon: <Package size={18} />, 
      roles: ['admin', 'node'],
      stats: data.routes?.length || 0,
      gradient: 'from-amber-500 to-yellow-500'
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: <Wrench size={18} />, 
      roles: ['admin', 'node'],
      stats: data.maintenanceLogs?.length || 0,
      gradient: 'from-rose-500 to-pink-500'
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1, page_size: 10 }));
    setSelectedItem(null);
    loadData(tabId, true);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <Package className="text-indigo-600" /> Node Management
            {isAdmin && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <ShieldCheck className="mr-1" size={14} /> Admin
              </span>
            )}
          </h1>
          {user?.location && (
            <p className="text-sm text-gray-500 mt-1">
              Location: <span className="font-medium">{formatLocation(user.location)}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg shadow-sm">
            <BarChart2 size={18} className="text-gray-500" />
            <span className="text-sm font-medium">
              {activeTab}
            </span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
                loadData(activeTab, true);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs
          .filter(tab => tab.roles.includes(user?.user_type) || isAdmin)
          .map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 whitespace-nowrap shadow-sm ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md` 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tab.icon} 
              <span>{tab.name}</span>
            </button>
          ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        {React.Children.map(children, child => {
          return React.cloneElement(child, {
            activeTab,
            user,
            isAdmin,
            data,
            loading,
            errors,
            searchQuery,
            setSearchQuery,
            setSelectedItem,
            setFormData,
            setShowModal,
            handleAI,
            filters,
            setFilters,
            pagination,
            setPagination,
            loadData
          });
        })}
      </div>
    </div>
  );
};

export default NodesTabs;