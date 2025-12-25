import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Utensils, Settings } from 'lucide-react';
import apiClient from '../../api/apiClient';

const ManagerLayout = () => {
  const [canteen, setCanteen] = useState(null);
  const activeClass = 'bg-primary-light/10 text-primary';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100';

  useEffect(() => {
    const fetchCanteen = async () => {
      try {
        const { data } = await apiClient.get('/manager/canteen');
        setCanteen(data);
      } catch (error) {
        console.error('Failed to load canteen details', error);
      }
    };
    fetchCanteen();
  }, []);

  return (
    <div>
      {/* Canteen Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {canteen?.name || 'Loading Canteen...'}
        </h1>
        <p className="text-gray-500 text-sm">Manager Portal</p>
      </div>

      {/* Manager Sub-navigation */}
      <nav className="flex items-center gap-2 mb-6 border-b border-gray-200">
        <NavLink
          to="/manager/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Orders</span>
        </NavLink>
        <NavLink
          to="/manager/menu"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <Utensils size={18} />
          <span>Menu</span>
        </NavLink>
        <NavLink
          to="/manager/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg ${
              isActive ? activeClass : inactiveClass
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default ManagerLayout;
