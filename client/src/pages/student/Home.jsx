import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import CanteenCard from '../../components/student/CanteenCard';
import SearchBar from '../../components/common/SearchBar'; // Import
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const Home = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/student/canteens');
        setCanteens(data);
      } catch (error) {
        toast.error('Failed to fetch canteens');
      } finally {
        setLoading(false);
      }
    };
    fetchCanteens();
  }, []);

  // Filter logic
  const filteredCanteens = useMemo(() => {
    return canteens.filter((canteen) =>
      canteen.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [canteens, searchTerm]);

  if (loading) return <Spinner />;

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Choose a Canteen
      </h1>

      {/* Search Bar */}
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search canteens..." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCanteens.length > 0 ? (
          filteredCanteens.map((canteen) => (
            <CanteenCard key={canteen._id} canteen={canteen} />
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-2">
            No canteens found matching "{searchTerm}".
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;