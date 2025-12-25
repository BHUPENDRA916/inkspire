import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const CanteenSettings = () => {
  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    upiId: '',
    isOpen: true,
  });

  useEffect(() => {
    const fetchCanteen = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/manager/canteen');
        setCanteen(data);
        setFormData({
          upiId: data.upiId || '',
          isOpen: data.isOpen,
        });
      } catch (error) {
        toast.error('Failed to fetch canteen settings');
      } finally {
        setLoading(false);
      }
    };
    fetchCanteen();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/manager/canteen', formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Canteen Settings</h1>
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border space-y-4">
        <Input 
          id="upiId"
          label="UPI ID (VPA)"
          name="upiId"
          value={formData.upiId}
          onChange={handleChange}
          placeholder="yourcanteen@okbank"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isOpen"
            name="isOpen"
            checked={formData.isOpen}
            onChange={handleChange}
            className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-900">
            Canteen is open for orders
          </label>
        </div>
        
        <Button type="submit" variant="primary">
          Save Settings
        </Button>
      </form>
    </div>
  );
};

export default CanteenSettings;