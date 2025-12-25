import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import MenuItemCard from '../../components/student/MenuItemCard';
import Spinner from '../../components/common/Spinner';
import SearchBar from '../../components/common/SearchBar'; // Import
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Filter } from 'lucide-react';
import { useDispatch } from 'react-redux'; // Use Dispatch for Redux
import { addToCart } from '../../store/cartSlice'; // Import Action

const CanteenMenu = () => {
  const { id: canteenId } = useParams();
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, veg, non-veg
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high

  useEffect(() => {
    const fetchCanteenAndMenu = async () => {
      try {
        setLoading(true);
        const [canteenRes, menuRes] = await Promise.all([
          apiClient.get(`/student/canteens/${canteenId}`),
          apiClient.get(`/student/canteens/${canteenId}/menu`),
        ]);
        setCanteen(canteenRes.data);
        setMenuItems(menuRes.data);
      } catch (error) {
        toast.error('Failed to fetch canteen details');
      } finally {
        setLoading(false);
      }
    };
    fetchCanteenAndMenu();
  }, [canteenId]);

  // --- ADVANCED FILTERING LOGIC ---
  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    // 1. Search
    if (searchTerm) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Type Filter (Veg/Non-Veg)
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }

    // 3. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [menuItems, searchTerm, filterType, sortBy]);
  // --------------------------------

  const handleAddToCart = (item) => {
     // Note: In the Redux version we defined, we pass { item, canteenInfo }
    dispatch(addToCart({ item, canteenInfo: canteen }));
  };

  if (loading) return <Spinner />;
  if (!canteen) return <p>Canteen not found.</p>;

  return (
    <div className="pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Back to Canteens
      </Link>
      
      {/* Canteen Header */}
      <div className="relative mb-6">
        <img
          src={canteen.imageUrl}
          alt={canteen.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent rounded-lg p-4 flex flex-col justify-end">
          <h1 className="text-3xl font-bold text-white">{canteen.name}</h1>
          <p className="text-gray-200 flex items-center gap-2">
            <MapPin size={16} />
            {canteen.location}
          </p>
        </div>
      </div>

      {/* --- FILTERS SECTION --- */}
      <div className="mb-6 space-y-3">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search for food..." 
        />
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filters */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['all', 'veg', 'non-veg'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                  filterType === type
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto px-3 py-1.5 text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
          >
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Menu Items List */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Menu ({filteredItems.length})
      </h2>
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Filter size={40} className="mx-auto mb-2 opacity-20" />
            <p>No items found matching your filters.</p>
            <button 
                onClick={() => {setSearchTerm(''); setFilterType('all');}}
                className="text-primary font-medium mt-2 hover:underline"
            >
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenMenu;