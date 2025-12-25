import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import {
  Utensils,
  Users,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

// A small component for displaying stats
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
    <div className="p-3 rounded-full bg-primary-light/10 text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);

const AdminPanel = () => {
  const [canteens, setCanteens] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [canteenForm, setCanteenForm] = useState({
    name: '',
    location: '',
    upiId: '',
  });
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    canteenId: '',
  });

  // Fetch both stats and canteens on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStats(true);
        // Fetch stats
        const statsRes = await apiClient.get('/admin/stats');
        setStats(statsRes.data);

        // Fetch canteens for dropdown
        const canteensRes = await apiClient.get('/student/canteens'); // Use public route
        setCanteens(canteensRes.data);
        if (canteensRes.data.length > 0) {
          setManagerForm((prev) => ({
            ...prev,
            canteenId: canteensRes.data[0]._id,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch admin data', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  const handleCanteenChange = (e) => {
    setCanteenForm({ ...canteenForm, [e.target.name]: e.target.value });
  };

  const handleManagerChange = (e) => {
    setManagerForm({ ...managerForm, [e.target.name]: e.target.value });
  };

  const handleCreateCanteen = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/canteens', canteenForm);
      toast.success('Canteen created successfully');
      setCanteenForm({ name: '', location: '', upiId: '' });
      // Re-fetch canteens
      const { data } = await apiClient.get('/student/canteens');
      setCanteens(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create canteen');
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/users/manager', managerForm);
      toast.success('Manager created successfully');
      setManagerForm({
        name: '',
        email: '',
        password: '',
        canteenId: canteens[0]?._id || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create manager');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* --- NEW Statistics Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Canteens"
          value={stats?.canteenCount ?? 0}
          icon={<Utensils size={24} />}
          loading={loadingStats}
        />
        <StatCard
          title="Total Students"
          value={stats?.studentCount ?? 0}
          icon={<Users size={24} />}
          loading={loadingStats}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orderCount ?? 0}
          icon={<ClipboardList size={24} />}
          loading={loadingStats}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toFixed(2) ?? '0.00'}`}
          icon={<DollarSign size={24} />}
          loading={loadingStats}
        />
      </div>

      {/* --- Existing Management Forms --- */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Management Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Canteen */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Create New Canteen</h3>
          <form onSubmit={handleCreateCanteen} className="space-y-4">
            <Input
              id="name"
              label="Canteen Name"
              name="name"
              value={canteenForm.name}
              onChange={handleCanteenChange}
              required
            />
            <Input
              id="location"
              label="Location"
              name="location"
              value={canteenForm.location}
              onChange={handleCanteenChange}
              required
            />
            <Input
              id="upiId"
              label="UPI ID"
              name="upiId"
              value={canteenForm.upiId}
              onChange={handleCanteenChange}
            />
            <Button type="submit" variant="primary">
              Create Canteen
            </Button>
          </form>
        </div>

        {/* Create Manager */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Create New Manager</h3>
          <form onSubmit={handleCreateManager} className="space-y-4">
            <Input
              id="managerName"
              label="Full Name"
_            name="name"
              value={managerForm.name}
              onChange={handleManagerChange}
              required
            />
            <Input
              id="managerEmail"
              label="Email"
              name="email"
              type="email"
              value={managerForm.email}
              onChange={handleManagerChange}
              required
            />
            <Input
              id="managerPassword"
              label="Password"
              name="password"
              type="password"
              value={managerForm.password}
              onChange={handleManagerChange}
              required
            />
            <div>
              <label
                htmlFor="canteenId"
                className="block text-sm font-medium text-gray-700"
              >
                Assign to Canteen
              </label>
              <select
                id="canteenId"
                name="canteenId"
                value={managerForm.canteenId}
                onChange={handleManagerChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {canteens.length === 0 ? (
                  <option value="">Create a canteen first</option>
                ) : (
                  canteens.map((canteen) => (
                    <option key={canteen._id} value={canteen._id}>
                      {canteen.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <Button type="submit" variant="primary">
              Create Manager
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;