import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { Edit, Trash, Plus, Sparkles } from 'lucide-react'; // Added Sparkles icon
import DietaryIcon from '../../components/common/DietaryIcon';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'veg',
    imageUrl: '',
    isAvailable: true,
  });

  // Helper for displaying images in the list
  const getDisplayImage = (item) => {
    if (item.imageUrl) return item.imageUrl;
    return `https://image.pollinations.ai/prompt/delicious ${encodeURIComponent(item.name)} food?width=100&height=100&nologo=true`;
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/manager/menu');
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type || 'veg',
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        type: 'veg',
        imageUrl: '',
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, price: parseFloat(formData.price) };
    
    try {
      if (currentItem) {
        await apiClient.put(`/manager/menu/${currentItem._id}`, dataToSubmit);
        toast.success('Item updated');
      } else {
        await apiClient.post('/manager/menu', dataToSubmit);
        toast.success('Item created');
      }
      fetchMenu();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiClient.delete(`/manager/menu/${itemId}`);
        toast.success('Item deleted');
        fetchMenu();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={18} />
          Add New Item
        </Button>
      </div>

      {/* Menu Item List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <ul className="divide-y divide-gray-200">
          {menuItems.map((item) => (
            <li key={item._id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={getDisplayImage(item)} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-md object-cover bg-gray-100" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <DietaryIcon type={item.type} />
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                  </div>
                  <p className="text-gray-500">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button onClick={() => openModal(item)} className="text-primary hover:text-primary-dark p-2">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {menuItems.length === 0 && (
            <p className="text-center p-8 text-gray-500">No items on the menu yet.</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {currentItem ? 'Edit Menu Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="name" label="Name" name="name" value={formData.name} onChange={handleChange} required />
              <Input id="description" label="Description" name="description" value={formData.description} onChange={handleChange} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input id="price" label="Price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Dietary Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="egg">Egg</option>
                  </select>
                </div>
              </div>

              <div>
                <Input 
                  id="imageUrl" 
                  label="Image URL" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="Leave blank to auto-generate" 
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-purple-500"/>
                  AI will generate an image if left blank
                </p>
              </div>
              
              <div className="flex items-center pt-2">
                <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Available for ordering</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary">Save Item</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;